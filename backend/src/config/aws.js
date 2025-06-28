const AWS = require('aws-sdk');
const logger = require('../utils/logger');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4'
});

class S3Service {
  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET;
    this.presignedUrlExpiry = parseInt(process.env.PRESIGNED_URL_EXPIRY) || 3600;
  }

  // Generate unique S3 key for video
  generateVideoKey(videoId, format) {
    const timestamp = Date.now();
    const extension = format === 'mp3' ? 'mp3' : 'mp4';
    return `videos/${videoId}/${timestamp}.${extension}`;
  }

  // Upload video to S3
  async uploadVideo(filePath, key, contentType) {
    try {
      const fs = require('fs');
      const fileStream = fs.createReadStream(filePath);

      const uploadParams = {
        Bucket: this.bucket,
        Key: key,
        Body: fileStream,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          'uploaded-by': 'videotrim-pro',
          'upload-time': new Date().toISOString()
        }
      };

      const result = await s3.upload(uploadParams).promise();
      logger.info(`Video uploaded to S3: ${result.Location}`);
      
      return {
        location: result.Location,
        key: result.Key,
        etag: result.ETag
      };
    } catch (error) {
      logger.error('S3 upload error:', error);
      throw new Error('Failed to upload video to storage');
    }
  }

  // Generate pre-signed URL for download
  async generatePresignedUrl(key, filename) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: this.presignedUrlExpiry,
        ResponseContentDisposition: `attachment; filename="${filename}"`
      };

      const url = await s3.getSignedUrlPromise('getObject', params);
      logger.info(`Generated pre-signed URL for: ${key}`);
      
      return url;
    } catch (error) {
      logger.error('Pre-signed URL generation error:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  // Delete video from S3
  async deleteVideo(key) {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      await s3.deleteObject(params).promise();
      logger.info(`Video deleted from S3: ${key}`);
    } catch (error) {
      logger.error('S3 delete error:', error);
      throw new Error('Failed to delete video from storage');
    }
  }

  // Check if video exists in S3
  async videoExists(key) {
    try {
      await s3.headObject({
        Bucket: this.bucket,
        Key: key
      }).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  // Get video metadata
  async getVideoMetadata(key) {
    try {
      const result = await s3.headObject({
        Bucket: this.bucket,
        Key: key
      }).promise();

      return {
        size: result.ContentLength,
        lastModified: result.LastModified,
        contentType: result.ContentType,
        metadata: result.Metadata
      };
    } catch (error) {
      logger.error('Get metadata error:', error);
      throw new Error('Failed to get video metadata');
    }
  }
}

module.exports = new S3Service();