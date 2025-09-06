// controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // adjust path if needed

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email, password required" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ username, email, password });

    const token = signToken(user);

    // Don't send password back
    const userSafe = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    return res.status(201).json({ message: "User created", token, user: userSafe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "emailOrUsername and password required" });
    }

    // allow login via email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);

    const userSafe = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    return res.json({ message: "Login successful", token, user: userSafe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    // authMiddleware will have attached req.userId
    const user = await User.findById(req.userId).select("-password -verifyToken -verifyTokenExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
