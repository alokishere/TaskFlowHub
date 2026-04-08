require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const projectRoutes = require('./src/routes/projects');
const attendanceRoutes = require('./src/routes/attendance');
const leaveRoutes = require('./src/routes/leaves');
const salaryRoutes = require('./src/routes/salaries');
const messageRoutes = require('./src/routes/messages');
const documentRoutes = require('./src/routes/documents');
const blogRoutes = require('./src/routes/blogs');
require('./cron/punchInReminder');

const app = express();

connectDB();


app.use(
  cors()
);
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));
app.use('/public', express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/push', require('./routes/push'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running' });
});

app.get('/', (req, res) => {
  res.send('Task Flow backend is running properly 🚀');
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
