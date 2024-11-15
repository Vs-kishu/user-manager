const User = require("../models/user");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "-password"
    );

    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

exports.updateUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send("User not found");
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.send("User status updated");
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send("User deleted successfully");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Server error");
  }
};

exports.editUser = async (req, res) => {
  try {
    const { username, bananaClickCount } = req.body.updatedData;

    if (!username || typeof bananaClickCount !== "number") {
      return res.status(400).send("Invalid input data");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, bananaClickCount },
      { new: true } 
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error editing user:", err);
    res.status(500).send("Server error");
  }
};
