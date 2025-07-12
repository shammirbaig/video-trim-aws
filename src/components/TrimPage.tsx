import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Download, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  FileVideo,
  Music,
  Zap,
  Link,
  Clock,
  Sparkles,
  ArrowRight,
  Settings,
  Shield,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import VideoPlayer from './VideoPlayer';
import TimeScrubber from './TimeScrubber';
import ProtectedRoute from './ProtectedRoute';
import { useSubscription } from '../hooks/useSubscription';
import { videoAPI } from '../services/api';
import { useApi } from '../hooks/useApi';

const TrimPage = () => {
  const navigate = useNavigate();
  const { isActive: hasActiveSubscription } = useSubscription();
  const { loading: apiLoading, error: apiError, execute, clearError } = useApi();
  
  const [formData, setFormData] = useState({
    url: '',
    startTime: 0,
    endTime: 30,
    format: '1080p'
  });
  
  const [videoData, setVideoData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingVideoId, setProcessingVideoId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');

  const formats = [
    { value: '4k', label: '4K Ultra HD', icon: FileVideo, size: '~500MB', quality: 'Premium', color: 'from-purple-500 to-pink-500' },
    { value: '1080p', label: '1080p Full HD', icon: FileVideo, size: '~200MB', quality: 'High', color: 'from-blue-500 to-cyan-500' },
    { value: '720p', label: '720p HD', icon: FileVideo, size: '~100MB', quality: 'Good', color: 'from-green-500 to-emerald-500' },
    { value: '480p', label: '480p SD', icon: FileVideo, size: '~50MB', quality: 'Standard', color: 'from-yellow-500 to-orange-500' },
    { value: '360p', label: '360p Low', icon: FileVideo, size: '~25MB', quality: 'Basic', color: 'from-gray-500 to-gray-600' },
    { value: 'mp3', label: 'MP3 Audio', icon: Music, size: '~5MB', quality: 'Audio Only', color: 'from-indigo-500 to-purple-500' }
  ];

  // Debounced URL validation
  const validateUrl = useCallback(async (url) => {
    if (!url.trim()) {
      setVideoData(null);
      return;
    }

    setIsValidating(true);
    setError('');
    clearError();

    try {
      const result = await execute(() => videoAPI.validateUrl(url), {
        showLoading: false,
        onSuccess: (data) => {
          if (data.data.valid) {
            const videoInfo = data.data.videoInfo;
            setVideoData(videoInfo);
            setFormData(prev => ({
              ...prev,
              endTime: Math.min(30, videoInfo.duration)
            }));
            setSuccess('Video loaded successfully! Ready to trim.');
            setTimeout(() => setSuccess(''), 4000);
          }
        },
        onError: (err) => {
          setError(err.message);
          setVideoData(null);
        }
      });
    } catch (err) {
      // Error already handled by useApi
    } finally {
      setIsValidating(false);
    }
  }, [execute, clearError]);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, url });
    
    // Debounce URL validation
    const timeoutId = setTimeout(() => {
      validateUrl(url);
    }, 800);

    return () => clearTimeout(timeoutId);
  };

  const handlePlayerReady = (playerInstance) => {
    setPlayer(playerInstance);
  };

  // Poll for processing status
  useEffect(() => {
    let interval;
    
    if (processingVideoId && isProcessing) {
      interval = setInterval(async () => {
        try {
          const result = await videoAPI.getStatus(processingVideoId);
          const { status, progress: currentProgress } = result.data;
          
          setProgress(currentProgress);
          
          if (status === 'completed') {
            setIsProcessing(false);
            setProgress(100);
            
            // Get download URL
            try {
              const downloadResult = await videoAPI.getDownloadUrl(processingVideoId);
              setDownloadUrl(downloadResult.data.downloadUrl);
              setSuccess('Video processed successfully! Download ready.');
            } catch (downloadError) {
              setError('Video processed but download URL generation failed');
            }
            
            clearInterval(interval);
          } else if (status === 'failed') {
            setIsProcessing(false);
            setError('Video processing failed. Please try again.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error checking status:', err);
        }
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processingVideoId, isProcessing]);

  const handleDownload = async () => {
    if (!videoData) {
      setError('Please load a video first');
      return;
    }

    if (formData.endTime <= formData.startTime) {
      setError('End time must be greater than start time');
      return;
    }

    if (formData.endTime - formData.startTime > 600) {
      setError('Trim duration cannot exceed 10 minutes');
      return;
    }

    if (!hasActiveSubscription) {
      setError('Active subscription required to download videos');
      return;
    }

    setError('');
    setSuccess('');
    setDownloadUrl('');
    clearError();

    try {
      const result = await execute(() => videoAPI.trimVideo({
        url: formData.url,
        startTime: formData.startTime,
        endTime: formData.endTime,
        format: formData.format
      }), {
        onSuccess: (data) => {
          setProcessingVideoId(data.data.videoId);
          setIsProcessing(true);
          setProgress(0);
        },
        onError: (err) => {
          setError(err.message);
        }
      });
    } catch (err) {
      // Error already handled by useApi
    }
  };

  const handleDirectDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  // Show subscription required overlay if user doesn't have active subscription
  if (!hasActiveSubscription) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <div className="pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Professional Video Trimmer
                </h1>
                <p className="text-xl text-gray-600">
                  Transform your YouTube videos into perfect clips
                </p>
              </motion.div>

              {/* Subscription Required Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                {/* Blurred Background */}
                <div className="filter blur-sm pointer-events-none">
                  <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Link className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-semibold text-gray-400">YouTube Video URL</span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl text-gray-400"
                      disabled
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Required Modal */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center border-2 border-orange-200"
                  >
                    <div className="bg-gradient-to-br from-orange-100 to-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-10 h-10 text-orange-600" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Subscription Required
                    </h2>
                    
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Unlock unlimited video trimming and premium features with VideoTrim Pro. 
                      Join thousands of creators who've already transformed their workflow.
                    </p>
                    
                    <div className="space-y-4">
                      <button
                        onClick={() => navigate('/subscribe')}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Upgrade to Pro
                        <ArrowRight className="w-5 h-5" />
                      </button>
                      
                      <p className="text-sm text-gray-500">
                        Only $5/month • Cancel anytime • 7-day guarantee
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
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
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Professional Video Trimmer
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Trim Your YouTube Video
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Enter a YouTube URL, select your perfect trim points, and download in studio quality
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* URL Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-3 rounded-xl">
                    <Link className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">YouTube Video URL</h2>
                    <p className="text-gray-600">Paste any YouTube video link to get started</p>
                  </div>
                </div>
                
                <div className="relative flex items-center">
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="block w-full px-6 py-5 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                    disabled={isProcessing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        validateUrl(formData.url);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => validateUrl(formData.url)}
                    disabled={isProcessing || isValidating || !formData.url.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2 transition-all disabled:bg-gray-300"
                    aria-label="Validate URL"
                  >
                    {isValidating ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <ArrowRight className="h-6 w-6" />
                    )}
                  </button>
                </div>
                
                <AnimatePresence>
                  {(error || apiError) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                      <span className="text-red-700 font-medium">{error || apiError}</span>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center mt-4 p-4 bg-green-50 border border-green-200 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-green-700 font-medium">{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Video Player */}
              {videoData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <VideoPlayer
                    videoId={videoData.videoId}
                    onReady={handlePlayerReady}
                    onTimeUpdate={setCurrentTime}
                    startTime={formData.startTime}
                    endTime={formData.endTime}
                  />
                </motion.div>
              )}

              {/* Time Scrubber */}
              {videoData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <TimeScrubber
                    duration={videoData.duration}
                    startTime={formData.startTime}
                    endTime={formData.endTime}
                    currentTime={currentTime}
                    onStartTimeChange={(time) => setFormData(prev => ({ ...prev, startTime: time }))}
                    onEndTimeChange={(time) => setFormData(prev => ({ ...prev, endTime: time }))}
                    onSeek={(time) => player?.seekTo(time)}
                  />
                </motion.div>
              )}

              {/* Format Selection */}
              {videoData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-xl">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Export Quality</h3>
                      <p className="text-gray-600">Choose the perfect format for your needs</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formats.map((format) => {
                      const IconComponent = format.icon;
                      const isSelected = formData.format === format.value;
                      return (
                        <label
                          key={format.value}
                          className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-lg group ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="format"
                            value={format.value}
                            checked={isSelected}
                            onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                            className="sr-only"
                            disabled={isProcessing}
                          />
                          
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-br ${format.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1">
                            <div className={`font-bold text-lg mb-1 ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {format.label}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">{format.quality}</div>
                            <div className="text-xs text-gray-500">{format.size}</div>
                          </div>
                          
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3"
                            >
                              <CheckCircle className="w-6 h-6 text-blue-500" />
                            </motion.div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Download Section */}
              {videoData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                >
                  {isProcessing && (
                    <div className="mb-8">
                      <div className="flex items-center justify-center text-blue-600 mb-6">
                        <div className="bg-blue-100 p-4 rounded-full mr-4">
                          <Zap className="w-8 h-8 animate-pulse" />
                        </div>
                        <div>
                          <div className="font-bold text-xl">Processing Your Video</div>
                          <div className="text-gray-600">High-quality processing in progress</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                          {progress < 100 ? `${Math.round(progress)}% complete` : 'Finalizing download...'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Processing with AWS cloud infrastructure
                        </div>
                      </div>
                    </div>
                  )}

                  {downloadUrl ? (
                    <div className="text-center">
                      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-6">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-green-900 mb-2">Video Ready!</h3>
                        <p className="text-green-700">Your trimmed video is ready for download</p>
                      </div>
                      
                      <button
                        onClick={handleDirectDownload}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-8 rounded-2xl text-xl transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center gap-4 group mb-4"
                      >
                        <Download className="w-7 h-7 group-hover:animate-bounce" />
                        Download Video
                        <ExternalLink className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <p className="text-sm text-gray-600">
                        Secure download link expires in 1 hour
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleDownload}
                      disabled={isProcessing || !videoData || apiLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-6 px-8 rounded-2xl text-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-4 group"
                    >
                      {isProcessing || apiLoading ? (
                        <>
                          <Loader2 className="w-7 h-7 animate-spin" />
                          {isProcessing ? 'Processing Video...' : 'Starting...'}
                        </>
                      ) : (
                        <>
                          <Download className="w-7 h-7 group-hover:animate-bounce" />
                          Trim & Download Video
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  )}
                  
                  {videoData && !isProcessing && !downloadUrl && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Trim duration: {Math.floor((formData.endTime - formData.startTime) / 60)}:{Math.floor((formData.endTime - formData.startTime) % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          <span>Format: {formats.find(f => f.value === formData.format)?.label}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TrimPage;