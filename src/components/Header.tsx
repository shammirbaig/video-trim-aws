import React from 'react';
import { useUser, UserButton, SignInButton } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, Menu, X, Scissors, BarChart3, CreditCard, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../hooks/useSubscription';

const Header = () => {
  const { isSignedIn } = useUser();
  const { isActive: hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleStartTrimming = () => {
    if (isSignedIn) {
      navigate('/trim');
    } else {
      // For non-authenticated users, redirect to payment first
      window.location.href = `${import.meta.env.VITE_STRIPE_CHECKOUT_URL}?success_url=${window.location.origin}/payment-success&cancel_url=${window.location.origin}`;
    }
  };

  const isActivePage = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center cursor-pointer group"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-all">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">VideoTrim</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pro</span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isSignedIn ? (
              <>
                <motion.button
                  onClick={() => navigate('/trim')}
                  className={`flex items-center gap-2 font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    isActivePage('/trim') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Scissors className="w-4 h-4" />
                  Trim Videos
                </motion.button>
                
                <motion.button
                  onClick={() => navigate('/insights')}
                  className={`flex items-center gap-2 font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    isActivePage('/insights') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BarChart3 className="w-4 h-4" />
                  Insights
                </motion.button>
                
                <motion.button
                  onClick={() => navigate('/subscribe')}
                  className={`flex items-center gap-2 font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    isActivePage('/subscribe') 
                      ? 'text-blue-600 bg-blue-50' 
                      : hasActiveSubscription 
                        ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                        : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {hasActiveSubscription ? (
                    <>
                      <Crown className="w-4 h-4" />
                      Pro Active
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Upgrade
                    </>
                  )}
                </motion.button>
                
                <div className="flex items-center">
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 rounded-xl shadow-md hover:shadow-lg transition-all"
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <a 
                  href="#pricing" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  Pricing
                </a>
                <a 
                  href="#support" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  Support
                </a>
                <SignInButton mode="modal">
                  <motion.button 
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </SignInButton>
                <motion.button
                  onClick={handleStartTrimming}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4" />
                  Start Trimming
                </motion.button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
                {isSignedIn ? (
                  <>
                    <motion.button
                      onClick={() => {
                        navigate('/trim');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 font-medium rounded-xl transition-all ${
                        isActivePage('/trim') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Scissors className="w-5 h-5" />
                      Trim Videos
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        navigate('/insights');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 font-medium rounded-xl transition-all ${
                        isActivePage('/insights') 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <BarChart3 className="w-5 h-5" />
                      Insights
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        navigate('/subscribe');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 font-medium rounded-xl transition-all ${
                        isActivePage('/subscribe') 
                          ? 'text-blue-600 bg-blue-50' 
                          : hasActiveSubscription 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-orange-600 hover:bg-orange-50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {hasActiveSubscription ? (
                        <>
                          <Crown className="w-5 h-5" />
                          Pro Active
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Upgrade to Pro
                        </>
                      )}
                    </motion.button>
                    
                    <div className="px-4 py-3">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </>
                ) : (
                  <>
                    <a 
                      href="#pricing" 
                      className="block px-4 py-3 text-gray-700 hover:text-blue-600 font-medium rounded-xl hover:bg-gray-50 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Pricing
                    </a>
                    <a 
                      href="#support" 
                      className="block px-4 py-3 text-gray-700 hover:text-blue-600 font-medium rounded-xl hover:bg-gray-50 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Support
                    </a>
                    <SignInButton mode="modal">
                      <button
                        className="block w-full text-left px-4 py-3 text-gray-700 hover:text-blue-600 font-medium rounded-xl hover:bg-gray-50 transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                    <motion.button
                      onClick={() => {
                        handleStartTrimming();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold mt-2 transition-all shadow-lg flex items-center gap-2"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      Start Trimming
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;