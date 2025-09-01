const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cache = require('../config/cache');

// Register User
exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }


    // Create new user
    user = new User({ username, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
// Get current user (based on token)
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `user_profile_${userId}`;

    const cachedUser = cache.get(cacheKey);
    if (cachedUser) {
      console.log('⚡ Served user from cache');
      return res.json(cachedUser);
    }

    const user = await User.findById(userId).select('username email');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    cache.set(cacheKey, user.toObject());

    res.json(user);
  } catch (err) {
    console.error('Get Me Error:', err.message);
    res.status(500).send('Server error');
  }
};
// Logout user
exports.logoutUser = (req, res) => {
  res.clearCookie('token').json({ msg: 'Logged out' });
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // ✅ Send token in HTTP-only cookie
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false, // true in production (with HTTPS)
        sameSite: 'Lax',
        maxAge: 60 * 60 * 1000 // 1 hour
      })
      .json({ message: 'Login successful', username: user.username });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

