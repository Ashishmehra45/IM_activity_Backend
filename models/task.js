const mongoose = require("mongoose");

// --- Timeline Schema (Task ke andar ki updates ke liye) ---
const TimelineSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Update", "Instruction", "Status Change"],
    default: "Update",
  },
  addedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Ya Admin
    name: String,
    role: { type: String, enum: ["Admin", "Employee"] },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// --- Main Task Schema ---
const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected"],
      default: "Pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    deadline: {
      type: Date,
    },
    // 🔥 YE RAHI TIMELINE ARRAY
    timeline: [TimelineSchema],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", TaskSchema);
