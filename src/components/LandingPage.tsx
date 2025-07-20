import { useUser, SignInButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Download, 
  Clock, 
  Zap, 
  Shield, 
  Star,
  CheckCircle,
  ArrowRight,
  Video,
  Music,
  Users,
  GraduationCap,
  Megaphone,
  PlayCircle,
  Timer,
  Scissors,
  FileDown,
  Sparkles,
  TrendingUp,
  Award,
  Coffee
} from 'lucide-react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

const LandingPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate('/trim');
    } else {
      // For non-authenticated users, redirect to payment first
     // window.location.href = `${import.meta.env.VITE_STRIPE_CHECKOUT_URL}?success_url=${window.location.origin}/payment-success&cancel_url=${window.location.origin}`;
           // Existing user - show sign in modal
      document.querySelector('[data-clerk-sign-in-button]')?.click();
    }
  };

  const handleStartTrimming = () => {
    if (isSignedIn) {
      navigate('/trim');
    } else {
      // Existing user - show sign in modal
      document.querySelector('[data-clerk-sign-in-button]')?.click();

      // if (userChoice) {
      //   // New user - redirect to payment
      //   window.location.href = `${import.meta.env.VITE_STRIPE_CHECKOUT_URL}?success_url=${window.location.origin}/payment-success&cancel_url=${window.location.origin}`;
      // } else {
      //   // Existing user - show sign in modal
      //   document.querySelector('[data-clerk-sign-in-button]')?.click();
      // }
    }
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator • 247K subscribers",
      content: "VideoTrim Pro completely transformed my workflow. What used to take me 3 hours in Final Cut now takes 45 seconds. The quality is pristine and the interface is incredibly intuitive.",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      verified: true,
      stats: "Saved 15+ hours/week"
    },
    {
      name: "Marcus Rodriguez",
      role: "Digital Marketing Director",
      content: "Our agency processes 200+ client videos monthly. VideoTrim Pro reduced our editing costs by 85% and delivery time from 3 days to 30 minutes. ROI was immediate.",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      verified: true,
      stats: "85% cost reduction"
    },
    {
      name: "Dr. Emily Watson",
      role: "Online Education Pioneer",
      content: "Perfect for creating micro-learning modules from long lectures. Student engagement increased 60% with bite-sized content. The audio extraction is studio-quality.",
      avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      verified: false,
      stats: "60% engagement boost"
    },
    {
      name: "Alex Thompson",
      role: "Podcast Network Producer",
      content: "Game-changer for audiogram creation. I manage 8 different shows and this tool saves me 20+ hours weekly. The batch processing feature is incredible.",
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      verified: true,
      stats: "20+ hours saved weekly"
    }
  ];

  const demoSteps = [
    {
      step: "01",
      title: "Paste & Validate",
      description: "Drop any YouTube URL and watch our AI instantly analyze video quality, duration, and optimal trim points",
      icon: Video,
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: "02", 
      title: "Precision Trimming",
      description: "Use our frame-accurate scrubber or input exact timestamps. Preview your selection in real-time",
      icon: Scissors,
      color: "from-purple-500 to-pink-500"
    },
    {
      step: "03",
      title: "Quality Selection",
      description: "Choose from 4K, 1080p, 720p, or crystal-clear MP3. Smart recommendations based on content type",
      icon: FileDown,
      color: "from-green-500 to-emerald-500"
    },
    {
      step: "04",
      title: "Lightning Export",
      description: "Download starts instantly with our high-performance cloud infrastructure. No waiting, no queues",
      icon: Download,
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "2.3M+", label: "Videos Processed", icon: Video },
    { number: "150K+", label: "Happy Creators", icon: Users },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "4.9/5", label: "User Rating", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hidden sign in button for programmatic access */}
      <div className="hidden">
        <SignInButton mode="modal">
          <button data-clerk-sign-in-button>Hidden Sign In</button>
        </SignInButton>
      </div>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-32 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-semibold px-6 py-3 rounded-full mb-8 border border-blue-200 shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 150,000+ creators worldwide
              <TrendingUp className="w-4 h-4 ml-2" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight"
            >
              Transform Hours of Editing
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Into Seconds
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              VideoTrim Pro is the professional-grade tool that turns complex video editing into a simple, 
              <span className="text-blue-600 font-semibold"> one-click experience</span>. 
              Join thousands of creators who've already revolutionized their workflow.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <motion.button
                onClick={handleStartTrimming}
                className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-12 py-5 rounded-2xl text-lg transition-all duration-300 shadow-xl flex items-center gap-3 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Zap className="w-6 h-6 relative z-10" />
                Start Trimming Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </motion.button>
              
              <div className="flex items-center text-gray-600 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-white/50">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-medium">No contracts • Cancel anytime </span>
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                    <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-32 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <PlayCircle className="w-4 h-4 mr-2" />
              See it in action
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Watch the Magic Happen
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From YouTube URL to perfect clip in under 30 seconds. No complex software, no learning curve.
            </p>
          </motion.div>
          
          {/* Demo Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative max-w-6xl mx-auto mb-20"
          >
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
              <div className="aspect-video flex items-center justify-center relative">
                {/* Fake browser chrome */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800 flex items-center px-6 border-b border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-gray-700 text-gray-300 text-sm px-4 py-1 rounded-lg inline-block">
                      app.videotrimpro.com
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-12">
                  <motion.div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 cursor-pointer transition-all duration-300 shadow-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PlayCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-3">2-Minute Demo</h3>
                  <p className="text-gray-300 text-lg">Watch the complete workflow from URL to download</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step-by-step process */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {demoSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className={`bg-gradient-to-br ${step.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-3 -right-3 bg-gray-900 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  
                  {/* Connector line */}
                  {index < demoSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform translate-x-4"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4 mr-2" />
              Why professionals choose us
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Built for Creators Who Demand Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop wrestling with bloated editing software. Get professional results with zero learning curve.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              {[
                { 
                  icon: Zap, 
                  title: "Lightning-Fast Processing", 
                  desc: "Our enterprise-grade cloud infrastructure processes videos 10x faster than traditional tools. No more coffee breaks while waiting for exports.", 
                  color: "blue",
                  metric: "10x faster processing"
                },
                { 
                  icon: Play, 
                  title: "Zero Learning Curve", 
                  desc: "If you can copy and paste, you can master VideoTrim Pro. Intuitive design that feels natural from day one.", 
                  color: "green",
                  metric: "30-second onboarding"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="flex items-start space-x-6 p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-blue-200">
                    <div className={`bg-gradient-to-br from-${benefit.color}-500 to-${benefit.color}-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{benefit.title}</h3>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {benefit.metric}
                        </span>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="space-y-12">
              {[
                { 
                  icon: Video, 
                  title: "Studio-Quality Output", 
                  desc: "Export in pristine 4K, sharp 1080p, or crystal-clear MP3. Our advanced encoding ensures your content looks professional every time.", 
                  color: "purple",
                  metric: "4K quality guaranteed"
                },
                { 
                  icon: Shield, 
                  title: "Human-First Support", 
                  desc: "Real experts who actually use the product. Get personalized help from our team of video professionals, not chatbots.", 
                  color: "orange",
                  metric: "< 2hr response time"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="flex items-start space-x-6 p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-purple-200">
                    <div className={`bg-gradient-to-br from-${benefit.color}-500 to-${benefit.color}-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{benefit.title}</h3>
                        <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          {benefit.metric}
                        </span>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 bg-white px-4" id="pricing">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Simple, transparent pricing
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Professional Tools,
              <span className="block text-blue-600">Startup Price</span>
            </h2>
            <p className="text-xl text-gray-600 mb-20">
              One plan. No hidden fees. No "enterprise" upsells. Just incredible value.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative max-w-lg mx-auto"
          >
            {/* Popular badge */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg">
                ⚡ Most Popular Choice
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-blue-100 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full transform translate-x-20 -translate-y-20"></div>
              
              <div className="relative">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">VideoTrim Pro</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-7xl font-extrabold text-gray-900">$5</span>
                    <span className="text-2xl text-gray-600 ml-3">/month</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                    <Coffee className="w-4 h-4" />
                    <span>Less than your daily coffee!</span>
                  </div>
                </div>
                
                <ul className="text-left space-y-5 mb-12">
                  {[
                    "Unlimited video trimming & downloads",
                    "All formats: 4K, 1080p, 720p, 480p, 360p, MP3",
                    "Lightning-fast cloud processing",
                    "Priority email & chat support",
                    "Complete download history dashboard",
                    "Early access to new features",
                    "99.9% uptime guarantee",
                    "Cancel anytime, no questions asked"
                  ].map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start"
                    >
                      <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-lg">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <motion.button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-2xl text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your Pro Journey
                </motion.button>
                
                <div className="text-center mt-8 space-y-2">
                  <p className="text-sm text-gray-500">
                    🔒 Secure payment • 🚫 No setup fees • ✅ 7-day money-back guarantee
                  </p>
                  <p className="text-xs text-gray-400">
                    Join 150,000+ creators who trust VideoTrim Pro
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4 mr-2 fill-current" />
              4.9/5 from 12,000+ reviews
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real people who've transformed their workflow
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-2xl object-cover mr-4 shadow-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-bold text-gray-900 text-lg mr-2">{testimonial.name}</h4>
                      {testimonial.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{testimonial.role}</p>
                    <p className="text-xs text-green-600 font-semibold">{testimonial.stats}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join over 150,000 creators, educators, and marketers who've already discovered 
              the fastest way to create perfect video clips. Your future self will thank you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <motion.button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-12 py-6 rounded-2xl text-xl transition-all duration-300 shadow-2xl inline-flex items-center gap-3 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-6 h-6 group-hover:animate-pulse" />
                Start Your VideoTrim Pro Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span>30-second setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>7-day guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;