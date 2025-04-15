const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");

// User management functions
async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-password"); // Exclude password field
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching users",
    });
  }
}

async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching user",
    });
  }
}

async function updateUserById(req, res) {
  try {
    // Prevent updating sensitive fields
    const { password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: "Error updating user",
    });
  }
}

// Project management functions
async function getAllProjects(req, res) {
  try {
    const projects = await Project.find()
      .populate("owner", "name email")
      .populate("members", "name email");

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching projects",
    });
  }
}

// Task management functions
async function getAllTasks(req, res) {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("project", "projectName")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching tasks",
    });
  }
}

// Dashboard statistics
async function getDashboardStats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();

    const activeProjects = await Project.countDocuments({ status: "Active" });
    const completedProjects = await Project.countDocuments({
      status: "Completed",
    });

    const todoTasks = await Task.countDocuments({ status: "To Do" });
    const inProgressTasks = await Task.countDocuments({
      status: "In Progress",
    });
    const doneTasks = await Task.countDocuments({ status: "Done" });

    res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
        },
        tasks: {
          total: totalTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          done: doneTasks,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching dashboard statistics",
    });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  getAllProjects,
  getAllTasks,
  getDashboardStats,
};
