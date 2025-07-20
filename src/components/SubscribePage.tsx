import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  Star, 
  Zap, 
  Shield, 
  Users,
  ArrowRight,
  Loader2,
  Crown,
  Sparkles,
  Award,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscription } from '../hooks/useSubscription';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';

const SubscribePage = () => {
  const { isActive, isLoading, planName, expiresAt } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // Redirect to Stripe checkout
      window.location.href = `${import.meta.env.VITE_STRIPE_CHECKOUT_URL}?success_url=${window.location.origin}/payment-success&cancel_url=${window.location.origin}/subscribe`;
    } catch (error) {
      console.error('Subscription error:', error);
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = () => {
    // In a real app, this would redirect to Stripe customer portal
    alert('This would redirect to Stripe customer portal to manage your subscription');
  };

  const features = [
    {
      icon: Zap,
      title: 'Unlimited Video Trimming',
      description: 'Process unlimited YouTube videos with no restrictions or quotas',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'All Quality Formats',
      description: '4K, 1080p, 720p, 480p, 360p, and crystal-clear MP3 audio extraction',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Priority Support',
      description: 'Get expert help from our team within 2 hours via email and live chat',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Star,
      title: 'Advanced Analytics',
      description: 'Complete download history, usage analytics, and performance insights',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'High-Speed Processing',
      description: 'Lightning-fast cloud servers with 99.9% uptime guarantee',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Award,
      title: 'Early Access Features',
      description: 'Be the first to try new features and advanced trimming tools',
      color: 'from-red-500 to-pink-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator',
      content: 'VideoTrim Pro completely transformed my workflow. The quality is incredible and the speed is unmatched. Worth every penny!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      stats: 'Saved 20+ hours/week'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Digital Marketing Agency',
      content: 'We process hundreds of videos monthly. VideoTrim Pro reduced our costs by 80% and delivery time from days to minutes.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      stats: '80% cost reduction'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Online Educator',
      content: 'Perfect for creating micro-learning content. Student engagement increased 60% with bite-sized video clips.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      stats: '60% engagement boost'
    }
  ];

  const pricingComparison = [
    { feature: 'Video Trimming', free: '3 per month', pro: 'Unlimited' },
    { feature: 'Quality Options', free: '720p max', pro: 'Up to 4K' },
    { feature: 'Processing Speed', free: 'Standard', pro: 'Lightning Fast' },
    { feature: 'Download History', free: 'Last 5', pro: 'Complete History' },
    { feature: 'Support', free: 'Email only', pro: 'Priority Chat & Email' },
    { feature: 'Analytics', free: 'Basic', pro: 'Advanced Insights' }
  ];

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="text-lg font-semibold text-gray-900">Loading subscription details...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Header />
        
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Crown className="w-4 h-4 mr-2" />
                {isActive ? 'Pro Member' : 'Upgrade to Pro'}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                {isActive ? 'Manage Your Subscription' : 'Unlock Professional Features'}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {isActive 
                  ? 'You have full access to all VideoTrim Pro features and premium support'
                  : 'Join thousands of creators who\'ve transformed their video workflow with VideoTrim Pro'
                }
              </p>
            </motion.div>

            {isActive ? (
              // Current Subscription Status
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-xl p-10 mb-12 border border-gray-100"
              >
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                    <Crown className="w-10 h-10" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Active Pro Subscription
                  </h2>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                        <h3 className="font-bold text-green-900 text-lg mb-2">{planName}</h3>
                        <p className="text-green-700">Current Plan</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900 text-lg mb-2">$5/month</h3>
                        <p className="text-green-700">Monthly Cost</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900 text-lg mb-2">
                          {expiresAt && new Date(expiresAt).toLocaleDateString()}
                        </h3>
                        <p className="text-green-700">Next Billing</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleManageSubscription}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl"
                    >
                      Manage Subscription
                    </button>
                    <button
                      onClick={() => window.open('mailto:support@videotrimpro.com')}
                      className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold py-4 px-8 rounded-2xl transition-all"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Subscription Plans
              <div className="grid grid-cols-1 gap-12 mb-12">
                {/* Free Plan */}
                {/* <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-200"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Plan</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                    <p className="text-gray-600">Perfect for trying out</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">3 video trims per month</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">720p maximum quality</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">Standard processing speed</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">Email support</span>
                    </li>
                  </ul>
                  
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 font-semibold py-4 px-8 rounded-2xl cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                </motion.div> */}

                {/* Pro Plan */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-500 relative overflow-hidden"
                >
                  {/* Popular badge */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Most Popular
                    </div>
                  </div>
                  
                  <div className="text-center mb-8 pt-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">VideoTrim Pro</h3>
                    <div className="flex items-baseline justify-center mb-4">
                      <span className="text-5xl font-bold text-gray-900">$5</span>
                      <span className="text-xl text-gray-600 ml-2">/month</span>
                    </div>
                    <p className="text-blue-600 font-semibold">Less than your daily coffee!</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700 font-medium">Unlimited video trimming</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700 font-medium">All formats up to 4K</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700 font-medium">Lightning-fast processing</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700 font-medium">Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700 font-medium">Complete download history</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700 font-medium">Advanced analytics</span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        Upgrade to Pro
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    🔒 Secure payment • 🚫 No setup fees
                  </p>
                </motion.div>
              </div>
            )}

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Everything You Need to Create Amazing Content
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Loved by Creators Worldwide
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center mb-6">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-2xl object-cover mr-4 shadow-lg"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <p className="text-xs text-green-600 font-semibold">{testimonial.stats}</p>
                      </div>
                    </div>
                    
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100"
            >
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Can I cancel anytime?</h3>
                    <p className="text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Is there a free trial?</h3>
                    <p className="text-gray-600">We offer a 7-day money-back guarantee. If you're not satisfied, we'll refund your payment in full.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">What payment methods do you accept?</h3>
                    <p className="text-gray-600">We accept all major credit cards and PayPal through our secure Stripe payment processor.</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Is my data secure?</h3>
                    <p className="text-gray-600">Absolutely. We use industry-standard encryption and never store your video content on our servers.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">How fast is the processing?</h3>
                    <p className="text-gray-600">Pro users get priority access to our high-performance servers. Most videos are processed in under 30 seconds.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Can I upgrade or downgrade?</h3>
                    <p className="text-gray-600">Yes, you can change your plan at any time. Changes take effect immediately with prorated billing.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SubscribePage;