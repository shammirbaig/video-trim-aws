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

  // // Process video with optimized pipeline
  // async processVideo(trimData, progressCallback) {
  //   const { url, startTime, endTime, format, videoId: requestId } = trimData;
  //   const tempId = uuidv4();
  //   const tempOutputExt = format === 'mp3' ? 'mp3' : 'mp4';
  //   const tempOutputPath = path.join(this.tempDir, `${tempId}.${tempOutputExt}`);
  //   const ytDlpTempPath = path.join(this.tempDir, `${tempId}_yt.${tempOutputExt}`);

  //   try {
  //     // Validate trim duration
  //     const trimDuration = endTime - startTime;
  //     if (trimDuration > this.maxTrimDuration) {
  //       throw new Error(`Trim duration too long. Maximum: ${this.maxTrimDuration / 60} minutes`);
  //     }

  //     if (trimDuration < 1) {
  //       throw new Error('Trim duration must be at least 1 second');
  //     }

  //     if (progressCallback) progressCallback(5, 'Initializing...');

  //     // Get format selector for yt-dlp
  //     const formatSelector = this.getFormatSelector(format);

  //     if (progressCallback) progressCallback(15, 'Downloading and processing...');

  //     // Download and trim in one step (optimized)
  //     await this.downloadAndTrimVideo(
  //       url,
  //       ytDlpTempPath,
  //       startTime,
  //       trimDuration,
  //       formatSelector,
  //       progressCallback
  //     );

  //       const dirFiles = await fs.readdir(this.tempDir);
  //       const foundFile = dirFiles.find(file =>
  //         file.startsWith(tempId) && file.endsWith(`.${tempOutputExt}`)
  //       );

  //       if (!foundFile) {
  //         throw new Error(`Processed file not found for tempId: ${tempId}`);
  //       }

  //       const actualPath = path.join(this.tempDir, foundFile);
  //       if (actualPath !== tempOutputPath) {
  //         await fs.rename(actualPath, tempOutputPath);
  //       }

  //     // Upload to S3
  //     const s3Key = s3Service.generateVideoKey(requestId, format);
  //     const contentType = format === 'mp3' ? 'audio/mpeg' : 'video/mp4';
      
  //     const uploadResult = await s3Service.uploadVideo(tempOutputPath, s3Key, contentType);

  //     if (progressCallback) progressCallback(95, 'Finalizing...');

  //     // Get file stats
  //     const stats = await fs.stat(tempOutputPath);

  //     // Clean up temp file
  //     await this.cleanupTempFile(tempOutputPath);

  //     if (progressCallback) progressCallback(100, 'Complete!');

  //     return {
  //       s3Key,
  //       s3Location: uploadResult.location,
  //       size: stats.size,
  //       contentType,
  //       filename: `${this.sanitizeTitle(trimData.title || 'video')}.${format === 'mp3' ? 'mp3' : 'mp4'}`
  //     };
  //   } // <-- Add this closing brace to end processVideo method
  
  // catch (error) {
  //     logger.error('Video processing error:', error);
  //     await this.cleanupTempFile(tempOutputPath);
  //     throw new Error(`Video processing failed: ${error.message}`);
  //   }
  // }

  // async downloadAndTrimVideo(url, outputPath, startTime, duration, formatSelector, progressCallback) {
  //   return new Promise((resolve, reject) => {
  //     // Use correct ffmpeg args and yt-dlp format selection for proper trimming and muxing
  //     const isAudioOnly = formatSelector === 'bestaudio[ext=m4a]/bestaudio/best' || formatSelector === 'mp3';
  //     const ffmpegArgs = `ffmpeg_i:-ss ${startTime} -t ${duration} -avoid_negative_ts make_zero`;
  //     const args = [
  //       '-f', formatSelector,
  //       '--external-downloader', 'ffmpeg',
  //       '--external-downloader-args', ffmpegArgs,
  //       '-o', outputPath,
  //       '--no-warnings',
  //       '--progress',
  //       '--no-playlist',
  //       ...(isAudioOnly ? ['--extract-audio', '--audio-format', 'mp3'] : []),
  //       url
  //     ];

  //     // Ensure output directory exists before running yt-dlp
  //     fs.mkdir(path.dirname(outputPath), { recursive: true }).catch(() => {});


  //     const ytdlp = spawn('yt-dlp', args);
  //     let errorOutput = '';

  //     ytdlp.stdout.on('data', (data) => {
  //       const output = data.toString();
        
  //       // Parse progress from yt-dlp output
  //       const progressMatch = output.match(/(\d+(?:\.\d+)?)%/);
  //       if (progressMatch && progressCallback) {
  //         const progress = Math.min(75, 15 + (parseFloat(progressMatch[1]) * 0.6));
  //         progressCallback(progress, 'Processing video...');
  //       }
  //     });

  //     ytdlp.stderr.on('data', (data) => {
  //       errorOutput += data.toString();
  //     });

  //     ytdlp.on('close', async (code) => {
  //       // const tempFiles = await fs.readdir(path.dirname(outputPath));
  //       // logger.info('Temp directory contents:', tempFiles);

  //       if (code !== 0) {
  //         logger.error('yt-dlp processing error:', errorOutput);
  //         reject(new Error('Video processing failed. Please try again.'));
  //         return;
  //       }

  //       resolve();
  //     });


  //     ytdlp.on('error', (error) => {
  //       logger.error('yt-dlp spawn error:', error);
  //       reject(new Error('Video processing service unavailable'));
  //     });
  //   });
  // }

//    async processVideo(trimData, progressCallback) {
//     const { url, startTime, endTime, format, videoId: requestId } = trimData;
//     const tempId = uuidv4();
//     const ext = format === 'mp3' ? 'mp3' : 'mp4';
//     // const tempOutputPath = path.join(this.tempDir, `${tempId}.${ext}`);

//     try {
//       const trimDuration = endTime - startTime;
//       if (trimDuration > this.maxTrimDuration) throw new Error(`Trim duration too long. Max: ${this.maxTrimDuration / 60} mins`);
//       if (trimDuration < 1) throw new Error('Trim duration must be at least 1 second');
//       if (progressCallback) progressCallback(5, 'Initializing...');

//       const formatSelector = this.getFormatSelector(format);
//       if (progressCallback) progressCallback(15, 'Downloading and trimming...');

//       await this.downloadAndTrimToS3({
//         url,
//         startTime,
//         duration: trimDuration,
//         formatSelector,
//         format,
//         requestId,
//         tempId,
//         progressCallback
//       });

//       if (progressCallback) progressCallback(100, 'Complete!');

//       const filename = `${this.sanitizeTitle(trimData.title || 'video')}.${ext}`;
//       return { filename };

//     } catch (error) {
//       logger.error('Video processing error:', error);
//       throw new Error(`Video processing failed: ${error.message}`);
//     }
//   }

//   async downloadAndTrimToS3({ url, startTime, duration, formatSelector, format, requestId, tempId, progressCallback }) {
//     return new Promise((resolve, reject) => {
//       const ext = format === 'mp3' ? 'mp3' : 'mp4';
//       const isAudioOnly = format === 'mp3';

//       const ffmpegArgs = `ffmpeg_i:-ss ${startTime} -t ${duration} -avoid_negative_ts make_zero`;

//       const args = [
//         '-f', formatSelector,
//         '--external-downloader', 'ffmpeg',
//         '--external-downloader-args', ffmpegArgs,
//         '-o', '-', // output to stdout
//         '--no-warnings',
//         '--no-playlist',
//         ...(isAudioOnly ? ['--extract-audio', '--audio-format', 'mp3'] : []),
//         url
//       ];

//       const ytdlp = spawn('yt-dlp', args);
//       let errorOutput = '';

//       const s3Key = s3Service.generateVideoKey(requestId, format);
//       const contentType = isAudioOnly ? 'audio/mpeg' : 'video/mp4';
//     //   const uploadStream =  s3Service.uploadStream(s3Key, contentType, 3600); // expires in 1 hour

//     //   ytdlp.stdout.pipe(uploadStream);

//     //   ytdlp.stdout.on('data', (data) => {
//     //     const progressMatch = data.toString().match(/(\d+(?:\.\d+)?)%/);
//     //     if (progressMatch && progressCallback) {
//     //       const progress = Math.min(95, 15 + (parseFloat(progressMatch[1]) * 0.7));
//     //       progressCallback(progress, 'Uploading to S3...');
//     //     }
//     //   });

//     //   ytdlp.stderr.on('data', (data) => {
//     //     errorOutput += data.toString();
//     //   });

//     //   ytdlp.on('close', (code) => {
//     //     if (code !== 0) {
//     //       logger.error('yt-dlp processing error:', errorOutput);
//     //       reject(new Error('Video processing failed. Try again.'));
//     //     } else {
//     //       resolve();
//     //     }
//     //   });

//     //   ytdlp.on('error', (err) => {
//     //     logger.error('yt-dlp spawn error:', err);
//     //     reject(new Error('Video processing service unavailable'));
//     //   });
//     // });

//     const { stream: uploadStream, done: uploadDone } = s3Service.uploadStream(s3Key, contentType);

// // Pipe yt-dlp output into S3 upload stream
// ytdlp.stdout.pipe(uploadStream);

// // Capture stderr for errors
// ytdlp.stderr.on('data', (data) => {
//   errorOutput += data.toString();
// });

// // Optional: report progress
// ytdlp.stdout.on('data', (data) => {
//   const progressMatch = data.toString().match(/(\\d+(?:\\.\\d+)?)%/);
//   if (progressMatch && progressCallback) {
//     const progress = Math.min(95, 15 + (parseFloat(progressMatch[1]) * 0.7));
//     progressCallback(progress, 'Uploading to S3...');
//   }
// });

// // Handle completion
// ytdlp.on('close', async (code) => {
//   if (code !== 0) {
//     logger.error('yt-dlp error:', errorOutput);
//     reject(new Error('yt-dlp failed'));
//   } else {
//     try {
//       await uploadDone; // ⏳ Wait for S3 upload to complete
//       resolve();
//     } catch (err) {
//       logger.error('Upload failed after yt-dlp success:', err);
//       reject(new Error('S3 upload failed'));
//     }
//   }
// });
//     })
//   }

async processVideo(trimData, progressCallback) {
    const { url, startTime, endTime, format, videoId: requestId } = trimData;
    const tempId = uuidv4();
    const ext = format === 'mp3' ? 'mp3' : 'mp4';

    try {
      const duration = endTime - startTime;
      if (duration <= 0 || duration > this.maxTrimDuration)
        throw new Error(`Invalid trim duration. Allowed: 1-${this.maxTrimDuration} seconds.`);

      if (progressCallback) progressCallback(5, 'Preparing trim...');

      const formatSelector = this.getFormatSelector(format);

      await this.downloadTrimmedAndUpload({
        url,
        startTime,
        endTime,
        format,
        formatSelector,
        requestId,
        tempId,
        progressCallback
      });

      const filename = `${this.sanitizeTitle(trimData.title || 'video')}.${ext}`;
      if (progressCallback) progressCallback(100, 'Complete');

      // Compose S3 data object (simulate result as in previous implementations)
      const s3Data = {
        key: s3Service.generateVideoKey(requestId, ext),
        location: null, // If you want, you can generate a presigned URL here
        size: null,     // Not available in this streaming approach
        contentType: ext === 'mp3' ? 'audio/mpeg' : 'video/mp4',
      };

      return { filename, s3Data };
    } catch (err) {
      logger.error('Video processing failed:', err);
      throw new Error('Video processing failed: ' + err.message);
    }
  }

  // async downloadTrimmedAndUpload({ url, startTime, endTime, format, formatSelector, requestId, tempId, progressCallback }) {
  //   return new Promise((resolve, reject) => {
  //     const isAudioOnly = format === 'mp3';
  //     const ext = isAudioOnly ? 'mp3' : 'mp4';
  //     const contentType = isAudioOnly ? 'audio/mpeg' : 'video/mp4';
  //     const s3Key = s3Service.generateVideoKey(requestId, ext);

  //     const { stream: s3WriteStream, done: s3UploadDone } = s3Service.uploadStream(s3Key, contentType);

  //     // Check if ffmpeg is installed before proceeding
  //     const checkFfmpeg = spawn('ffmpeg', ['-version']);
  //     let ffmpegAvailable = false;
  //     checkFfmpeg.on('exit', (code) => {
  //       ffmpegAvailable = code === 0;
  //       if (!ffmpegAvailable) {
  //         logger.error('ffmpeg is not installed or not found in PATH.');
  //         return reject(new Error('Server misconfiguration: ffmpeg is required for trimming videos. Please install ffmpeg.'));
  //       }

  //       const ytArgs = [
  //         '-f', formatSelector,
  //         '--download-sections', `*${this.toHHMMSS(startTime)}-${this.toHHMMSS(endTime)}`,
  //         '--no-playlist',
  //         '--quiet',
  //         '--no-warnings',
  //         '--external-downloader', 'ffmpeg',
  //         '--external-downloader-args', 'ffmpeg_i:-hwaccel none',
  //         '-o', '-', // stdout
  //         ...(isAudioOnly ? ['--extract-audio', '--audio-format', 'mp3'] : []),
  //         url
  //       ];

  //       const ytdlp = spawn('yt-dlp', ytArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

  //       ytdlp.stdout.pipe(s3WriteStream);

  //       let errorOutput = '';
  //       ytdlp.stderr.on('data', (data) => {
  //         const str = data.toString();
  //         errorOutput += str;
  //         logger.debug('yt-dlp stderr:', str);
  //       });

  //       ytdlp.on('error', (err) => {
  //         logger.error('yt-dlp spawn error:', err);
  //         reject(new Error('yt-dlp failed to start'));
  //       });

  //       ytdlp.on('close', async (code) => {
  //         if (code !== 0) {
  //           logger.error('yt-dlp closed with error:', errorOutput);
  //           return reject(new Error(`yt-dlp failed: ${errorOutput.trim() || 'Unknown error'}`));
  //         }

  //         try {
  //           await s3UploadDone;
  //           resolve();
  //         } catch (err) {
  //           logger.error('S3 upload error after yt-dlp:', err);
  //           reject(new Error('S3 upload failed'));
  //         }
  //       });

  //       if (progressCallback) {
  //         progressCallback(30, 'Downloading & uploading trimmed part...');
  //       }
  //     });

  //     checkFfmpeg.on('error', (err) => {
  //       logger.error('Failed to check ffmpeg:', err);
  //       reject(new Error('Server misconfiguration: ffmpeg is required for trimming videos. Please install ffmpeg.'));
  //     });
  //   });
  // }

   async downloadTrimmedAndUpload({ url, startTime, endTime, format, formatSelector, requestId, tempId, progressCallback }) {
    const isAudioOnly = format === 'mp3';
    const ext = isAudioOnly ? 'mp3' : 'mp4';
    const contentType = isAudioOnly ? 'audio/mpeg' : 'video/mp4';
    const s3Key = s3Service.generateVideoKey(requestId, ext);

    const { stream: s3WriteStream, done: s3UploadDone } = s3Service.uploadStream(s3Key, contentType);

    return new Promise((resolve, reject) => {
      // Verify ffmpeg is available
      const ffmpegCheck = spawn('ffmpeg', ['-version']);

      ffmpegCheck.on('error', (err) => {
        logger.error('FFmpeg not available:', err);
        return reject(new Error('FFmpeg not found in PATH. Please install ffmpeg.'));
      });

      ffmpegCheck.on('exit', (code) => {
        if (code !== 0) {
          logger.error('FFmpeg check failed with exit code', code);
          return reject(new Error('FFmpeg is not installed correctly.'));
        }

        const ytArgs = [
          '-f', `${formatSelector}[protocol!=m3u8_native][protocol!=m3u8]`, // avoid HLS/m3u8 formats
          '--prefer-free-formats',
          '--force-keyframes-at-cuts',
          '--download-sections', `*${this.toHHMMSS(startTime)}-${this.toHHMMSS(endTime)}`,
          '--no-playlist',
          '--quiet',
          '--no-warnings',
          '--external-downloader', 'ffmpeg',
          '--external-downloader-args', 'ffmpeg_i:-nostdin -hide_banner -loglevel error -hwaccel none',
          '-o', '-',
          ...(isAudioOnly ? ['--extract-audio', '--audio-format', 'mp3'] : []),
          url
        ];

        

        const ytdlp = spawn('yt-dlp', ytArgs);

        ytdlp.stdout.pipe(s3WriteStream);

        let stderr = '';
        ytdlp.stderr.on('data', (data) => {
          const msg = data.toString();
          stderr += msg;
          logger.debug('yt-dlp stderr:', msg);
        });

        ytdlp.on('error', (err) => {
          logger.error('yt-dlp process error:', err);
          return reject(new Error('yt-dlp process failed to start.'));
        });

        ytdlp.on('close', async (code) => {
          if (code !== 0) {
            logger.error('yt-dlp exited with error:', stderr);
            return reject(new Error(`yt-dlp failed: ${stderr.trim() || 'Unknown error'}`));
          }

          try {
            await s3UploadDone;
            resolve();
          } catch (err) {
            logger.error('S3 upload error:', err);
            reject(new Error('Failed to complete S3 upload.'));
          }
        });

        progressCallback(30, 'Downloading & uploading trimmed part...');
      });
    });
  }

  getFormatSelector(format) {
    // Exclude AV1 (av01) and VP9 (vp9) codecs to ensure ffmpeg compatibility
    const formatMap = {
      '4k': 'bestvideo[height<=2160][vcodec!=av01][vcodec!=vp9]+bestaudio/best[height<=2160][vcodec!=av01][vcodec!=vp9]',
      '1080p': 'bestvideo[height<=1080][vcodec!=av01][vcodec!=vp9]+bestaudio/best[height<=1080][vcodec!=av01][vcodec!=vp9]',
      '720p': 'bestvideo[height<=720][vcodec!=av01][vcodec!=vp9]+bestaudio/best[height<=720][vcodec!=av01][vcodec!=vp9]',
      '480p': 'bestvideo[height<=480][vcodec!=av01][vcodec!=vp9]+bestaudio/best[height<=480][vcodec!=av01][vcodec!=vp9]',
      '360p': 'bestvideo[height<=360][vcodec!=av01][vcodec!=vp9]+bestaudio/best[height<=360][vcodec!=av01][vcodec!=vp9]',
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

   toHHMMSS(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }
  sanitizeTitle(title) {
    return title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }
}

module.exports = new VideoService();