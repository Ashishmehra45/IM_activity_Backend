const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Denied! Token not found." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 1. User ka data extract karo
    const userData = decoded.user || decoded;

    // 🔥 2. ROLE CHECK: Agar role 'Employee' nahi hai, toh bhaga do
    // (Ensure karna ki login ke waqt tune token me 'role' save kiya tha)
    if (userData.role !== 'Employee') {
        return res.status(403).json({ 
            message: "Access Denied! Ye rasta sirf Employees ke liye hai." 
        });
    }

    // 3. Sab sahi hai, toh details 'req.user' mein daal do
    req.user = userData; 

    next();
  } catch (error) {
    console.error("Token Error:", error.message);
    return res.status(401).json({ message: "Invalid or Expired Token! login again." });
  }
};

module.exports = authMiddleware;