import React, { useState, useCallback, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Pause, RotateCcw, Volume2, Maximize, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  videoId: string;
  onReady?: (player: any) => void;
  onTimeUpdate?: (currentTime: number) => void;
  startTime?: number;
  endTime?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  onReady,
  onTimeUpdate,
  startTime = 0,
  endTime
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [showControls, setShowControls] = useState(true);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  const onPlayerReady = useCallback((event: any) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration());
    setVolume(playerInstance.getVolume());
    
    if (onReady) {
      onReady(playerInstance);
    }

    // Set up time update interval
    const interval = setInterval(() => {
      if (playerInstance && playerInstance.getCurrentTime) {
        const time = playerInstance.getCurrentTime();
        setCurrentTime(time);
        if (onTimeUpdate) {
          onTimeUpdate(time);
        }

        // Auto-pause at end time
        if (endTime && time >= endTime) {
          playerInstance.pauseVideo();
          setIsPlaying(false);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onReady, onTimeUpdate, endTime]);

  const togglePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      // Seek to start time if we're before it
      if (startTime && currentTime < startTime) {
        player.seekTo(startTime);
      }
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    if (player) {
      player.seekTo(time);
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (player) {
      player.setVolume(newVolume);
      setVolume(newVolume);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trimStartPercentage = duration > 0 ? (startTime / duration) * 100 : 0;
  const trimEndPercentage = duration > 0 ? (endTime || duration) / duration * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
    >
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-3 rounded-xl">
            <Play className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Video Preview</h3>
            <p className="text-gray-600">Preview your trim selection in real-time</p>
          </div>
        </div>
      </div>
      
      <div 
        className="relative aspect-video bg-black group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={(event) => {
            setIsPlaying(event.data === 1);
          }}
          className="w-full h-full"
        />
        
        {/* Custom Controls Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"
        >
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                {/* Full progress */}
                <div 
                  className="absolute top-0 left-0 h-full bg-white/40 transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
                
                {/* Trim selection overlay */}
                <div 
                  className="absolute top-0 h-full bg-blue-500/60 border-l-2 border-r-2 border-blue-400"
                  style={{ 
                    left: `${trimStartPercentage}%`, 
                    width: `${trimEndPercentage - trimStartPercentage}%` 
                  }}
                />
                
                {/* Current time indicator */}
                <div 
                  className="absolute top-0 h-full w-1 bg-white shadow-lg"
                  style={{ left: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4 text-white">
              <motion.button
                onClick={togglePlayPause}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>
              
              <motion.button
                onClick={() => seekTo(startTime || 0)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
              
              <div className="flex-1 flex items-center gap-3 text-sm font-medium">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-1 bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-100"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none slider"
                />
              </div>
              
              <motion.button
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Maximize className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Trim Info */}
      <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Trim Selection</span>
            </div>
            <span className="font-semibold text-gray-900">
              {formatTime(startTime)} - {formatTime(endTime || duration)}
            </span>
          </div>
          <div className="text-gray-600">
            Duration: <span className="font-semibold text-gray-900">{formatTime((endTime || duration) - startTime)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;