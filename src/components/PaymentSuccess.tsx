import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUp, useUser } from '@clerk/clerk-react';
import { CheckCircle, ArrowRight, Video, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();

  // If user is already signed in, redirect to trim page
  useEffect(() => {
    if (isSignedIn && user) {
      // In a real app, you'd update the user's subscription status here
      // For demo purposes, we'll simulate this by updating metadata
      navigate('/trim');
    }
  }, [isSignedIn, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 text-center border-b border-gray-200">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Payment Successful!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 text-lg mb-6"
          >
            Welcome to VideoTrim Pro! Create your account to start trimming videos instantly.
          </motion.p>
        </div>
        
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Create Your VideoTrim Pro Account
            </h2>
            <p className="text-gray-600 text-center mb-6">
              You're just one step away from accessing all premium features
            </p>
          </motion.div>
          
          {/* Clerk SignUp Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center mb-8"
          >
            <SignUp 
              afterSignUpUrl="/trim"
              redirectUrl="/trim"
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg",
                  card: "shadow-none border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: 
                    "border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors",
                  formFieldInput: 
                    "border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-medium"
                }
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">What you get with VideoTrim Pro:</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Unlimited video trimming & downloads
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                All formats: 4K, 1080p, 720p, MP3
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Lightning-fast processing servers
              </div>
              <div className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                Priority support & download history
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;