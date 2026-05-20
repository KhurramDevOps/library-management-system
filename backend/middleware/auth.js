const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/sendResponse');

const getBearerToken = (req) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return null;
  }

  return header.split(' ')[1];
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
  });
};

const protect = (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return sendResponse(res, 401, false, 'Authorization token is required');
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || !['admin', 'librarian'].includes(req.user.role)) {
    return sendResponse(res, 403, false, 'Access denied');
  }

  return next();
};

module.exports = {
  protect,
  adminOnly,
  getBearerToken,
  verifyToken,
};
