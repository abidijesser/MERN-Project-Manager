const Task = require("../models/Task");
const mongoose = require("mongoose");
const notificationService = require("../services/notificationService");

// Fonction utilitaire pour valider un ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Créer une tâche
const createTask = async (req, res) => {
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

    // Validation des IDs si fournis
    if (assignedTo && !isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        error: "ID d'assignation invalide",
      });
    }

    if (project && !isValidObjectId(project)) {
      return res.status(400).json({
        success: false,
        error: "ID de projet invalide",
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
      project: project || null,
    });

    await task.save();

    // Créer une notification pour la nouvelle tâche
    await notificationService.createTaskNotification(
      task,
      "task_created",
      req.user
    );

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
        error: "ID de tâche invalide",
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
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project,
    } = req.body;

    // Validation de l'ID de la tâche
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID de tâche invalide",
      });
    }

    // Validation des IDs si fournis
    if (assignedTo && !isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        error: "ID d'assignation invalide",
      });
    }

    if (project && !isValidObjectId(project)) {
      return res.status(400).json({
        success: false,
        error: "ID de projet invalide",
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
      project: project || null,
    };

    // Supprimer les champs undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email")
      .populate("project", "projectName")
      .populate("createdBy", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Tâche non trouvée",
      });
    }

    // Créer une notification pour la mise à jour de la tâche
    await notificationService.createTaskNotification(
      task,
      "task_updated",
      req.user
    );

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Erreur de validation",
        details: Object.values(error.errors).map((err) => err.message),
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
        error: "ID de tâche invalide",
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

// Mettre à jour uniquement le statut d'une tâche (version simplifiée et robuste)
const updateTaskStatus = async (req, res) => {
  try {
    console.log("updateTaskStatus - Request body:", req.body);
    console.log("updateTaskStatus - Task ID:", req.params.id);
    console.log(
      "updateTaskStatus - User:",
      req.user ? { id: req.user._id, email: req.user.email } : "No user"
    );

    // Validation de l'ID de la tâche
    if (!isValidObjectId(req.params.id)) {
      console.log("updateTaskStatus - Invalid task ID");
      return res.status(400).json({
        success: false,
        error: "ID de tâche invalide",
      });
    }

    // Récupérer la tâche
    let existingTask;
    try {
      existingTask = await Task.findById(req.params.id);
      console.log(
        "updateTaskStatus - Existing task found:",
        existingTask ? true : false
      );
    } catch (findError) {
      console.error("updateTaskStatus - Error finding task:", findError);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la recherche de la tâche",
      });
    }

    if (!existingTask) {
      console.log("updateTaskStatus - Task not found");
      return res.status(404).json({
        success: false,
        error: "Tâche non trouvée",
      });
    }

    // Extraire le statut de la requête
    let status;
    if (typeof req.body === "string") {
      try {
        const parsedBody = JSON.parse(req.body);
        status = parsedBody.status;
        console.log(
          "updateTaskStatus - Parsed status from string body:",
          status
        );
      } catch (parseError) {
        console.error(
          "updateTaskStatus - Error parsing request body:",
          parseError
        );
        status = null;
      }
    } else {
      status = req.body.status;
      console.log(
        "updateTaskStatus - Status from request body object:",
        status
      );
    }

    // Vérifier si le statut est fourni
    if (!status) {
      console.log("updateTaskStatus - Status is missing");
      return res.status(400).json({
        success: false,
        error: "Le statut est requis",
      });
    }

    // Liste des statuts valides
    const validStatuses = ["To Do", "In Progress", "Done"];
    console.log("updateTaskStatus - Valid statuses:", validStatuses);

    // Vérifier si le statut est valide
    if (!validStatuses.includes(status)) {
      console.log("updateTaskStatus - Invalid status:", status);
      return res.status(400).json({
        success: false,
        error: `Statut invalide. Les valeurs autorisées sont: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    // Mettre à jour le statut
    console.log(
      "updateTaskStatus - Updating task status from",
      existingTask.status,
      "to",
      status
    );
    existingTask.status = status;

    try {
      await existingTask.save();
      console.log("updateTaskStatus - Task status updated successfully");
    } catch (saveError) {
      console.error("updateTaskStatus - Error saving task:", saveError);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'enregistrement de la tâche",
      });
    }

    // Récupérer la tâche mise à jour avec les relations
    let updatedTask;
    try {
      updatedTask = await Task.findById(req.params.id)
        .populate("assignedTo", "name email")
        .populate("project", "projectName")
        .populate("createdBy", "name");
      console.log("updateTaskStatus - Updated task retrieved successfully");
    } catch (populateError) {
      console.error(
        "updateTaskStatus - Error retrieving updated task:",
        populateError
      );
      // Continuer même si la récupération échoue, car la mise à jour a déjà réussi
      updatedTask = existingTask;
    }

    // Créer une notification (gérer les erreurs sans interrompre le processus)
    try {
      await notificationService.createTaskNotification(
        updatedTask,
        "task_status_updated",
        req.user
      );
      console.log("updateTaskStatus - Notification created successfully");
    } catch (notificationError) {
      console.error(
        "updateTaskStatus - Error creating notification:",
        notificationError
      );
      // Continuer même si la création de notification échoue
    }

    // Renvoyer la réponse
    console.log("updateTaskStatus - Sending success response");
    res.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task status error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour du statut de la tâche",
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
};
