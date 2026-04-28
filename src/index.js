require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const carparkRoutes = require('./routes/carparks');
const favoriteRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 3000;
const PORT_SEARCH_LIMIT = 10;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger-ui.html', (req, res) => {
  res.redirect('/api-docs');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/carparks', carparkRoutes);
app.use(['/api/favorites', '/api/favourites'], favoriteRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Carpark Information API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      documentation: '/api-docs',
      carparks: '/api/carparks',
      favorites: '/api/favorites'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

async function startServer() {
  for (let offset = 0; offset < PORT_SEARCH_LIMIT; offset += 1) {
    const candidatePort = Number(PORT) + offset;

    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(candidatePort, () => resolve(server));
        server.once('error', reject);
      });

      console.log(`✓ Server is running on http://localhost:${candidatePort}`);
      console.log(`✓ API Documentation: http://localhost:${candidatePort}/api-docs`);
      console.log(`✓ Health check: http://localhost:${candidatePort}/health`);
      return;
    } catch (error) {
      if (error.code !== 'EADDRINUSE') {
        throw error;
      }
    }
  }

  throw new Error(`Unable to find a free port starting from ${PORT}`);
}

// Start server
if (require.main === module) {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

module.exports = app;
