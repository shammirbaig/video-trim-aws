import { useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

interface SubscriptionStatus {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  planName?: string;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      setSubscription({
        isActive: false,
        isLoading: false,
        error: null
      });
      return;
    }

    // Check subscription status from Clerk metadata (stateless)
    const hasActiveSubscription = 
      user.publicMetadata?.subscription === 'active' || 
      user.privateMetadata?.stripeSubscriptionStatus === 'active';

    setSubscription({
      isActive: hasActiveSubscription,
      isLoading: false,
      error: null,
      planName: hasActiveSubscription ? 'VideoTrim Pro' : undefined
    });
  }, [user, isLoaded]);

  return subscription;
};