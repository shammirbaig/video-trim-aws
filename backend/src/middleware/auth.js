const { clerkMiddleware, getAuth ,requireAuth,clerkClient}=require('@clerk/express');
const User = require('../models/User');
const logger = require('../utils/logger');

// 1. Attach `req.auth` by validating JWT/session
const clerkAuth = clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

// 2. Enrich DB user from Clerk
async function enrichUser(req, res, next) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses
      .find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || '';

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = await User.create({
        clerkId: userId,
        email: primaryEmail,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        profileImage: clerkUser.imageUrl,
      });
      logger.info(`Created user ${userId}`);
    } else {
      let updated = false;
      if (user.email !== primaryEmail) { user.email = primaryEmail; updated = true; }
      if (user.firstName !== clerkUser.firstName) { user.firstName = clerkUser.firstName; updated = true; }
      if (user.lastName !== clerkUser.lastName) { user.lastName = clerkUser.lastName; updated = true; }
      if (user.profileImage !== clerkUser.imageUrl) { user.profileImage = clerkUser.imageUrl; updated = true; }
      if (updated) await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('enrichUser error:', err);
    res.status(500).json({ success: false, message: 'User sync failed' });
  }
}

// 3. Subscription guard
function requireSubscription(req, res, next) {
  const user = req.user;
  if (!user?.hasActiveSubscription) {
    return res.status(403).json({
      success: false,
      code: 'SUBSCRIPTION_REQUIRED',
      message: 'Active subscription required',
      subscriptionStatus: user.subscription?.status,
    });
  }
  next();
}

// Export the middleware functions
module.exports = {
  clerkAuth,
  enrichUser,
  requireSubscription,
};
 