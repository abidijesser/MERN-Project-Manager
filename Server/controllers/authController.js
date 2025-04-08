const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const transporter = require("../config/emailConfig");

async function register(req, res) {
  try {
    console.log('Données reçues:', req.body);
    const { name, email, password, role } = req.body;

    // Validation améliorée
    if (!name || !email || !password) {
      console.log('Validation échouée:', { name, email });
      return res.status(400).json({
        success: false,
        error: "Tous les champs sont obligatoires",
      });
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Format d'email invalide",
      });
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Vérifier si l'email existe déjà
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      console.log('Email existe déjà:', email);
      return res.status(400).json({
        success: false,
        error: "Email existe déjà",
      });
    }

    // Validation du rôle
    if (role && !["Client", "Admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Rôle invalide",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Client',
      isVerified: true,
    });

    console.log('Tentative de sauvegarde de l\'utilisateur:', { name, email, role });
    await user.save();
    console.log('Utilisateur sauvegardé avec succès');

    // Créer le token JWT avec le rôle
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Envoyer la réponse avec les informations utilisateur
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Erreur détaillée lors de l'enregistrement:", error);
    
    // Gestion spécifique des erreurs MongoDB
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Cet email est déjà utilisé",
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'enregistrement",
      details: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email et mot de passe sont requis",
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Email non trouvé",
      });
    }

    // Vérifier le mot de passe
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({
        success: false,
        error: "Mot de passe incorrect",
      });
    }

    // Créer le token JWT avec le rôle
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Envoyer la réponse avec le rôle
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Erreur lors de la connexion",
    });
  }
}

const getProfile = async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decodedToken) => {
      if (err) throw err;

      // Récupérer les informations complètes de l'utilisateur
      const user = await User.findById(decodedToken.id).select("-password");
      res.json(user);
    });
  } else {
    res.json(null);
  }
};

const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getProfileById:", error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        // Ajoutez d'autres champs si nécessaire
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ error: "Error updating profile" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
    await user.save();

    // Au lieu d'envoyer un email, on renvoie directement le token
    const resetUrl = `http://localhost:3000/#/reset-password/${resetToken}`;

    res.json({
      success: true,
      message: "Token de réinitialisation généré avec succès",
      resetUrl: resetUrl,
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ error: "Erreur lors de la génération du token" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Mot de passe réinitialisé avec succès",
      success: true,
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      error: "Erreur lors de la réinitialisation du mot de passe",
      details: error.message,
    });
  }
};

// Fonction pour vérifier l'email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: "Email vérifié avec succès" });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la vérification de l'email" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getProfileById,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
