const express = require('express');
const { requireAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/auth/me - Get current user info (stateless)
router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          clerkId: req.user.clerkId,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          fullName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
          profileImage: req.user.profileImage,
          hasActiveSubscription: req.user.hasActiveSubscription
        }
      }
    });
  } catch (error) {
    logger.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// GET /api/auth/subscription - Get subscription status (stateless)
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        subscription: {
          hasActiveSubscription: req.user.hasActiveSubscription,
          status: req.user.hasActiveSubscription ? 'active' : 'inactive'
        }
      }
    });
  } catch (error) {
    logger.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription information'
    });
  }
});

module.exports = router;