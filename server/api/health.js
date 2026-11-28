// Simple health check endpoint that doesn't require database
export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'AidLink API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}
