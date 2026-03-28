require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const projectRoutes = require('./src/routes/projects');

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
