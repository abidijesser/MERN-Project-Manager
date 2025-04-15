const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const transporter = require("../config/emailConfig");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
require("dotenv").config();

exports.generate2FA = async (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const user = await User.findById(req.user.id);
  user.twoFactorSecret = secret.base32;
  await user.save();

  qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
    res.json({ success: true, qrCode: data_url });
  });
};

exports.verify2FA = async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (verified) {
    user.twoFactorEnabled = true;
    await user.save();
    res.json({ success: true, message: "2FA enabled successfully" });
  } else {
    res.status(401).json({ success: false, error: "Invalid 2FA token" });
  }
};

async function register(req, res) {
  try {
    console.log("Registration request received:", req.body);
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log("Registration validation failed - missing fields");
      return res.status(400).json({
        success: false,
        error: "Tous les champs sont obligatoires",
      });
    }

    // Vérifier si l'email existe déjà
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      console.log("Registration failed - email already exists:", email);
      return res.status(400).json({
        success: false,
        error: "Email existe déjà",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Créer le nouvel utilisateur
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "Client", // Default to Client if no role is provided
      isVerified: true, // Pour le moment, on skip la vérification email
    });

    console.log("Attempting to save new user:", { name, email });
    await user.save();
    console.log("User saved successfully with ID:", user._id);

    // We're not automatically logging in the user after registration anymore
    // So we don't need to generate a token here
    console.log("User registered successfully");

    // Envoyer la réponse sans token
    console.log("Sending successful registration response");
    res.status(201).json({
      success: true,
      message: "Registration successful. Please log in with your credentials.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'enregistrement",
    });
  }
}

async function login(req, res) {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Validation
    if (!email || !password) {
      console.log("Login validation failed - missing email or password");
      return res.status(400).json({
        success: false,
        error: "Email et mot de passe sont requis",
      });
    }

    // Find the user
    console.log("Searching for user with email:", email);
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("Login failed - email not found:", email);
      return res.status(400).json({
        success: false,
        error: "Email non trouvé",
      });
    }

    // Verify the password
    console.log("Verifying password for user:", user.email);
    const isMatched = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatched ? "Yes" : "No");

    if (!isMatched) {
      console.log("Login failed - incorrect password for user:", user.email);
      return res.status(400).json({
        success: false,
        error: "Mot de passe incorrect",
      });
    }

    // Generate JWT and send response
    console.log("Generating JWT token for user:", user.email);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("JWT token generated successfully");

    console.log("Login successful for user:", user.email);
    // Return user data (excluding password) along with the token
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    console.log("Returning user data:", userData);
    res.status(200).json({ success: true, token, user: userData });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la connexion",
    });
  }
}

const getProfile = async (req, res) => {
  try {
    // The auth middleware already verified the token and attached the user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    // Get the full user data without the password
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching profile",
    });
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
    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if the user exists or not for security
      console.log(`Password reset attempt for non-existent email: ${email}`);
      return res.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

    await user.save();

    // Construct reset URL based on user role
    let resetUrl;
    if (user.role === "Admin") {
      // Admin users get the admin application reset URL
      resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    } else {
      // Regular users get the client application reset URL
      resetUrl = `http://localhost:3000/#/reset-password/${resetToken}`;
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Error sending password reset email:", error);
        // Even if email fails, we don't want to leak info
        // Potentially add internal logging here
        return res
          .status(500)
          .json({ success: false, error: "Error processing request." });
      }
      console.log("✅ Password reset email sent: %s", info.messageId);
      res.json({
        success: true,
        message: "Password reset link has been sent to your email.",
      });
    });
  } catch (error) {
    console.error("❌ Error in forgotPassword:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "Token and new password are required" });
    }

    // Hash the token from the URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by hashed token and check expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Password reset token is invalid or has expired.",
      });
    }

    // Validate new password length (optional but recommended)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear the token fields
    user.resetPasswordExpires = undefined;

    await user.save();

    // Optionally log the user in or send a confirmation email
    console.log("Password reset successful for user:", user.email);

    res.json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("❌ Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      error: "Error resetting password",
      details: error.message, // Keep details for debugging if needed
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

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching user",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // Find the user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // Only update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({
      success: false,
      error: "Error updating user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting user",
    });
  }
};
// Change password function
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the user with the new password
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({
      success: false,
      error: "Error changing password",
    });
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
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
};
