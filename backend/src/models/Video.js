const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  // User identification (stateless)
  clerkUserId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  
  // Video information
  originalUrl: {
    type: String,
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: Number,
    required: true
  },
  
  // Trim settings
  trimSettings: {
    startTime: {
      type: Number,
      required: true,
      min: 0
    },
    endTime: {
      type: Number,
      required: true
    },
    duration: {
      type: Number
    }
  },
  
  // Output format
  format: {
    type: String,
    required: true,
    enum: ['4k', '1080p', '720p', '480p', '360p', 'mp3']
  },
  
  // Processing status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending',
    index: true
  },
  processingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // S3 storage information
  s3Data: {
    key: String,
    location: String,
    size: Number,
    contentType: String
  },
  
  // Download information
  filename: {
    type: String
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    index: true
  },
  
  // Error information
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  },
  
  // Processing metadata
  metadata: {
    processingTime: Number,
    originalSize: Number,
    compressionRatio: Number,
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file size in human readable format
videoSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.s3Data?.size) return 'Unknown';
  
  const bytes = this.s3Data.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for trim duration formatted
videoSchema.virtual('trimDurationFormatted').get(function() {
  const duration = this.trimSettings.duration || 0;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for availability
videoSchema.virtual('isAvailable').get(function() {
  return this.status === 'completed' && 
         this.expiresAt > new Date() && 
         this.s3Data?.key;
});

// Pre-save middleware to calculate trim duration
videoSchema.pre('save', function(next) {
  if (this.trimSettings.startTime !== undefined && this.trimSettings.endTime !== undefined) {
    this.trimSettings.duration = this.trimSettings.endTime - this.trimSettings.startTime;
  }
  next();
});

// // Indexes for efficient queries
// videoSchema.index({ clerkUserId: 1, createdAt: -1 });
// videoSchema.index({ status: 1, createdAt: -1 });
// videoSchema.index({ expiresAt: 1 });
// videoSchema.index({ videoId: 1 });
// videoSchema.index({ userEmail: 1 });

// TTL index for automatic cleanup of expired videos
videoSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Video', videoSchema);