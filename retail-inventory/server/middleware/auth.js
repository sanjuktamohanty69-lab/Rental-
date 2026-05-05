const jwt = require('jsonwebtoken');

// Protect middleware: verifies JWT and attaches decoded user to req.user
exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Not authorized, token missing');
      err.statusCode = 401;
      return next(err);
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const err = new Error('JWT_SECRET not set in environment');
      err.statusCode = 500;
      return next(err);
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};

// authorize middleware factory: allow only specified roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error('Forbidden: insufficient permissions');
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
};
