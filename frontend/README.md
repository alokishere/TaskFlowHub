# TaskFlowHub - MERN Stack Task Management Application

A complete task management application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring role-based authentication, task assignment, and status tracking.

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Password reset with email OTP
- Role-based access control (Admin/Employee)

### Task Management
- Create, assign, edit, and delete tasks (Admin only)
- Real-time task status updates
- Task categories and descriptions
- Due date tracking
- Status flow: newTask → active → completed/failed

### User Interface
- Responsive design with Tailwind CSS
- Real-time updates without page refresh
- Loading states and error handling
- Task statistics dashboard

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email services
- **Express-validator** for input validation

### Frontend
- **React 19.1.0** with Hooks
- **Vite** as build tool
- **Tailwind CSS** for styling
- **Axios** for HTTP requests
- **React Router** for navigation

## Project Structure

```
TaskFlowHub/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── config/          # Database and email configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Authentication, validation, error handling
│   │   ├── models/          # MongoDB schemas (User, Task)
│   │   ├── routes/          # API endpoints
│   │   ├── utils/           # Utility functions (bcrypt, JWT, OTP)
│   │   ├── validators/      # Input validation schemas
│   │   └── seeders/         # Database seeding script
│   ├── package.json
│   ├── server.js            # Express server entry point
│   └── .env.example         # Environment variables template
├── src/
│   ├── components/         # React components
│   │   ├── Auth/          # Login forms
│   │   ├── DashBoard/     # Admin/Employee dashboards
│   │   ├── TaskList/      # Task status components
│   │   └── other/         # Shared components
│   ├── context/           # React context for state management
│   ├── services/          # API service layer
│   └── utils/             # Client utilities and validation
├── public/                # Static assets
├── package.json
└── vite.config.js          # Vite configuration
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- Git

### 1. Backend Setup

```bash
cd TaskFlowHub/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Your JWT secret key
# - EMAIL_HOST: SMTP server (e.g., smtp.gmail.com)
# - EMAIL_PORT: SMTP port (e.g., 587)
# - EMAIL_USER: Your email address
# - EMAIL_PASS: Your email password/app password

# Start MongoDB service
mongod

# Seed the database with initial data
npm run seed

# Start the backend server
npm start

# For development with auto-reload
npm run dev
```

### 2. Frontend Setup

```bash
cd TaskFlowHub

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with:
# - VITE_API_URL: http://localhost:5000 (or your backend URL)

# Start the frontend development server
npm run dev

# Build for production
npm run build
```

### 3. Database Setup

#### Local MongoDB
```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Download from mongodb.com

# Start MongoDB
mongod

# Create database (created automatically on first connection)
```

#### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it to your `.env` file as `MONGODB_URI`

### 4. Email Configuration (Gmail)

1. Enable 2-Factor authentication on your Google Account
2. Go to Google Account settings → Security → App passwords
3. Generate a new app password
4. Use these credentials in your `.env`:
   - `EMAIL_USER`: your-email@gmail.com
   - `EMAIL_PASS`: your-generated-app-password

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP and reset password
- `POST /api/auth/verify-token` - Validate JWT token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/employees` - Get all employees (Admin only)
- `GET /api/users/stats` - Get task statistics

### Tasks
- `POST /api/tasks` - Create task (Admin only)
- `GET /api/tasks` - Get tasks (filtered by user role)
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id/status` - Update task status
- `PUT /api/tasks/:id` - Update task (Admin only)
- `DELETE /api/tasks/:id` - Delete task (Admin only)

## Default Credentials

After running the seeder, you can use these credentials:

### Admin
- **Email:** admin@me.com
- **Password:** 123

### Employees
- **Email:** a@a.com through e@e.com
- **Password:** 123

## Usage

### 1. Admin Workflow
1. Login as admin
2. Create tasks using the form
3. Assign tasks to employees from the dropdown
4. View all tasks in a card layout
5. Edit or delete tasks as needed
6. Monitor task status changes in real-time

### 2. Employee Workflow
1. Login as employee
2. View assigned tasks organized by status
3. Accept or reject new tasks
4. Work on active tasks
5. Mark tasks as completed or failed
6. View task statistics

## Development

### Running Tests
```bash
# Backend linting
npm run lint

# Frontend linting
npm run lint
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflowhub
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Security Features

- JWT token authentication with 24-hour expiry
- Password hashing with bcrypt (12 salt rounds)
- Role-based access control
- Input validation and sanitization
- Rate limiting on authentication endpoints
- CORS configuration
- Helmet.js for security headers

## Performance Features

- Database indexes for common queries
- Optimized API responses
- React component memoization
- Lazy loading of task data
- Efficient state management with React Context

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network connectivity

2. **Email Not Sending**
   - Verify email configuration
   - Check app password (not regular password)
   - Ensure less secure apps access is enabled

3. **CORS Errors**
   - Check VITE_API_URL in frontend .env
   - Verify backend CORS configuration

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET matches between restarts
   - Verify token hasn't expired

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.