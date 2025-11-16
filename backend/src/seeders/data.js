require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    const users = [
      {
        firstName: 'Alok',
        email: 'admin@me.com',
        password: '123',
        role: 'admin'
      },
      {
        firstName: 'Amit',
        email: 'a@a.com',
        password: '123',
        role: 'employee'
      },
      {
        firstName: 'Bina',
        email: 'b@b.com',
        password: '123',
        role: 'employee'
      },
      {
        firstName: 'Cara',
        email: 'c@c.com',
        password: '123',
        role: 'employee'
      },
      {
        firstName: 'David',
        email: 'd@d.com',
        password: '123',
        role: 'employee'
      },
      {
        firstName: 'Eva',
        email: 'e@e.com',
        password: '123',
        role: 'employee'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    const adminUser = createdUsers.find(u => u.role === 'admin');
    const employeeUsers = createdUsers.filter(u => u.role === 'employee');

    const tasks = [
      {
        taskTitle: 'Complete project documentation',
        taskDescription: 'Write comprehensive documentation for the new feature including API endpoints and user guide',
        taskDate: new Date('2024-12-01'),
        category: 'Documentation',
        assignedTo: employeeUsers[0]._id,
        assignedBy: adminUser._id,
        status: 'newTask'
      },
      {
        taskTitle: 'Fix login authentication bug',
        taskDescription: 'Investigate and fix the authentication issue reported by multiple users during login',
        taskDate: new Date('2024-11-28'),
        category: 'Bug Fix',
        assignedTo: employeeUsers[1]._id,
        assignedBy: adminUser._id,
        status: 'active'
      },
      {
        taskTitle: 'Implement user dashboard',
        taskDescription: 'Create a responsive dashboard for users to view their tasks and statistics',
        taskDate: new Date('2024-12-05'),
        category: 'Development',
        assignedTo: employeeUsers[2]._id,
        assignedBy: adminUser._id,
        status: 'completed'
      },
      {
        taskTitle: 'Database optimization',
        taskDescription: 'Optimize database queries and add proper indexing for better performance',
        taskDate: new Date('2024-11-30'),
        category: 'Performance',
        assignedTo: employeeUsers[3]._id,
        assignedBy: adminUser._id,
        status: 'failed'
      },
      {
        taskTitle: 'Setup CI/CD pipeline',
        taskDescription: 'Configure continuous integration and deployment for automated testing and deployment',
        taskDate: new Date('2024-12-10'),
        category: 'DevOps',
        assignedTo: employeeUsers[4]._id,
        assignedBy: adminUser._id,
        status: 'newTask'
      },
      {
        taskTitle: 'Mobile app development',
        taskDescription: 'Start development of React Native mobile application for task management',
        taskDate: new Date('2024-12-15'),
        category: 'Development',
        assignedTo: employeeUsers[0]._id,
        assignedBy: adminUser._id,
        status: 'newTask'
      },
      {
        taskTitle: 'Security audit',
        taskDescription: 'Conduct comprehensive security audit and implement recommended security measures',
        taskDate: new Date('2024-12-03'),
        category: 'Security',
        assignedTo: employeeUsers[1]._id,
        assignedBy: adminUser._id,
        status: 'active'
      },
      {
        taskTitle: 'User testing session',
        taskDescription: 'Organize and conduct user testing sessions for the new features',
        taskDate: new Date('2024-12-08'),
        category: 'Testing',
        assignedTo: employeeUsers[2]._id,
        assignedBy: adminUser._id,
        status: 'active'
      }
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`Created ${createdTasks.length} tasks`);

    for (const task of createdTasks) {
      task.statusHistory.push({
        status: task.status,
        changedBy: task.assignedBy
      });
      await task.save();
    }

    console.log('Seeding completed successfully!');
    console.log('\n=== Seed Data Summary ===');
    console.log(`Admin: ${adminUser.firstName} (${adminUser.email})`);
    console.log(`Employees: ${employeeUsers.length} created`);
    console.log(`Tasks: ${createdTasks.length} created`);
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@me.com / 123');
    console.log('Employees: a@a.com through e@e.com / 123');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();