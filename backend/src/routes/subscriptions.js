const express = require('express');
const Stripe = require('stripe');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/subscriptions/create-checkout-session
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    
    let customer;
    
    // Check if user already has a Stripe customer ID
    if (req.user.subscription.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.subscription.stripeCustomerId);
    } else {
      // Create new Stripe customer
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.fullName,
        metadata: {
          clerkId: req.user.clerkId,
          userId: req.user._id.toString()
        }
      });
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.stripeCustomerId': customer.id
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/subscribe`,
      metadata: {
        clerkId: req.user.clerkId,
        userId: req.user._id.toString()
      }
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    logger.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    });
  }
});

// POST /api/subscriptions/create-portal-session
router.post('/create-portal-session', authenticate, async (req, res) => {
  try {
    if (!req.user.subscription.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/subscribe`,
    });

    res.json({
      success: true,
      data: {
        url: session.url
      }
    });
  } catch (error) {
    logger.error('Create portal session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portal session'
    });
  }
});

// GET /api/subscriptions/status
router.get('/status', authenticate, async (req, res) => {
  try {
    let subscriptionData = {
      status: req.user.subscription.status,
      hasActiveSubscription: req.user.hasActiveSubscription,
      currentPeriodEnd: req.user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: req.user.subscription.cancelAtPeriodEnd
    };

    // If user has a Stripe subscription, get latest data
    if (req.user.subscription.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          req.user.subscription.stripeSubscriptionId
        );
        
        subscriptionData = {
          ...subscriptionData,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          hasActiveSubscription: ['active', 'trialing'].includes(subscription.status)
        };
      } catch (stripeError) {
        logger.warn('Failed to fetch Stripe subscription:', stripeError);
      }
    }

    res.json({
      success: true,
      data: subscriptionData
    });
  } catch (error) {
    logger.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status'
    });
  }
});

module.exports = router;