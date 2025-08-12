import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'EasyMedPro API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Database health check
router.get('/db', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      success: true,
      database: {
        status: isConnected ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database health check failed',
      error: error.message
    });
  }
});

// Service health checks
router.get('/services', (req, res) => {
  const services = {
    twilio: {
      configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      status: 'unknown'
    },
    jwt: {
      configured: !!process.env.JWT_SECRET,
      status: 'operational'
    },
    mongodb: {
      configured: !!process.env.MONGODB_URI,
      status: 'unknown'
    }
  };

  res.json({
    success: true,
    services
  });
});

export default router;