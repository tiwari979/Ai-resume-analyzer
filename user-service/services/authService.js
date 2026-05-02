const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// In-memory store (replace with MongoDB/PostgreSQL in production)
const users = new Map();

const registerUser = async ({ name, email, password }) => {
  if (users.has(email)) {
    const err = new Error('User with this email already exists');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  users.set(email, user);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token,
  };
};

const loginUser = async ({ email, password }) => {
  const user = users.get(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    token,
  };
};

const getUserById = async (id) => {
  for (const user of users.values()) {
    if (user.id === id) {
      return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    }
  }
  const err = new Error('User not found');
  err.status = 404;
  throw err;
};

module.exports = { registerUser, loginUser, getUserById };
