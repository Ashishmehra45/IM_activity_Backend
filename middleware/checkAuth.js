const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Denied! Login karo pehle." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🔥 Sabse important: req.user ko set karo
    req.user = decoded.user || decoded; 
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Token!" });
  }
};

module.exports = checkAuth;