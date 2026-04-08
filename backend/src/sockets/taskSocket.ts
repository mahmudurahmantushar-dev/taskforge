import { Server, Socket } from 'socket.io';
import { query } from '../config/db';

export const setupTaskSockets = (io: Server) => {
  
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join a project room for real-time updates
    socket.on('joinProject', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`User ${socket.id} joined project: ${projectId}`);
    });

    // When a task is updated → broadcast to everyone in the project
    socket.on('taskUpdated', async (data) => {
      const { taskId, projectId, action } = data;
      
      try {
        const result = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
        const task = result.rows[0];

        if (task) {
          io.to(`project:${projectId}`).emit('taskChanged', {
            action,
            task,
            updatedBy: socket.id
          });
        }
      } catch (error) {
        console.error('Socket task update error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};  