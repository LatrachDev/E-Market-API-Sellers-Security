const jwt = require('jsonwebtoken');

// middleware to verify JWT token and authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    // get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token verification failed' });
  }
};

module.exports = { authenticateUser };