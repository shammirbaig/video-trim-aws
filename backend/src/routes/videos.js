const express = require("express");
const { body, param, query } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { requireAuth, requireSubscription } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const videoService = require("../services/videoService");
const s3Service = require("../config/aws");
const Video = require("../models/Video");
const logger = require("../utils/logger");

const router = express.Router();

// Rate limiting for video processing
const processLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 videos per hour per user
  message: {
    success: false,
    message: "Too many video processing requests. Please try again later.",
  },
  keyGenerator: (req) => req.user?.clerkId || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const validateVideoUrl = [
  body("url")
    .isURL()
    .withMessage("Valid URL is required")
    .custom((value) => {
      const videoId = videoService.extractVideoId(value);
      if (!videoId) {
        throw new Error("Valid YouTube URL is required");
      }
      return true;
    }),
];

const validateTrimSettings = [
  body("startTime")
    .isFloat({ min: 0 })
    .withMessage("Start time must be a positive number"),
  body("endTime")
    .isFloat({ min: 0 })
    .withMessage("End time must be a positive number")
    .custom((value, { req }) => {
      if (value <= req.body.startTime) {
        throw new Error("End time must be greater than start time");
      }
      if (value - req.body.startTime > 600) {
        // 10 minutes max
        throw new Error("Trim duration cannot exceed 10 minutes");
      }
      return true;
    }),
  body("format")
    .isIn(["4k", "1080p", "720p", "480p", "360p", "mp3"])
    .withMessage("Invalid format specified"),
];

// GET /api/videos/validate - Validate YouTube URL and get video info
router.get(
  "/validate",
  requireAuth,
  [
    query("url")
      .isURL()
      .withMessage("Valid URL is required")
      .custom((value) => {
        const videoId = videoService.extractVideoId(value);
        if (!videoId) {
          throw new Error("Valid YouTube URL is required");
        }
        return true;
      }),
    validate,
  ],
  async (req, res) => {
    try {
      const { url } = req.query;

      logger.info(`Validating video URL for user ${req.user.clerkId}: ${url}`);

      const videoInfo = await videoService.getVideoInfo(url);

      res.json({
        success: true,
        data: {
          valid: true,
          videoInfo,
        },
      });
    } catch (error) {
      logger.error("Video validation error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Invalid video URL",
      });
    }
  }
);

// POST /api/videos/trim - Start video trimming process
router.post(
  "/trim",
  requireAuth,
  requireSubscription,
  processLimit,
  [...validateVideoUrl, ...validateTrimSettings, validate],
  async (req, res) => {
    try {
      const { url, startTime, endTime, format } = req.body;

      logger.info(`Starting video trim for user ${req.user.clerkId}`, {
        url,
        startTime,
        endTime,
        format,
      });

      // Get video info first
      const videoInfo = await videoService.getVideoInfo(url);

      // Validate trim settings against video duration
      if (endTime > videoInfo.duration) {
        return res.status(400).json({
          success: false,
          message: "End time cannot exceed video duration",
        });
      }

      // Create video record
      const video = new Video({
        clerkUserId: req.user.clerkId,
        userEmail: req.user.email,
        originalUrl: url,
        videoId: videoInfo.videoId,
        title: videoInfo.title,
        duration: videoInfo.duration,
        trimSettings: {
          startTime,
          endTime,
        },
        format,
        status: "pending",
        metadata: {
          userAgent: req.get("User-Agent"),
          ipAddress: req.ip,
        },
      });

      await video.save();

      // Start processing asynchronously
      setImmediate(async () => {
        try {
          video.status = "processing";
          await video.save();

            function createProgressSaver(videoId) {
              return async (progress) => {
                try {
                  await Video.updateOne(
                    { _id: videoId },
                    { $set: { processingProgress: progress } }
                  );
                } catch (err) {
                  logger.error('Mongo update error:', err);
                }
              };
            }
          const result = await videoService.processVideo({
            url,
            startTime,
            endTime,
            format,
            videoId: video._id,
            title: videoInfo.title,
          }, createProgressSaver(video._id));

          // Update video record with S3 data
          video.status = "completed";
          video.processingProgress = 100;
          video.s3Data = {
            key: result.s3Key,
            location: result.s3Location,
            size: result.size,
            contentType: result.contentType,
          };
          video.filename = result.filename;
          video.metadata.processingTime =
            Date.now() - video.createdAt.getTime();

          await video.save();

          logger.info(
            `Video processing completed for ${req.user.clerkId}: ${video._id}`
          );
        } catch (error) {
          video.status = "failed";
          video.error = {
            message: error.message,
            code: "PROCESSING_ERROR",
          };
          await video.save();

          logger.error(
            `Video processing failed for ${req.user.clerkId}: ${video._id}`,
            error
          );
        }
      });

      res.status(201).json({
        success: true,
        data: {
          videoId: video._id,
          status: video.status,
          message: "Video processing started",
        },
      });
    } catch (error) {
      logger.error("Video trim error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start video processing",
      });
    }
  }
);

// GET /api/videos/:id/status - Get processing status
router.get(
  "/:id/status",
  requireAuth,
  [param("id").isMongoId().withMessage("Invalid video ID"), validate],
  async (req, res) => {
    try {
      const video = await Video.findOne({
        _id: req.params.id,
        clerkUserId: req.user.clerkId,
      }).select("status processingProgress error isAvailable expiresAt");

      if (!video) {
        return res.status(404).json({
          success: false,
          message: "Video not found",
        });
      }

      res.json({
        success: true,
        data: {
          id: video._id,
          status: video.status,
          progress: video.processingProgress,
          error: video.error,
          isAvailable: video.isAvailable,
          expiresAt: video.expiresAt,
        },
      });
    } catch (error) {
      logger.error("Get video status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get video status",
      });
    }
  }
);

// GET /api/videos/:id/download - Generate download URL
router.get(
  "/:id/download",
  requireAuth,
  [param("id").isMongoId().withMessage("Invalid video ID"), validate],
  async (req, res) => {
    try {
      const video = await Video.findOne({
        _id: req.params.id,
        clerkUserId: req.user.clerkId,
      });

      if (!video) {
        return res.status(404).json({
          success: false,
          message: "Video not found",
        });
      }

      // if (!video.isAvailable) {
      //   return res.status(410).json({
      //     success: false,
      //     message: "Video is no longer available for download",
      //   });
      // }

      // Ensure S3 key exists before generating pre-signed URL
      if (!video.s3Data || !video.s3Data.key) {
        return res.status(500).json({
          success: false,
          message: "Video file is not available for download",
        });
      }

      // Generate pre-signed URL
      const downloadUrl = await videoService.generateDownloadUrl(
        video.s3Data.key,
        video.filename
      );

      // Update download count
      video.downloadCount += 1;
      await video.save();

      res.json({
        success: true,
        data: {
          downloadUrl,
          filename: video.filename,
          size: video.s3Data.size,
          expiresIn: 3600, // 1 hour
        },
      });

      logger.info(
        `Download URL generated for user ${req.user.clerkId}: ${video._id}`
      );
    } catch (error) {
      logger.error("Download URL generation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate download URL",
      });
    }
  }
);

// GET /api/videos/history - Get user's video history
router.get(
  "/history",
  requireAuth,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("status")
      .optional()
      .isIn(["pending", "processing", "completed", "failed", "expired"])
      .withMessage("Invalid status"),
    query("format")
      .optional()
      .isIn(["4k", "1080p", "720p", "480p", "360p", "mp3"])
      .withMessage("Invalid format"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "title", "duration", "format"])
      .withMessage("Invalid sort field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sort order"),
    validate,
  ],
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        format,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build query
      const query = { clerkUserId: req.user.clerkId };
      if (status) query.status = status;
      if (format) query.format = format;

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Execute query with pagination
      const videos = await Video.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select("-s3Data.key -metadata") // Don't expose sensitive data
        .lean();

      const total = await Video.countDocuments(query);

      // Calculate statistics
      const stats = await Video.aggregate([
        { $match: { clerkUserId: req.user.clerkId } },
        {
          $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            completedVideos: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            totalSize: {
              $sum: { $ifNull: ["$s3Data.size", 0] },
            },
            totalDownloads: { $sum: "$downloadCount" },
          },
        },
      ]);

      res.json({
        success: true,
        data: {
          videos,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
          stats: stats[0] || {
            totalVideos: 0,
            completedVideos: 0,
            totalSize: 0,
            totalDownloads: 0,
          },
        },
      });
    } catch (error) {
      logger.error("Get video history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get video history",
      });
    }
  }
);

// DELETE /api/videos/:id - Delete video record and S3 file
router.delete(
  "/:id",
  requireAuth,
  [param("id").isMongoId().withMessage("Invalid video ID"), validate],
  async (req, res) => {
    try {
      const video = await Video.findOne({
        _id: req.params.id,
        clerkUserId: req.user.clerkId,
      });

      if (!video) {
        return res.status(404).json({
          success: false,
          message: "Video not found",
        });
      }

      // Delete from S3 if exists
      if (video.s3Data?.key) {
        try {
          await s3Service.deleteVideo(video.s3Data.key);
        } catch (s3Error) {
          logger.warn(
            `Failed to delete S3 object: ${video.s3Data.key}`,
            s3Error
          );
        }
      }

      // Delete video record
      await Video.findByIdAndDelete(req.params.id);

      logger.info(`Video deleted by user ${req.user.clerkId}: ${video._id}`);

      res.json({
        success: true,
        message: "Video deleted successfully",
      });
    } catch (error) {
      logger.error("Delete video error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete video",
      });
    }
  }
);

module.exports = router;
