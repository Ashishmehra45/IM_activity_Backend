const employe = require("../models/employe");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

// 📝 REGISTER LOGIC
exports.register = async (req, res) => {
  try {
    // 1. Designation ko bhi body se nikalo (Frontend input ke hisab se)
    const { name, email, password, designation } = req.body;

    // 2. Check if user already exists
    let user = await employe.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ msg: "User with this email already exists" });

    // 3. Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Naya User Create Karo (Designation ke sath)
    user = new employe({
      name,
      email,
      password: hashedPassword,
      designation: designation || "Field Officer", // Default value agar user ne na bhari ho
      isApproved: false, // Default pending rakhna hai
      role: "Employee", // Default role
    });

    await user.save();

    res.status(201).json({
      msg: "Registration successful! Your account is sent for Admin approval.",
      success: true,
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// 🔑 LOGIN LOGIC
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User dhundo aur designation bhi fetch karo
    const user = await employe.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    // 2. Password match karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    // 3. SMART CHECK: Approval check
    // Agar Role 'Employee' hai tabhi approval check karo (Admins usually direct access karte hain)
    if (user.role === "Employee" && !user.isApproved) {
      return res.status(403).json({
        msg: "Your account is pending approval from the Admin!",
        pendingApproval: true,
      });
    }

    // 4. Token Generation
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // 5. Secure Cookie Set-up
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    // 6. Final Response
    res.json({
      msg: `Welcome back, ${user.name}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        designation: user.designation, // Frontend par profile dikhane ke liye
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};


// employeeController.js
exports.getMyTasks = async (req, res) => {
  try {
    const employeeId = req.user.id; // 👈 Ye id ab authMiddleware se aayegi, URL params se nahi

    const tasks = await Task.find({ assignedTo: employeeId })
      .populate('assignedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error loading tasks." });
  }
};

// 🔄 2. UPDATE TASK STATUS (Employee apna task In-Progress ya Completed karega)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;
    const employeeId = req.user.id; // Logged-in employee

    // Pehle task dhoondho
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task nahi mila!" });
    }

    // 🛡️ SECURITY CHECK: Kya ye task isi employee ka hai?
    if (task.assignedTo.toString() !== employeeId) {
      return res.status(403).json({ message: "Aap doosre ka task update nahi kar sakte!" });
    }

    // Status update karo aur save karo
    task.status = status;
    await task.save();

    res.status(200).json({ 
      success: true, 
      message: `Task marked as ${status} 🚀`, 
      task 
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Status update fail ho gaya." });
  }
};