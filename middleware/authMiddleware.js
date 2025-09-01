const jwt = require('jsonwebtoken');
const User = require('../models/User'); // make sure the path is correct

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('username');
    if (!user) return res.status(401).json({ msg: 'User not found' });

    req.user = { id: decoded.id, _id: decoded.id, username: user.username };

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = { authenticateToken };
