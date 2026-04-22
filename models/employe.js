const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Employee'], 
    default: 'Employee' 
  },
  isApproved: { type: Boolean, default: false } // Admin ke liye hum isse manual true karenge
});

module.exports = mongoose.model('Employee', userSchema);