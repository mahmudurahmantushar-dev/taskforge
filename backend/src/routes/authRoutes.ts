import express from 'express';
import { body } from 'express-validator';
import { query } from '../config/db';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register
router.post('/register', 
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const { email, password, name } = req.body;
    
    try {
      // Simple registration (we'll improve later with bcrypt)
      const result = await query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, password]
      );
      
      res.status(201).json({ 
        message: 'User registered successfully',
        user: result.rows[0]
      });
    } catch (error: any) {
      if (error.code === '23505') { // unique violation
        return res.status(400).json({ message: 'User already exists' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login (basic version for now)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // TODO: Add proper bcrypt comparison later
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 