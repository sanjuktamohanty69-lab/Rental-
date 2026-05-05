const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });
};

// Register user
exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      const err = new Error('Username and password are required');
      err.statusCode = 400;
      return next(err);
    }
    const existing = await User.findOne({ username });
    if (existing) {
      const err = new Error('Username already exists');
      err.statusCode = 400;
      return next(err);
    }
    const user = new User({ username, password, role });
    await user.save();

    const token = generateToken(user);

    const userObj = { id: user._id, username: user.username, role: user.role };
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const err = new Error('Username and password are required');
      err.statusCode = 400;
      return next(err);
    }
    const user = await User.findOne({ username });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      return next(err);
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      return next(err);
    }
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
};
