# VideoTrim Pro Backend

A professional Node.js/Express backend for the VideoTrim Pro YouTube video trimming service.

## Features

- **Authentication**: Clerk.dev integration for secure user management
- **Video Processing**: YouTube video downloading and trimming with FFmpeg
- **Subscription Management**: Stripe integration for payments and subscriptions
- **File Management**: Secure file upload, processing, and download
- **Analytics**: User statistics and video processing insights
- **Rate Limiting**: Protection against abuse
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Robust error handling and validation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk.dev
- **Payments**: Stripe
- **Video Processing**: FFmpeg, ytdl-core
- **Validation**: Joi, express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. **Clone and install dependencies**:
```bash
cd backend
npm install
```

2. **Install FFmpeg**:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

3. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
# https://docs.mongodb.com/manual/installation/
```

5. **Start the server**:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

### Required Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/videotrim-pro

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID=price_your-subscription-price-id
```

### Optional Variables

```env
# Server
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173

# File Storage
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
MAX_FILE_SIZE=500000000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update user preferences
- `GET /api/auth/subscription` - Get subscription status

### Videos
- `GET /api/videos/validate?url=<youtube_url>` - Validate YouTube URL
- `POST /api/videos/trim` - Start video trimming
- `GET /api/videos/:id/status` - Get processing status
- `GET /api/videos/:id/download` - Download processed video
- `GET /api/videos/history` - Get user's video history
- `DELETE /api/videos/:id` - Delete video

### Subscriptions
- `POST /api/subscriptions/create-checkout-session` - Create Stripe checkout
- `POST /api/subscriptions/create-portal-session` - Create customer portal
- `GET /api/subscriptions/status` - Get subscription status

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Users
- `GET /api/users/stats` - Get user statistics

## Database Schema

### User Model
```javascript
{
  clerkId: String,
  email: String,
  firstName: String,
  lastName: String,
  subscription: {
    status: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date
  },
  usage: {
    videosProcessed: Number,
    totalDownloads: Number,
    storageUsed: Number
  }
}
```

### Video Model
```javascript
{
  userId: ObjectId,
  clerkUserId: String,
  originalUrl: String,
  videoId: String,
  title: String,
  duration: Number,
  trimSettings: {
    startTime: Number,
    endTime: Number
  },
  format: String,
  status: String,
  outputFile: {
    filename: String,
    path: String,
    size: Number
  },
  expiresAt: Date
}
```

## Video Processing Flow

1. **URL Validation**: Validate YouTube URL and extract video info
2. **Video Creation**: Create video record in database
3. **Download**: Download video from YouTube using ytdl-core
4. **Trimming**: Use FFmpeg to trim video to specified time range
5. **Storage**: Save processed file and update database
6. **Cleanup**: Remove temporary files and set expiration

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive validation using Joi and express-validator
- **Authentication**: Secure JWT-based authentication with Clerk
- **CORS**: Configurable CORS settings
- **Helmet**: Security headers
- **File Upload**: Secure file handling with size limits

## Error Handling

The API uses consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [/* validation errors */]
}
```

## Logging

Winston logger with multiple transports:
- Console (development)
- File rotation (production)
- Error-specific logs

## Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup
1. Set up MongoDB (Atlas recommended for production)
2. Configure Clerk webhook endpoints
3. Set up Stripe webhooks
4. Install FFmpeg on server
5. Configure file storage (local or cloud)

## Monitoring

- Health check endpoint: `GET /health`
- Comprehensive logging
- Error tracking
- Performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details