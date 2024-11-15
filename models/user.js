const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "player"], default: "player" },
  bananaClickCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false }, 

});
module.exports = mongoose.model("User", UserSchema);
