const express = require('express');
const Stripe = require('stripe');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/webhooks/stripe
router.post('/stripe', async (req, res) => {
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
        await handleSubscriptionUpdate(event.data.object);
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

async function handleSubscriptionUpdate(subscription) {
  try {
    const user = await User.findOne({
      'subscription.stripeCustomerId': subscription.customer
    });

    if (!user) {
      logger.warn(`User not found for Stripe customer: ${subscription.customer}`);
      return;
    }

    const updateData = {
      'subscription.stripeSubscriptionId': subscription.id,
      'subscription.status': subscription.status,
      'subscription.planId': subscription.items.data[0]?.price?.id,
      'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
      'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
      'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end
    };

    await User.findByIdAndUpdate(user._id, updateData);
    
    logger.info(`Subscription updated for user ${user.clerkId}: ${subscription.status}`);
  } catch (error) {
    logger.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const user = await User.findOne({
      'subscription.stripeSubscriptionId': subscription.id
    });

    if (!user) {
      logger.warn(`User not found for subscription: ${subscription.id}`);
      return;
    }

    await User.findByIdAndUpdate(user._id, {
      'subscription.status': 'cancelled',
      'subscription.cancelAtPeriodEnd': true
    });
    
    logger.info(`Subscription cancelled for user ${user.clerkId}`);
  } catch (error) {
    logger.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    const user = await User.findOne({
      'subscription.stripeCustomerId': invoice.customer
    });

    if (!user) {
      logger.warn(`User not found for customer: ${invoice.customer}`);
      return;
    }

    // Update subscription status to active
    await User.findByIdAndUpdate(user._id, {
      'subscription.status': 'active'
    });
    
    logger.info(`Payment succeeded for user ${user.clerkId}`);
  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    const user = await User.findOne({
      'subscription.stripeCustomerId': invoice.customer
    });

    if (!user) {
      logger.warn(`User not found for customer: ${invoice.customer}`);
      return;
    }

    // Update subscription status to past_due
    await User.findByIdAndUpdate(user._id, {
      'subscription.status': 'past_due'
    });
    
    logger.info(`Payment failed for user ${user.clerkId}`);
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

module.exports = router;