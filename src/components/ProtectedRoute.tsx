import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { Loader2, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSubscription = false 
}) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { isActive: hasActiveSubscription, isLoading: subscriptionLoading } = useSubscription();

  // Show loading while checking authentication
  if (!isLoaded || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Welcome back, {user.firstName || user.emailAddresses?.[0]?.emailAddress}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // Redirect to home if not signed in
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // Debug information (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('ProtectedRoute Debug:', {
      isSignedIn,
      isLoaded,
      user: user ? {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata
      } : null,
      hasActiveSubscription,
      requireSubscription
    });
  }

  // Show subscription required message if needed
  if (requireSubscription && !hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Subscription Required
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            To access video trimming features, you need an active VideoTrim Pro subscription. 
            Upgrade now to start creating amazing content!
          </p>
          
          <button
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_STRIPE_CHECKOUT_URL}?success_url=${window.location.origin}/payment-success&cancel_url=${window.location.origin}`;
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            Upgrade to Pro
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Only $5/month • Cancel anytime
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;