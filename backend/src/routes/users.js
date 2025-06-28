const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Video = require('../models/Video');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/users/stats - Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get video statistics
    const videoStats = await Video.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          completedVideos: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalSize: {
            $sum: { $ifNull: ['$outputFile.size', 0] }
          },
          totalDownloads: { $sum: '$downloadCount' },
          avgProcessingTime: {
            $avg: '$metadata.processingTime'
          }
        }
      }
    ]);

    // Get format distribution
    const formatStats = await Video.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: '$format',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent activity
    const recentVideos = await Video.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt format')
      .lean();

    const stats = videoStats[0] || {
      totalVideos: 0,
      completedVideos: 0,
      totalSize: 0,
      totalDownloads: 0,
      avgProcessingTime: 0
    };

    res.json({
      success: true,
      data: {
        overview: {
          ...stats,
          successRate: stats.totalVideos > 0 ? 
            Math.round((stats.completedVideos / stats.totalVideos) * 100) : 0
        },
        formatDistribution: formatStats,
        recentActivity: recentVideos,
        subscription: {
          status: req.user.subscription.status,
          hasActiveSubscription: req.user.hasActiveSubscription,
          currentPeriodEnd: req.user.subscription.currentPeriodEnd
        }
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

module.exports = router;