const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'inactive'
    },
    stripeCustomerId: {
      type: String,
      sparse: true
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true
    },
    planId: {
      type: String
    },
    currentPeriodStart: {
      type: Date
    },
    currentPeriodEnd: {
      type: Date
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  usage: {
    videosProcessed: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0 // in bytes
    }
  },
  preferences: {
    defaultFormat: {
      type: String,
      default: '1080p'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Virtual for subscription status
userSchema.virtual('hasActiveSubscription').get(function() {
  return this.subscription.status === 'active' && 
         this.subscription.currentPeriodEnd && 
         this.subscription.currentPeriodEnd > new Date();
});

// Index for efficient queries
// userSchema.index({ 'subscription.stripeCustomerId': 1 });
// userSchema.index({ 'subscription.status': 1 });
// userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);