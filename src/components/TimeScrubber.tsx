import React, { useState, useEffect } from "react";
import { Clock, Play, Square, Scissors, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface TimeScrubberProps {
  duration: number;
  startTime: number;
  endTime: number;
  currentTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onSeek: (time: number) => void;
}

const TimeScrubber: React.FC<TimeScrubberProps> = ({
  duration,
  startTime,
  endTime,
  currentTime,
  onStartTimeChange,
  onEndTimeChange,
  onSeek,
}) => {
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);
  const [startInput, setStartInput] = useState(startTime.toString());
  const [endInput, setEndInput] = useState(endTime.toString());

  useEffect(() => {
    setStartInput(Math.floor(startTime).toString());
    setEndInput(Math.floor(endTime).toString());
  }, [startTime, endTime]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const timeline = document.getElementById("timeline-bar");
      if (!timeline) return;

      const rect = timeline.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = Math.max(0, Math.min(duration, percentage * duration));

      handleSliderChange(newTime, isDragging);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, duration, startTime, endTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSliderChange = (
    value: number,
    type: "start" | "end" | "current"
  ) => {
    const clampedValue = Math.max(0, Math.min(duration, value));

    if (type === "start") {
      const newStart = Math.min(clampedValue, endTime - 1);
      onStartTimeChange(newStart);
    } else if (type === "end") {
      const newEnd = Math.max(clampedValue, startTime + 1);
      onEndTimeChange(newEnd);
    } else if (type === "current") {
      onSeek(clampedValue);
    }
  };

  const handleInputChange = (value: string, type: "start" | "end") => {
    const numValue = parseInt(value) || 0;

    if (type === "start") {
      setStartInput(value);
      if (numValue >= 0 && numValue < endTime) {
        onStartTimeChange(numValue);
      }
    } else {
      setEndInput(value);
      if (numValue > startTime && numValue <= duration) {
        onEndTimeChange(numValue);
      }
    }
  };

  const trimDuration = endTime - startTime;
  const quickActions = [
    {
      label: "First 30s",
      action: () => {
        onStartTimeChange(0);
        onEndTimeChange(Math.min(30, duration));
      },
    },
    {
      label: "Last 30s",
      action: () => {
        onStartTimeChange(Math.max(0, duration - 30));
        onEndTimeChange(duration);
      },
    },
    {
      label: "Middle 30s",
      action: () => {
        const center = duration / 2;
        onStartTimeChange(Math.max(0, center - 15));
        onEndTimeChange(Math.min(duration, center + 15));
      },
    },
    {
      label: "First 60s",
      action: () => {
        onStartTimeChange(0);
        onEndTimeChange(Math.min(60, duration));
      },
    },
    {
      label: "Last 60s",
      action: () => {
        onStartTimeChange(Math.max(0, duration - 60));
        onEndTimeChange(duration);
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-4 border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-3 rounded-xl">
          <Scissors className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Precision Trimming
          </h3>
          <p className="text-gray-600">
            Set exact start and end times for your clip
          </p>
        </div>
      </div>

      {/* Trim Duration Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Trim Duration</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(trimDuration)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">File Size Estimate</div>
            <div className="text-lg font-semibold text-gray-900">
              ~{Math.round(trimDuration * 2)}MB
            </div>
          </div>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>Timeline</span>
          <span>Total: {formatTime(duration)}</span>
        </div>

        <div
          id="timeline-bar"
          className="relative h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />

          <motion.div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg"
            style={{
              left: `${(startTime / duration) * 100}%`,
              width: `${((endTime - startTime) / duration) * 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-lg z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Start handle */}
          <motion.div
            className="absolute top-2 bottom-2 w-4 bg-blue-600 rounded-lg cursor-ew-resize shadow-lg hover:bg-blue-700 transition-colors z-20 flex items-center justify-center"
            style={{ left: `${(startTime / duration) * 100}%` }}
            onMouseDown={() => setIsDragging("start")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-1 h-6 bg-white rounded-full"></div>
          </motion.div>

          {/* End handle */}
          <motion.div
            className="absolute top-2 bottom-2 w-4 bg-indigo-600 rounded-lg cursor-ew-resize shadow-lg hover:bg-indigo-700 transition-colors z-20 flex items-center justify-center"
            style={{ left: `${(endTime / duration) * 100}%` }}
            onMouseDown={() => setIsDragging("end")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="w-1 h-6 bg-white rounded-full"></div>
          </motion.div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Manual Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-3">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <div className="bg-blue-100 text-blue-600 p-1 rounded mr-2">
              <Play className="w-4 h-4" />
            </div>
            Start Time (seconds)
          </label>
          <input
            type="number"
            value={startInput}
            onChange={(e) => handleInputChange(e.target.value, "start")}
            onBlur={() => setStartInput(Math.floor(startTime).toString())}
            min="0"
            max={endTime - 1}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium"
          />
          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            {formatTime(startTime)}
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <div className="bg-indigo-100 text-indigo-600 p-1 rounded mr-2">
              <Square className="w-4 h-4" />
            </div>
            End Time (seconds)
          </label>
          <input
            type="number"
            value={endInput}
            onChange={(e) => handleInputChange(e.target.value, "end")}
            onBlur={() => setEndInput(Math.floor(endTime).toString())}
            min={startTime + 1}
            max={duration}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-lg font-medium"
          />
          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            {formatTime(endTime)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Zap className="w-4 h-4 text-yellow-500" />
          Quick Selections
        </div>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              onClick={action.action}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium hover:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TimeScrubber;
