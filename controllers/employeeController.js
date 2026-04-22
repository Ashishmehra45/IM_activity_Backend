const employe = require('../models/employe');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await employe.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new employe({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "Registration successful! Wait for Admin approval." });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// LOGIN (Jo pehle discuss kiya tha)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await employe.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    if (user.role === 'Employee' && !user.isApproved) {
      return res.status(403).json({ msg: "Approval pending from Admin!" });
    }

    // 1. Token Generate Karo
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // 2. Cookie Set Karo (Security ke liye)
    res.cookie('token', token, {
      httpOnly: true,        // Frontend JS isse read nahi kar payegi (Safe from XSS)
      secure: process.env.NODE_ENV === 'production', // Sirf HTTPS par chalega production mein
      sameSite: 'strict',    // CSRF protection ke liye
      maxAge: 3600000        // 1 ghanta (ms mein)
    });

    // 3. JSON Response bhejo (LocalStorage mein save karne ke liye)
    res.json({ 
      msg: "Login Successful",
      token, // Ye frontend local storage mein save karega
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role 
      } 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};