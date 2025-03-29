const Task = require("../models/Task");

// Créer une tâche
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    // Créer la tâche avec seulement les champs obligatoires
    const task = new Task({
      title,
      description,
      status: status || "To Do",
      priority: priority || "Medium",
      dueDate: dueDate || new Date(),
      createdBy: req.user.id, // Récupérer l'ID de l'utilisateur connecté depuis le token
    });

    // Ajouter assignedTo et project seulement s'ils sont fournis et non vides
    if (req.body.assignedTo && req.body.assignedTo.trim() !== "") {
      task.assignedTo = req.body.assignedTo;
    }

    if (req.body.project && req.body.project.trim() !== "") {
      task.project = req.body.project;
    }

    await task.save();

    // Peupler les références pour la réponse
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "name")
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
      .populate("project", "name")
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
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("project", "name")
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
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project,
    } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo,
        project,
      },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("project", "name")
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
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de la tâche",
    });
  }
};

// Supprimer une tâche
const deleteTask = async (req, res) => {
  try {
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
