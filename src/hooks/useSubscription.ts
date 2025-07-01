import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

interface SubscriptionStatus {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  planName?: string;
  expiresAt?: string;
  status?: string;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Wait for Clerk to fully load
    if (!isLoaded) {
      setSubscription(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // If not signed in, set inactive subscription
    if (!isSignedIn || !user) {
      setSubscription({
        isActive: false,
        isLoading: false,
        error: null
      });
      return;
    }

    try {
      // Check subscription status from Clerk metadata (stateless)
      const publicMeta = user.publicMetadata || {};
      const privateMeta = user.privateMetadata || {};
      
      const hasActiveSubscription = 
        publicMeta.subscription === 'active' || 
        privateMeta.stripeSubscriptionStatus === 'active' ||
        publicMeta.stripeSubscriptionStatus === 'active';

      const subscriptionStatus = publicMeta.subscriptionStatus || privateMeta.subscriptionStatus || 'inactive';
      const expiresAt = publicMeta.subscriptionExpiresAt || privateMeta.subscriptionExpiresAt;

      setSubscription({
        isActive: hasActiveSubscription,
        isLoading: false,
        error: null,
        planName: hasActiveSubscription ? 'VideoTrim Pro' : undefined,
        status: subscriptionStatus,
        expiresAt: expiresAt
      });

      console.log('Subscription check:', {
        isSignedIn,
        userId: user.id,
        publicMeta,
        privateMeta,
        hasActiveSubscription
      });

    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({
        isActive: false,
        isLoading: false,
        error: 'Failed to check subscription status'
      });
    }
  }, [user, isLoaded, isSignedIn]);

  return subscription;
};