const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// GET all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("tasks members owner");
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des projets" });
  }
});

// GET a single project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("tasks members owner");
    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du projet" });
  }
});

// POST create a new project
router.post("/", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création du projet" });
  }
});

// POST ajouter un commentaire à un projet
router.post("/:id/comments", async (req, res) => {
  try {
    const { comment } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    if (!project.comments) {
      project.comments = [];
    }
    project.comments.push(comment); // Ajout du commentaire
    await project.save();
    res.status(200).json({ message: "Commentaire ajouté avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
  }
});

// PUT update an existing project
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du projet" });
  }
});

// DELETE a project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    res.status(200).json({ message: "Projet supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du projet" });
  }
});

module.exports = router;
