const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Frontend se aane wale headers mein se token nikalo
  const authHeader = req.header('Authorization');

  // Agar header hi nahi hai ya 'Bearer ' se start nahi hota
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Denied! token not found." });
  }

  // 2. 'Bearer <token>' mein se sirf token ko alag karo
  const token = authHeader.split(' ')[1];

  try {
    // 3. Token ko verify karo apni SECRET KEY ke sath
    // (Ensure karna ki teri .env file me JWT_SECRET likha ho)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Token verify ho gaya! Ab user ki details (jaise id) 'req.user' me daal do
    req.user = decoded; 

    // 5. Agle function (controller) ke paas bhej do
    next();
  } catch (error) {
    console.error("Token Error:", error.message);
    return res.status(401).json({ message: "Invalid or Expired Token! login again." });
  }
};

module.exports = authMiddleware;