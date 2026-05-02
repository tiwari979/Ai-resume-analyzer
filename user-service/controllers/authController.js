const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const result = await authService.registerUser({ name, email, password });
    res.status(201).json({ message: 'User registered successfully', user: result.user, token: result.token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await authService.loginUser({ email, password });
    res.json({ message: 'Login successful', user: result.user, token: result.token });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  // In a real app, invalidate the token in a blocklist/Redis
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, getProfile, logout };
