require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { initDatabase, isPostgresConnected } = require('./config/db');
const { initSocket } = require('./services/socketService');

const bookingsRouter = require('./routes/bookings');
const resourcesRouter = require('./routes/resources');
const analyticsRouter = require('./routes/analytics');
const simulationRouter = require('./routes/simulation');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io WebSocket server
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/resources', resourcesRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/simulate', simulationRouter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    postgresConnected: isPostgresConnected(),
    engine: isPostgresConnected() ? 'PostgreSQL Native' : 'Autonomous GiST In-Memory Engine'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 Smart Campus Conflict Detection Engine Server`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server Initialized on port ${PORT}`);
  console.log(`=======================================================`);
  await initDatabase();
});

module.exports = { app, server };
