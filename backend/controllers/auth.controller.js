const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendResponse = require('../utils/sendResponse');
const { getBearerToken, verifyToken } = require('../middleware/auth');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      algorithm: 'HS256',
    }
  );
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const getRequester = (req) => {
  const token = getBearerToken(req);

  if (!token) {
    return null;
  }

  return verifyToken(token);
};

/**
 * Register a new admin or librarian and return a JWT.
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', errors.array());
    }

    const adminExists = await User.exists({ role: 'admin' });
    const requester = getRequester(req);

    if (adminExists && (!requester || requester.role !== 'admin')) {
      return sendResponse(res, 403, false, 'Only an admin can register new users');
    }

    const requestedRole = req.body.role || (adminExists ? 'librarian' : 'admin');
    if (!adminExists && requestedRole !== 'admin') {
      return sendResponse(res, 400, false, 'First registered user must be an admin');
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: requestedRole,
    });

    const token = signToken(user);
    return sendResponse(res, 201, true, 'User registered successfully', {
      token,
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Authenticate a user by email and password and return a JWT.
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', errors.array());
    }

    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) {
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    const token = signToken(user);
    return sendResponse(res, 200, true, 'Login successful', {
      token,
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Return the authenticated user's profile.
 */
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    return sendResponse(res, 200, true, 'Profile fetched successfully', formatUser(user));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me,
};
