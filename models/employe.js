const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"], 
    trim: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: [true, "Email is required"], 
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, "Password is required"] 
  },
  // ✨ Designation: Jo humne frontend me input banaya tha
  designation: { 
    type: String, 
    required: [true, "Designation is required"],
    trim: true 
  },
  role: { 
    type: String, 
    enum: ['Admin', 'Employee'], 
    default: 'Employee' 
  },
  // ✨ Admin approval status
  isApproved: { 
    type: Boolean, 
    default: false 
  },
  // ✨ Optional: Date of joining/registration
  createdAt: {
    type: Date,
    default: Date.now
  }
});



module.exports = mongoose.model('Employee', userSchema);