import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import { pool } from './config/db';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { setupTaskSockets } from './sockets/taskSocket';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",   // Angular default port
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Setup real-time sockets
setupTaskSockets(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 TaskForge Backend running on http://localhost:${PORT}`);
  
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
});

export { io }; 