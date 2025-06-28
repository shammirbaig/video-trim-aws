const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const s3Service = require('../config/aws');

class VideoService {
  constructor() {
    this.tempDir = process.env.TEMP_DIR || './temp';
    this.maxVideoDuration = parseInt(process.env.MAX_VIDEO_DURATION) || 3600; // 1 hour
    this.maxTrimDuration = parseInt(process.env.MAX_TRIM_DURATION) || 600; // 10 minutes
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating temp directory:', error);
    }
  }

  // Validate YouTube URL and extract video ID
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Get video information using yt-dlp (optimized)
  async getVideoInfo(url) {
    return new Promise((resolve, reject) => {
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        reject(new Error('Invalid YouTube URL'));
        return;
      }

      const ytdlp = spawn('yt-dlp', [
        '--dump-json',
        '--no-warnings',
        '--quiet',
        '--no-playlist',
        '--skip-download',
        url
      ]);

      let output = '';
      let errorOutput = '';

      ytdlp.stdout.on('data', (data) => {
        output += data.toString();
      });

      ytdlp.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (code !== 0) {
          logger.error('yt-dlp error:', errorOutput);
          reject(new Error('Video not available or private'));
          return;
        }

        try {
          const videoInfo = JSON.parse(output);
          
          // Validate video duration
          const duration = parseInt(videoInfo.duration) || 0;
          if (duration > this.maxVideoDuration) {
            reject(new Error(`Video too long. Maximum duration: ${this.maxVideoDuration / 60} minutes`));
            return;
          }

          if (duration < 1) {
            reject(new Error('Invalid video duration'));
            return;
          }

          resolve({
            videoId,
            title: this.sanitizeTitle(videoInfo.title || 'Unknown Title'),
            description: videoInfo.description || '',
            duration,
            thumbnail: videoInfo.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            author: videoInfo.uploader || 'Unknown',
            viewCount: parseInt(videoInfo.view_count) || 0,
            availableFormats: this.parseAvailableFormats(videoInfo.formats || [])
          });
        } catch (error) {
          logger.error('Error parsing video info:', error);
          reject(new Error('Failed to parse video information'));
        }
      });

      ytdlp.on('error', (error) => {
        logger.error('yt-dlp spawn error:', error);
        reject(new Error('Video processing service unavailable'));
      });
    });
  }

  // Sanitize video title for filename
  sanitizeTitle(title) {
    return title
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 100); // Limit length
  }

  parseAvailableFormats(formats) {
    const qualities = new Set();
    
    formats.forEach(format => {
      if (format.height) {
        if (format.height >= 2160) qualities.add('4k');
        else if (format.height >= 1080) qualities.add('1080p');
        else if (format.height >= 720) qualities.add('720p');
        else if (format.height >= 480) qualities.add('480p');
        else if (format.height >= 360) qualities.add('360p');
      }
    });

    qualities.add('mp3');
    return Array.from(qualities);
  }

  // Process video with optimized pipeline
  async processVideo(trimData, progressCallback) {
    const { url, startTime, endTime, format, videoId: requestId } = trimData;
    const tempId = uuidv4();
    const tempOutputPath = path.join(this.tempDir, `${tempId}.${format === 'mp3' ? 'mp3' : 'mp4'}`);

    try {
      // Validate trim duration
      const trimDuration = endTime - startTime;
      if (trimDuration > this.maxTrimDuration) {
        throw new Error(`Trim duration too long. Maximum: ${this.maxTrimDuration / 60} minutes`);
      }

      if (trimDuration < 1) {
        throw new Error('Trim duration must be at least 1 second');
      }

      if (progressCallback) progressCallback(5, 'Initializing...');

      // Get format selector for yt-dlp
      const formatSelector = this.getFormatSelector(format);

      if (progressCallback) progressCallback(15, 'Downloading and processing...');

      // Download and trim in one step (optimized)
      await this.downloadAndTrimVideo(
        url,
        tempOutputPath,
        startTime,
        trimDuration,
        formatSelector,
        progressCallback
      );

      if (progressCallback) progressCallback(80, 'Uploading to cloud storage...');

      // Upload to S3
      const s3Key = s3Service.generateVideoKey(requestId, format);
      const contentType = format === 'mp3' ? 'audio/mpeg' : 'video/mp4';
      
      const uploadResult = await s3Service.uploadVideo(tempOutputPath, s3Key, contentType);

      if (progressCallback) progressCallback(95, 'Finalizing...');

      // Get file stats
      const stats = await fs.stat(tempOutputPath);

      // Clean up temp file
      await this.cleanupTempFile(tempOutputPath);

      if (progressCallback) progressCallback(100, 'Complete!');

      return {
        s3Key,
        s3Location: uploadResult.location,
        size: stats.size,
        contentType,
        filename: `${this.sanitizeTitle(trimData.title || 'video')}.${format === 'mp3' ? 'mp3' : 'mp4'}`
      };

    } catch (error) {
      logger.error('Error processing video:', error);
      
      // Clean up temp file
      await this.cleanupTempFile(tempOutputPath);
      
      throw error;
    }
  }

  async downloadAndTrimVideo(url, outputPath, startTime, duration, formatSelector, progressCallback) {
    return new Promise((resolve, reject) => {
      const args = [
        '-f', formatSelector,
        '--external-downloader', 'ffmpeg',
        '--external-downloader-args', `ffmpeg_i:-ss ${startTime} -t ${duration} -avoid_negative_ts make_zero`,
        '-o', outputPath,
        '--no-warnings',
        '--progress',
        '--no-playlist',
        url
      ];

      const ytdlp = spawn('yt-dlp', args);
      let errorOutput = '';

      ytdlp.stdout.on('data', (data) => {
        const output = data.toString();
        
        // Parse progress from yt-dlp output
        const progressMatch = output.match(/(\d+(?:\.\d+)?)%/);
        if (progressMatch && progressCallback) {
          const progress = Math.min(75, 15 + (parseFloat(progressMatch[1]) * 0.6));
          progressCallback(progress, 'Processing video...');
        }
      });

      ytdlp.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ytdlp.on('close', (code) => {
        if (code !== 0) {
          logger.error('yt-dlp processing error:', errorOutput);
          reject(new Error('Video processing failed. Please try again.'));
          return;
        }

        resolve();
      });

      ytdlp.on('error', (error) => {
        logger.error('yt-dlp spawn error:', error);
        reject(new Error('Video processing service unavailable'));
      });
    });
  }

  getFormatSelector(format) {
    const formatMap = {
      '4k': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]',
      '1080p': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
      '720p': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
      '480p': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
      '360p': 'bestvideo[height<=360]+bestaudio/best[height<=360]',
      'mp3': 'bestaudio[ext=m4a]/bestaudio/best'
    };

    return formatMap[format] || formatMap['720p'];
  }

  // Generate download URL
  async generateDownloadUrl(s3Key, filename) {
    try {
      return await s3Service.generatePresignedUrl(s3Key, filename);
    } catch (error) {
      logger.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  // Clean up temp file
  async cleanupTempFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn(`Could not delete temp file: ${filePath}`);
    }
  }

  // Clean up expired videos from S3
  async cleanupExpiredVideos(expiredVideoKeys) {
    try {
      for (const key of expiredVideoKeys) {
        await s3Service.deleteVideo(key);
      }
      logger.info(`Cleaned up ${expiredVideoKeys.length} expired videos from S3`);
    } catch (error) {
      logger.error('Error cleaning up expired videos:', error);
    }
  }
}

module.exports = new VideoService();