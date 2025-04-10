const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const projectController = require("../controllers/projectController");
const Project = require("../models/Project");

// GET all projects
router.get("/", auth, async (req, res) => {
  try {
    // Filtrer les projets par propriétaire (utilisateur connecté)
    const projects = await Project.find({ owner: req.user.id }).populate("tasks members owner");
    res.status(200).json({ projects });
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des projets" });
  }
});

// GET a single project by ID
router.get("/:id", auth, projectController.getProjectById);

// POST create a new project
router.post("/", auth, projectController.createProject);

// POST add comment to project
router.post("/:id/comments", auth, projectController.addComment);

// PUT update an existing project
router.put("/:id", auth, projectController.updateProject);

// DELETE a project
router.delete("/:id", auth, projectController.deleteProject);

module.exports = router;
