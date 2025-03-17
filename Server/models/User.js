const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoleEnum = ["Client", "Admin"];

const UserSchema = new Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: RoleEnum, default: "Client" },
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

module.exports = mongoose.model("User", UserSchema);
