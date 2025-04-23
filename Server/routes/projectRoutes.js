const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const projectController = require("../controllers/projectController");

// Apply auth middleware to all routes
router.use(auth);

// GET all projects
router.get("/", projectController.getAllProjects);

// GET a single project by ID
router.get("/:id", projectController.getProjectById);

// POST create a new project
router.post("/", projectController.createProject);

// POST add comment to project
router.post("/:id/comments", projectController.addComment);

// PUT update an existing project
router.put("/:id", projectController.updateProject);

// DELETE a project
router.delete("/:id", projectController.deleteProject);

// GET project members
router.get("/:id/members", projectController.getProjectMembers);

module.exports = router;
