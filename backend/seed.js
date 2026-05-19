const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Book = require('./models/Book');
const Student = require('./models/Student');
const IssueRecord = require('./models/IssueRecord');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      IssueRecord.deleteMany(),
      Book.deleteMany(),
      Student.deleteMany(),
      User.deleteMany(),
    ]);

    await User.create({
      name: 'Admin',
      email: 'admin@library.com',
      password: 'Admin@123',
      role: 'admin',
    });

    await Book.insertMany([
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        category: 'Programming',
        totalCopies: 4,
        availableCopies: 4,
        publishedYear: 2008,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt and David Thomas',
        isbn: '9780201616224',
        category: 'Programming',
        totalCopies: 3,
        availableCopies: 3,
        publishedYear: 1999,
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '9780553380163',
        category: 'Science',
        totalCopies: 2,
        availableCopies: 2,
        publishedYear: 1988,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '9780735211292',
        category: 'Self Help',
        totalCopies: 5,
        availableCopies: 5,
        publishedYear: 2018,
      },
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        isbn: '9780061122415',
        category: 'Fiction',
        totalCopies: 3,
        availableCopies: 3,
        publishedYear: 1988,
      },
    ]);

    await Student.insertMany([
      {
        name: 'Ali Khan',
        rollNumber: 'LIB-001',
        email: 'ali@example.com',
        phone: '03001234567',
        department: 'Computer Science',
      },
      {
        name: 'Sara Ahmed',
        rollNumber: 'LIB-002',
        email: 'sara@example.com',
        phone: '03007654321',
        department: 'Physics',
      },
      {
        name: 'Hassan Raza',
        rollNumber: 'LIB-003',
        email: 'hassan@example.com',
        phone: '03009876543',
        department: 'Business',
      },
    ]);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
