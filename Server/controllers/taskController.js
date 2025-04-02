const Task = require("../models/Task");
const mongoose = require("mongoose");

// Fonction utilitaire pour valider un ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Créer une tâche
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

    // Validation des IDs si fournis
    if (assignedTo && !isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        error: "ID d'assignation invalide"
      });
    }

    if (project && !isValidObjectId(project)) {
      return res.status(400).json({
        success: false,
        error: "ID de projet invalide"
      });
    }

    // Créer la tâche
    const task = new Task({
      title,
      description,
      status: status || "To Do",
      priority: priority || "Medium",
      dueDate: dueDate || new Date(),
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
      project: project || null
    });

    await task.save();

    // Peupler les références pour la réponse
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "projectName")
      .populate("createdBy", "name");

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de la tâche",
      details: error.message,
    });
  }
};

// Obtenir toutes les tâches
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("project", "projectName")
      .populate("createdBy", "name");

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des tâches",
    });
  }
};

// Obtenir une tâche par ID
const getTaskById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID de tâche invalide"
      });
    }

    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("project", "projectName")
      .populate("createdBy", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Tâche non trouvée",
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de la tâche",
    });
  }
};

// Mettre à jour une tâche
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

    // Validation de l'ID de la tâche
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID de tâche invalide"
      });
    }

    // Validation des IDs si fournis
    if (assignedTo && !isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        error: "ID d'assignation invalide"
      });
    }

    if (project && !isValidObjectId(project)) {
      return res.status(400).json({
        success: false,
        error: "ID de projet invalide"
      });
    }

    // Préparer les données de mise à jour
    const updateData = {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      project: project || null
    };

    // Supprimer les champs undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email")
      .populate("project", "projectName")
      .populate("createdBy", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Tâche non trouvée",
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Erreur de validation",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la tâche",
    });
  }
};

// Supprimer une tâche
const deleteTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID de tâche invalide"
      });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Tâche non trouvée",
      });
    }

    res.json({
      success: true,
      message: "Tâche supprimée avec succès",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de la tâche",
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
