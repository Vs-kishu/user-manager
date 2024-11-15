const express = require("express");
const {
  getUsers,
  updateUserStatus,
  deleteUser,
  editUser,
} = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getUsers);

router.patch("/block/:id", authMiddleware, updateUserStatus);

router.patch("/edit/:id", authMiddleware, editUser);

router.delete("/deleteUser/:id", authMiddleware, deleteUser);

module.exports = router;
