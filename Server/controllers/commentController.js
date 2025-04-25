const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");
const ActivityLog = require("../models/ActivityLog");
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

// Create a comment for a task
const createTaskComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;

    // Validate taskId
    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        error: "ID de tâche invalide",
      });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Tâche non trouvée",
      });
    }

    // Create comment
    const comment = new Comment({
      content,
      author: req.user.id,
      taskId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await comment.save();

    // Add comment to task
    task.comments.push(comment._id);
    await task.save();

    // Create activity log
    const activityLog = new ActivityLog({
      user: req.user.id,
      action: "COMMENT",
      entityType: "TASK",
      entityId: taskId,
      task: taskId,
      project: task.project,
      details: {
        commentId: comment._id,
        content: content.substring(0, 100) // Store a preview of the comment
      }
    });

    await activityLog.save();

    // Return the comment with author details
    const populatedComment = await Comment.findById(comment._id).populate("author", "name email");

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error creating task comment:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création du commentaire",
    });
  }
};

// Create a comment for a project
const createProjectComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { projectId } = req.params;

    // Validate projectId
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        error: "ID de projet invalide",
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Projet non trouvé",
      });
    }

    // Create comment
    const comment = new Comment({
      content,
      author: req.user.id,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await comment.save();

    // Add comment to project
    project.comments.push(comment._id);
    await project.save();

    // Create activity log
    const activityLog = new ActivityLog({
      user: req.user.id,
      action: "COMMENT",
      entityType: "PROJECT",
      entityId: projectId,
      project: projectId,
      details: {
        commentId: comment._id,
        content: content.substring(0, 100) // Store a preview of the comment
      }
    });

    await activityLog.save();

    // Return the comment with author details
    const populatedComment = await Comment.findById(comment._id).populate("author", "name email");

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error creating project comment:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création du commentaire",
    });
  }
};

// Get comments for a task
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate taskId
    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        error: "ID de tâche invalide",
      });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Tâche non trouvée",
      });
    }

    // Get comments for task
    const comments = await Comment.find({ taskId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error getting task comments:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des commentaires",
    });
  }
};

// Get comments for a project
const getProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate projectId
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        error: "ID de projet invalide",
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Projet non trouvé",
      });
    }

    // Get comments for project
    const comments = await Comment.find({ projectId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error getting project comments:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des commentaires",
    });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        error: "ID de commentaire invalide",
      });
    }

    // Check if comment exists and belongs to the user
    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Commentaire non trouvé ou vous n'êtes pas autorisé à le modifier",
      });
    }

    // Update comment
    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();

    // Create activity log
    const activityLog = new ActivityLog({
      user: req.user.id,
      action: "UPDATE",
      entityType: "COMMENT",
      entityId: commentId,
      task: comment.taskId,
      project: comment.projectId,
      details: {
        content: content.substring(0, 100) // Store a preview of the comment
      }
    });

    await activityLog.save();

    res.status(200).json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour du commentaire",
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        error: "ID de commentaire invalide",
      });
    }

    // Check if comment exists and belongs to the user
    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user.id,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Commentaire non trouvé ou vous n'êtes pas autorisé à le supprimer",
      });
    }

    // If comment is on a task, remove from task
    if (comment.taskId) {
      await Task.findByIdAndUpdate(comment.taskId, {
        $pull: { comments: commentId },
      });
    }

    // If comment is on a project, remove from project
    if (comment.projectId) {
      await Project.findByIdAndUpdate(comment.projectId, {
        $pull: { comments: commentId },
      });
    }

    // Create activity log before deleting the comment
    const activityLog = new ActivityLog({
      user: req.user.id,
      action: "DELETE",
      entityType: "COMMENT",
      entityId: commentId,
      task: comment.taskId,
      project: comment.projectId,
      details: {
        content: comment.content.substring(0, 100) // Store a preview of the deleted comment
      }
    });

    await activityLog.save();

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      success: true,
      message: "Commentaire supprimé avec succès",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression du commentaire",
    });
  }
};

module.exports = {
  createTaskComment,
  createProjectComment,
  getTaskComments,
  getProjectComments,
  updateComment,
  deleteComment,
};
