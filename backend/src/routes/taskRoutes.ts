import express from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { query } from '../config/db';

const router = express.Router();

router.use(protect);

// Get all tasks
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user?.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', async (req: AuthRequest, res) => {
  const { title, description, status, priority, project_id, due_date } = req.body;
  
  try {
    const result = await query(
      `INSERT INTO tasks (title, description, status, priority, project_id, due_date, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description, status || 'todo', priority || 'medium', project_id, due_date, req.user?.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;

  try {
    const result = await query(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = NOW()
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
      [title, description, status, priority, due_date, id, req.user?.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;

  console.log('DELETE request - Task ID:', id, 'User ID:', req.user?.id);

  try {
    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user?.id]
    );

    console.log('Delete result:', result.rows);

    if (result.rows.length === 0) {
      console.log('Task not found or does not belong to user');
      return res.status(404).json({ message: 'Task not found or does not belong to you' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 