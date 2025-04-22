const Project = require("../models/Project");
const User = require("../models/User");

// GET all projects - version admin qui voit tous les projets
const getAllProjects = async (req, res) => {
  try {
    // Les administrateurs peuvent voir tous les projets
    let projects;
    if (req.user.role === "Admin") {
      projects = await Project.find().populate("tasks members owner");
    } else {
      // Les utilisateurs normaux ne voient que leurs propres projets
      projects = await Project.find({
        $or: [
          { owner: req.user.id },
          { members: req.user.id }
        ]
      }).populate("tasks members owner");
    }
    
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
    let project;
    
    if (req.user.role === "Admin") {
      // Les administrateurs peuvent voir n'importe quel projet
      project = await Project.findById(req.params.id).populate("tasks members owner");
    } else {
      // Les utilisateurs normaux ne peuvent voir que leurs propres projets
      project = await Project.findOne({
        _id: req.params.id,
        $or: [
          { owner: req.user.id },
          { members: req.user.id }
        ]
      }).populate("tasks members owner");
    }

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Projet non trouvé" });
    }
    
    res.status(200).json({ success: true, project });
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
    const { projectName, description, startDate, endDate, members } = req.body;

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
    
    // Validation du nombre de membres (minimum 5)
    if (!members || !Array.isArray(members) || members.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Un projet doit avoir au moins 5 membres",
      });
    }
    
    // Vérifier que tous les membres existent et ont le rôle Client
    const memberUsers = await User.find({ _id: { $in: members } });
    
    if (memberUsers.length !== members.length) {
      return res.status(400).json({
        success: false,
        error: "Certains membres sélectionnés n'existent pas",
      });
    }
    
    // Vérifier que tous les membres sont des clients
    const nonClientMembers = memberUsers.filter(user => user.role !== "Client");
    if (nonClientMembers.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Tous les membres du projet doivent avoir le rôle Client",
      });
    }

    // Création du projet avec l'owner
    const project = new Project({
      ...req.body,
      owner: req.user.id,
      status: req.body.status || "Active", // Utiliser le statut fourni ou "Active" par défaut
      // S'assurer que tasks est un tableau vide
      tasks: [],
    });

    await project.save();
    
    // Ajouter ce projet aux projets de chaque membre
    for (const memberId of members) {
      await User.findByIdAndUpdate(memberId, {
        $push: { projects: project._id }
      });
    }
    
    // Ajouter ce projet aux projets de l'owner
    await User.findByIdAndUpdate(req.user.id, {
      $push: { projects: project._id }
    });
    
    res.status(201).json({
      success: true,
      message: "Projet créé avec succès",
      project,
    });
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    res.status(500).json({
      success: false,
      error: "Erreur interne lors de la création du projet",
    });
  }
};

// PUT update an existing project
const updateProject = async (req, res) => {
  try {
    const { projectName, description, startDate, endDate, status, members } = req.body;
    
    // Validation des champs requis
    if (!projectName || !description || !startDate || !endDate || !status) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs obligatoires doivent être remplis",
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
    
    // Validation du nombre de membres (minimum 5)
    if (!members || !Array.isArray(members) || members.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Un projet doit avoir au moins 5 membres",
      });
    }
    
    // Vérifier que tous les membres existent et ont le rôle Client
    const memberUsers = await User.find({ _id: { $in: members } });
    
    if (memberUsers.length !== members.length) {
      return res.status(400).json({
        success: false,
        error: "Certains membres sélectionnés n'existent pas",
      });
    }
    
    // Vérifier que tous les membres sont des clients
    const nonClientMembers = memberUsers.filter(user => user.role !== "Client");
    if (nonClientMembers.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Tous les membres du projet doivent avoir le rôle Client",
      });
    }
    
    // Trouver le projet existant
    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: "Projet non trouvé",
      });
    }
    
    // Vérifier les permissions (seul l'owner ou un admin peut modifier)
    if (existingProject.owner.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        error: "Vous n'avez pas la permission de modifier ce projet",
      });
    }
    
    // Mettre à jour le projet
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        projectName,
        description,
        startDate,
        endDate,
        status,
        members,
      },
      { new: true }
    ).populate("tasks members owner");
    
    // Mettre à jour les références dans les utilisateurs
    // 1. Supprimer ce projet de tous les utilisateurs qui ne sont plus membres
    const oldMembers = existingProject.members.map(m => m.toString());
    const removedMembers = oldMembers.filter(m => !members.includes(m));
    
    for (const memberId of removedMembers) {
      await User.findByIdAndUpdate(memberId, {
        $pull: { projects: existingProject._id }
      });
    }
    
    // 2. Ajouter ce projet aux nouveaux membres
    const newMembers = members.filter(m => !oldMembers.includes(m));
    
    for (const memberId of newMembers) {
      await User.findByIdAndUpdate(memberId, {
        $push: { projects: existingProject._id }
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Projet mis à jour avec succès",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet:", error);
    res.status(500).json({
      success: false,
      error: "Erreur interne lors de la mise à jour du projet",
    });
  }
};

// DELETE a project
const deleteProject = async (req, res) => {
  try {
    // Trouver le projet
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Projet non trouvé",
      });
    }
    
    // Vérifier les permissions (seul l'owner ou un admin peut supprimer)
    if (project.owner.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        error: "Vous n'avez pas la permission de supprimer ce projet",
      });
    }
    
    // Supprimer les références à ce projet dans tous les utilisateurs
    await User.updateMany(
      { projects: project._id },
      { $pull: { projects: project._id } }
    );
    
    // Supprimer le projet
    await Project.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Projet supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error);
    res.status(500).json({
      success: false,
      error: "Erreur interne lors de la suppression du projet",
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
