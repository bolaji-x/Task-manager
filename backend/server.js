
        const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ================= AUTH ROUTES =================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, existingUser) => {
            if (err) {
                console.error('Register - DB error:', err);
                return res.status(500).json({ message: 'server error', error: err.message });
            }
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            db.run(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                function (err) {
                    if (err) {
                        console.error('Register - Insert error:', err);
                        return res.status(500).json({ message: 'server error', error: err.message });
                    }
                    res.status(201).json({ message: 'You can Login' });
                }
            );
        });
    } catch (error) {
        console.error('Register - Catch error:', error);
        res.status(500).json({ message: 'server error', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Login - DB error:', err);
                return res.status(500).json({ message: 'server error', error: err.message });
            }
            if (!user) return res.status(400).json({ message: 'invalid Credential' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'invalid credential' });

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        });
    } catch (error) {
        console.error('Login - Catch error:', error);
        res.status(500).json({ message: 'server error', error: error.message });
    }
});

// ================= TASK ROUTES (PROTECTED + PER-USER) =================

app.post('/api/tasks', authMiddleware, (req, res) => {
    console.log('=== CREATE TASK ===');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);

    const { title, description, due_date } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    if (!req.user || !req.user.id) {
        console.error('No user found in token');
        return res.status(401).json({ message: 'Invalid token - no user id' });
    }

    db.run(
        'INSERT INTO tasks (title, description, completed, user_id, due_date) VALUES (?, ?, 0, ?, ?)',
        [title, description || '', req.user.id, due_date || null],
        function (err) {
            if (err) {
                console.error('Create Task - Database error:', err);
                return res.status(500).json({ message: 'server error', error: err.message });
            }

            res.status(201).json({
                id: this.lastID,
                title,
                description: description || '',
                completed: false,
                due_date: due_date || null
            });
        }
    );
});

app.get('/api/tasks', authMiddleware, (req, res) => {
    console.log('=== GET TASKS ===');
    console.log('User from token:', req.user);

    db.all('SELECT * FROM tasks WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) {
            console.error('Get Tasks - Database error:', err);
            return res.status(500).json({ message: 'server error', error: err.message });
        }
        res.status(200).json(rows);
    });
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { title, description, completed, due_date } = req.body;

    db.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], (err, task) => {
        if (err) {
            console.error('Update Task - Find error:', err);
            return res.status(500).json({ message: 'server error', error: err.message });
        }
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const updatedTitle = title !== undefined ? title : task.title;
        const updatedDescription = description !== undefined ? description : task.description;
        const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : task.completed;
        const updatedDueDate = due_date !== undefined ? due_date : task.due_date;

        db.run(
            'UPDATE tasks SET title = ?, description = ?, completed = ?, due_date = ? WHERE id = ? AND user_id = ?',
            [updatedTitle, updatedDescription, updatedCompleted, updatedDueDate, id, req.user.id],
            function (err) {
                if (err) {
                    console.error('Update Task - Update error:', err);
                    return res.status(500).json({ message: 'server error', error: err.message });
                }
                res.status(200).json({
                    id,
                    title: updatedTitle,
                    description: updatedDescription,
                    completed: !!updatedCompleted,
                    due_date: updatedDueDate
                });
            }
        );
    });
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
        if (err) {
            console.error('Delete Task - Database error:', err);
            return res.status(500).json({ message: 'server error', error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task deleted' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));