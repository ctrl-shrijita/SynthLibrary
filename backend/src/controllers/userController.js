import { User } from "../models/User.js";
import { publicUser } from "../utils.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    // Map through publicUser to strip out sensitive info (like password hashes)
    res.json({ users: users.map(publicUser) });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user._id.toString() === req.user._id.toString() && role === "user") {
      return res.status(400).json({ message: "You cannot demote yourself." });
    }

    user.role = role;
    await user.save();
    res.json({ message: "Role updated successfully.", user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};