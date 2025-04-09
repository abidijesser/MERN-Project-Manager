const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middleware/auth");

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
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id,
      owner: req.user.id 
    }).populate("tasks members owner");
    
    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    res.status(200).json({ project });
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du projet" });
  }
});

// POST create a new project
router.post("/", auth, async (req, res) => {
  try {
    console.log("Données reçues :", req.body);
    const { projectName, description, startDate, endDate } = req.body;

    // Validation des champs requis
    if (!projectName || !description || !startDate || !endDate) {
      return res.status(400).json({ 
        error: "Tous les champs obligatoires doivent être remplis",
        details: {
          projectName: !projectName ? "Le nom du projet est requis" : null,
          description: !description ? "La description est requise" : null,
          startDate: !startDate ? "La date de début est requise" : null,
          endDate: !endDate ? "La date de fin est requise" : null
        }
      });
    }

    // Validation des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ 
        error: "La date de début doit être antérieure à la date de fin" 
      });
    }

    // Création du projet avec l'owner
    const project = new Project({
      ...req.body,
      owner: req.user.id,
      status: "Active" // Statut par défaut
    });

    await project.save();
    res.status(201).json({ 
      message: "Projet créé avec succès",
      project 
    });
  } catch (error) {
    console.error("Erreur lors de la création du projet :", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Erreur de validation",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      error: "Erreur lors de la création du projet",
      details: error.message 
    });
  }
});

// POST ajouter un commentaire à un projet
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { comment } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    if (!project.comments) {
      project.comments = [];
    }
    project.comments.push(comment);
    await project.save();
    res.status(200).json({ message: "Commentaire ajouté avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
  }
});

// PUT update an existing project
router.put("/:id", auth, async (req, res) => {
  try {
    const { projectName, description, startDate, endDate, status } = req.body;
    if (!projectName || !description || !startDate || !endDate || !status) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis" });
    }
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
router.delete("/:id", auth, async (req, res) => {
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
