const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header - handles both "Bearer token" and direct "token" formats
  const authHeader = req.header('Authorization');
  let token;
  
  if (authHeader) {
    // Check if it's a Bearer token
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // If not Bearer format, use the header value directly
      token = authHeader;
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};