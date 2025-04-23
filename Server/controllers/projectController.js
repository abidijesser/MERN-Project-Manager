const Project = require("../models/Project");
const User = require("../models/User");

// GET all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).populate(
      "tasks members owner"
    );
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des projets",
    });
  }
};

// GET a single project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    }).populate("tasks members owner");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Projet non trouvé" });
    }
    res.status(200).json({ success: true, project: project });
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error);
    res.status(500).json({
      success: false,
      error: "Erreur interne lors de la récupération du projet",
    });
  }
};

// POST create a new project
const createProject = async (req, res) => {
  try {
    console.log("Données reçues :", req.body);
    const { projectName, description, startDate, endDate } = req.body;

    // Validation des champs requis
    if (!projectName || !description || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent être remplis",
        details: {
          projectName: !projectName ? "Le nom du projet est requis" : null,
          description: !description ? "La description est requise" : null,
          startDate: !startDate ? "La date de début est requise" : null,
          endDate: !endDate ? "La date de fin est requise" : null,
        },
      });
    }

    // Validation des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({
        success: false,
        error: "La date de début doit être antérieure à la date de fin",
      });
    }

    // Création du projet avec l'owner
    const project = new Project({
      ...req.body,
      owner: req.user.id,
      status: req.body.status || "Active", // Utiliser le statut fourni ou "Active" par défaut
      // S'assurer que tasks et members sont des tableaux
      tasks: req.body.tasks || [],
      members: req.body.members || [],
    });

    await project.save();
    res.status(201).json({
      success: true,
      message: "Projet créé avec succès",
      project,
    });
  } catch (error) {
    console.error("Erreur lors de la création du projet :", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Erreur de validation",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création du projet",
      details: error.message,
    });
  }
};

// POST add comment to project
const addComment = async (req, res) => {
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
};

// PUT update an existing project
const updateProject = async (req, res) => {
  try {
    const { projectName, description, startDate, endDate, status } = req.body;
    if (!projectName || !description || !startDate || !endDate || !status) {
      return res
        .status(400)
        .json({ error: "Tous les champs obligatoires doivent être remplis" });
    }
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du projet" });
  }
};

// DELETE a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }
    res.status(200).json({ message: "Projet supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du projet" });
  }
};
// GET project members
const getProjectMembers = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Validate project ID
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: "ID de projet requis",
      });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Projet non trouvé",
      });
    }

    // Get members details
    const members = await User.find(
      { _id: { $in: project.members } },
      "_id name email role"
    );

    res.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des membres du projet:",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des membres du projet",
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  addComment,
  updateProject,
  deleteProject,
  getProjectMembers,
};
