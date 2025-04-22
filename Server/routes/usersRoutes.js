const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const authController = require("../controllers/authController");

// Apply auth middleware to all routes
router.use(auth);

// GET all users (admin only)
router.get("/", adminAuth, authController.getAllUsers);

// GET a single user by ID (admin only)
router.get("/:id", adminAuth, authController.getUserById);

// POST create a new user (admin only)
router.post("/", adminAuth, authController.createUserByAdmin);

// PUT update a user (admin only)
router.put("/:id", adminAuth, authController.updateUser);

// DELETE a user (admin only)
router.delete("/:id", adminAuth, authController.deleteUser);

module.exports = router;
