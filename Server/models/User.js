const mongoose = require("mongoose");
const Schema = mongoose.Schema;
<<<<<<< HEAD
=======
const bcrypt = require("bcrypt");
>>>>>>> cherif2

const RoleEnum = ["Client", "Admin"];

const UserSchema = new Schema({
<<<<<<< HEAD
    name:  String ,
    email: String,
    password: String,
    role: { type: String, enum: RoleEnum, default: "Client" },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }]
});

module.exports = mongoose.model("User", UserSchema);
=======
  googleId: { type: String, unique: true, sparse: true },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: { type: String, enum: RoleEnum, default: "Client" },
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: {
    type: Boolean,
    default: true, // Pour le moment
  },
  verificationToken: String,
  verificationTokenExpires: Date,
});

// Modifier le middleware pre-save
UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    if (!this.password || this.password.length < 6) {
      next(new Error("Le mot de passe doit contenir au moins 6 caractères"));
      return;
    }
  }
  next();
});

// Améliorer la méthode de comparaison de mot de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Erreur lors de la comparaison des mots de passe:", error);
    return false;
  }
};

module.exports = mongoose.model("User", UserSchema);
>>>>>>> cherif2
