const Document = require("../models/Document");
const User = require("../models/User");
const Project = require("../models/Project");
const Comment = require("../models/Comment");
const notificationService = require("../services/notificationService");
const fs = require("fs");
const path = require("path");

// Get all documents (with optional filtering)
const getAllDocuments = async (req, res) => {
  try {
    const { projectId, userId, type } = req.query;
    const query = {};

    // Add filters if provided
    if (projectId) query.project = projectId;
    if (userId) query.uploadedBy = userId;
    if (type) query.fileType = type;

    // Get documents with permissions for the current user
    const documents = await Document.find({
      $or: [
        { uploadedBy: req.user.id }, // Documents uploaded by the user
        { isPublic: true }, // Public documents
        { "permissions.user": req.user.id }, // Documents with explicit permissions
        // If the user is part of a project, include all documents from that project
        {
          project: {
            $in: await Project.find({ members: req.user.id }).distinct("_id"),
          },
        },
      ],
      ...query,
    })
      .populate("uploadedBy", "name email")
      .populate("project", "name")
      .sort({ uploadedDate: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get a single document by ID
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("uploadedBy", "name email")
      .populate("project", "name")
      .populate({
        path: "versions.uploadedBy",
        select: "name email",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email",
        },
      });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Check if user has permission to view this document
    const hasPermission =
      document.uploadedBy._id.toString() === req.user.id ||
      document.isPublic ||
      document.permissions.some(
        (p) => p.user.toString() === req.user.id && ["view", "edit", "admin"].includes(p.access)
      );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to view this document",
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Create a new document
const createDocument = async (req, res) => {
  try {
    // File should be uploaded via multer middleware
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a file",
      });
    }

    const { name, description, project, isPublic } = req.body;

    // Create document record
    const document = await Document.create({
      name: name || req.file.originalname,
      description,
      filePath: req.file.path,
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      project: project || null,
      uploadedBy: req.user.id,
      isPublic: isPublic === "true",
    });

    // Créer une notification pour le nouveau document
    try {
      await notificationService.createDocumentNotification(
        document,
        "document_uploaded",
        req.user
      );
      console.log("Document upload notification created successfully");
    } catch (notificationError) {
      console.error("Error creating document upload notification:", notificationError);
      // Continue despite notification error
    }

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error creating document:", error);

    // If there was an error, remove the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Update document details
const updateDocument = async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Check if user has permission to edit this document
    const hasPermission =
      document.uploadedBy.toString() === req.user.id ||
      document.permissions.some(
        (p) => p.user.toString() === req.user.id && ["edit", "admin"].includes(p.access)
      );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this document",
      });
    }

    // Update document
    const { name, description, project, isPublic, pinned } = req.body;

    document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        project,
        isPublic,
        pinned,
        lastModified: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Check if user has permission to delete this document
    const hasPermission =
      document.uploadedBy.toString() === req.user.id ||
      document.permissions.some(
        (p) => p.user.toString() === req.user.id && p.access === "admin"
      );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to delete this document",
      });
    }

    // Delete file from storage
    fs.unlink(document.filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }

      // Delete document from database
      await Document.deleteOne({ _id: document._id });

      res.status(200).json({
        success: true,
        data: {},
      });
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Update document permissions
const updatePermissions = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Check if user has permission to manage permissions
    const hasPermission =
      document.uploadedBy.toString() === req.user.id ||
      document.permissions.some(
        (p) => p.user.toString() === req.user.id && p.access === "admin"
      );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to manage document permissions",
      });
    }

    const { userId, access } = req.body;

    // Validate user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update permissions
    const permissionIndex = document.permissions.findIndex(
      (p) => p.user.toString() === userId
    );

    if (permissionIndex > -1) {
      // Update existing permission
      document.permissions[permissionIndex].access = access;
    } else {
      // Add new permission
      document.permissions.push({
        user: userId,
        access,
      });
    }

    await document.save();

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Upload a new version of a document
const uploadNewVersion = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Check if user has permission to edit this document
    const hasPermission =
      document.uploadedBy.toString() === req.user.id ||
      document.permissions.some(
        (p) => p.user.toString() === req.user.id && ["edit", "admin"].includes(p.access)
      );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this document",
      });
    }

    // File should be uploaded via multer middleware
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a file",
      });
    }

    // Add current version to versions array
    document.versions.push({
      filePath: document.filePath,
      fileSize: document.fileSize,
      uploadedBy: document.uploadedBy,
      uploadedDate: document.uploadedDate,
      comment: req.body.comment || "Previous version",
    });

    // Update document with new file
    document.filePath = req.file.path;
    document.fileSize = req.file.size;
    document.lastModified = Date.now();
    document.uploadedDate = Date.now();

    await document.save();

    // Créer une notification pour la nouvelle version du document
    try {
      await notificationService.createDocumentVersionNotification(
        document,
        req.user
      );
      console.log("Document version notification created successfully");
    } catch (notificationError) {
      console.error("Error creating document version notification:", notificationError);
      // Continue despite notification error
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error uploading new version:", error);

    // If there was an error, remove the uploaded file
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Toggle pin status
const togglePin = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Check if user has permission to edit this document
    const hasPermission =
      document.uploadedBy.toString() === req.user.id ||
      document.permissions.some(
        (p) => p.user.toString() === req.user.id && ["edit", "admin"].includes(p.access)
      );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to pin/unpin this document",
      });
    }

    // Toggle pin status
    document.pinned = !document.pinned;
    await document.save();

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error toggling pin status:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  updatePermissions,
  uploadNewVersion,
  togglePin,
};
