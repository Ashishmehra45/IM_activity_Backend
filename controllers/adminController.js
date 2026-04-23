const Employee = require('../models/employe'); // Apne model ka sahi path check kar lena
const Task = require('../models/task'); // Task model import karna

// 📝 GET ALL EMPLOYEES (Approved + Pending)
exports.getAllEmployees = async (req, res) => {
    try {
        // Saare users fetch karega, password chhod kar, aur naye users upar dikhayega
        const employees = await Employee.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json(employees);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ msg: "Server error while fetching employees" });
    }
};

// ✅ APPROVE EMPLOYEE
exports.approveEmployee = async (req, res) => {
    try {
        // URL params se ID nikalega (/approve/:id)
        const { id } = req.params;

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ msg: "Employee not found" });
        }

        if (employee.isApproved) {
            return res.status(400).json({ msg: "Employee is already approved" });
        }

        // Approval status true karo
        employee.isApproved = true;
        await employee.save();

        res.status(200).json({ 
            msg: `${employee.name} has been approved successfully!`,
            success: true 
        });
    } catch (err) {
        console.error("Approval Error:", err.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// ❌ REJECT / DELETE REQUEST
exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        
        const employee = await Employee.findByIdAndDelete(id);

        if (!employee) {
            return res.status(404).json({ msg: "Request not found" });
        }

        res.status(200).json({ msg: "Request rejected and removed." });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

exports.assignTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, assignedBy } = req.body;

    // 1. Check karo ki Employee ID (assignedTo) aayi hai ya nahi
    if (!assignedTo) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // 2. req.user check (Safety for req.user.id)
    // Agar tum token use kar rahe ho toh req.user.id chalega, 
    // nahi toh filhal body se assignedBy le lo.
    const adminId = req.user ? req.user.id : assignedBy;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    const newTask = new Task({
      title,
      description,
      priority: priority || 'Medium',
      assignedTo,   // Ye wahi Employee ki ID hai jise tumne click kiya
      assignedBy: adminId // Ye Admin ki ID hai
    });

    const savedTask = await newTask.save();
    
    res.status(201).json({
      success: true,
      message: "Task assigned successfully 🔥",
      task: savedTask
    });

  } catch (error) {
    console.error("Task Assignment Error:", error);
    res.status(500).json({ message: "Server Error: Task assign nahi ho paya" });
  }
};

// Get tasks for a SPECIFIC employee
exports.getEmployeeTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.id })
      .populate('assignedBy', 'name role') // 👈 Admin ka naam yahan bhi mangwa lo 🔥
      .sort({ createdAt: -1 });
      
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Tasks nahi mil rahe guru!" });
  }
};

// 🌐 GET ALL GLOBAL TASKS (For Global Tracking Tab)
// 🌐 GET ALL GLOBAL TASKS (For Global Tracking Tab)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name designation') // 👈 Jisko task mila (Employee)
      .populate('assignedBy', 'name role')        // 👈 Jisne task diya (Admin) 🔥 ADD THIS
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Global Tasks Error:", error);
    res.status(500).json({ message: "Server Error: Saare tasks fetch nahi ho paaye" });
  }
};