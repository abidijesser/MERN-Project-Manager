const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Fonction utilitaire pour valider un ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Obtenir tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des utilisateurs",
    });
  }
};

// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID d'utilisateur invalide"
      });
    }

    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("projects", "projectName")
      .populate("tasks", "title status");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'utilisateur",
    });
  }
};

// Créer un nouvel utilisateur
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs sont obligatoires",
      });
    }

    // Vérifier si l'email existe déjà
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({
        success: false,
        error: "Email existe déjà",
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "Client", // Default to Client if no role is provided
      isVerified: true, // Pour le moment, on skip la vérification email
    });

    await user.save();

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: userResponse,
    });
  } catch (error) {
    console.error("Create user error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Erreur de validation",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création de l'utilisateur",
    });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID d'utilisateur invalide"
      });
    }

    // Trouver l'utilisateur
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Mettre à jour les champs de l'utilisateur
    if (name) user.name = name;
    if (email && email !== user.email) {
      // Vérifier si le nouvel email existe déjà
      const emailExist = await User.findOne({ email });
      if (emailExist && emailExist._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          error: "Email existe déjà",
        });
      }
      user.email = email;
    }
    if (role) user.role = role;

    await user.save();

    // Retourner l'utilisateur mis à jour sans le mot de passe
    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("projects", "projectName")
      .populate("tasks", "title status");

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Erreur de validation",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de l'utilisateur",
    });
  }
};

// Mettre à jour le mot de passe d'un utilisateur
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID d'utilisateur invalide"
      });
    }

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Les mots de passe actuels et nouveaux sont requis",
      });
    }

    // Trouver l'utilisateur
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Vérifier si l'utilisateur qui fait la demande est le même que celui à modifier
    // ou s'il a un rôle d'administrateur
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        error: "Non autorisé à modifier le mot de passe d'un autre utilisateur",
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Mot de passe actuel incorrect",
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour du mot de passe",
    });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID d'utilisateur invalide"
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Vérifier si l'utilisateur qui fait la demande est un administrateur
    // ou s'il supprime son propre compte
    if (req.user.id !== req.params.id && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        error: "Non autorisé à supprimer cet utilisateur",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de l'utilisateur",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
};
