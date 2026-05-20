const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const studentRoutes = require('./routes/student.routes');
const issueRoutes = require('./routes/issue.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const errorHandler = require('./middleware/errorHandler');
const sendResponse = require('./utils/sendResponse');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().catch((error) => {
  console.error(`MongoDB connection failed: ${error.message}`);
  process.exit(1);
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  return sendResponse(res, 200, true, 'API is healthy');
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  return sendResponse(res, 404, false, 'Route not found');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
