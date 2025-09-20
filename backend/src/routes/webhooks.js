const express = require('express');
const Stripe = require('stripe');
const User = require('../models/User');
const logger = require('../utils/logger');
const axios = require('axios');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Clerk API wrapper
async function updateClerkUser(clerkId, metadata = {}) {
  try {
    await axios.patch(
      `https://api.clerk.com/v1/users/${clerkId}/metadata`,
      { public_metadata: metadata },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    logger.info(`Clerk user updated: ${clerkId}`);
  } catch (error) {
    logger.error(`Failed to update Clerk user ${clerkId}: ${error.message}`);
    throw error;
  }
}

// ✅ Core subscription update
async function syncSubscriptionToUser(subscription) {
  const { customer, id, status, items, current_period_start, current_period_end, cancel_at_period_end } = subscription;

  const planId = items?.data[0]?.price?.id || null;

  const user = await User.findOne({ 'subscription.stripeCustomerId': customer });
  
  if (!user) {
    logger.warn(`User not found for Stripe customer: ${customer}`);
    return;
  }

  const updateData = {
    'subscription.stripeSubscriptionId': id,
    'subscription.status': status,
    'subscription.planId': planId,
    'subscription.currentPeriodStart': current_period_start ? new Date(current_period_start * 1000) : undefined,
    'subscription.currentPeriodEnd': current_period_end ? new Date(current_period_end * 1000) : undefined,
    'subscription.cancelAtPeriodEnd': cancel_at_period_end,
  };

  await User.findByIdAndUpdate(user._id, updateData);

  // Sync with Clerk
  await updateClerkUser(user.clerkId, {
    stripeCustomerId: customer,
    stripeSubscriptionId: id,
    stripeStatus: status,
    stripePlanId: planId,
  });

  logger.info(`Subscription synced for user ${user.clerkId}: ${status}`);
}

// ✅ Event Handlers
async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  if (!user) {
    logger.warn(`User not found for deleted subscription: ${subscription.id}`);
    return;
  }

  await User.findByIdAndUpdate(user._id, {
    'subscription.status': 'cancelled',
    'subscription.cancelAtPeriodEnd': true,
  });

  await updateClerkUser(user.clerkId, {
    stripeSubscriptionId: subscription.id,
    stripeStatus: 'cancelled',
  });

  logger.info(`Subscription cancelled for user ${user.clerkId}`);
}

async function handlePaymentSucceeded(invoice) {
  const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
  if (!user) {
    logger.warn(`User not found for payment success: ${invoice.customer}`);
    return;
  }

  await User.findByIdAndUpdate(user._id, { 'subscription.status': 'active' });

  await updateClerkUser(user.clerkId, {
    stripeStatus: 'active',
  });

  logger.info(`Payment succeeded → user ${user.clerkId} active`);
}

async function handlePaymentFailed(invoice) {
  const user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
  if (!user) {
    logger.warn(`User not found for payment failure: ${invoice.customer}`);
    return;
  }

  await User.findByIdAndUpdate(user._id, { 'subscription.status': 'past_due' });

  await updateClerkUser(user.clerkId, {
    stripeStatus: 'past_due',
  });

  logger.info(`Payment failed → user ${user.clerkId} past_due`);
}

// ✅ Webhook Endpoint
// /api/webhooks/stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await syncSubscriptionToUser(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
