// controllers/authController.js
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs"; // adjust path if needed

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    // 1. Check if email exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // 2. Check if email is verified
    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email before logging in" });

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // 1 day
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// export const signup = async (req, res) => {
//   const { username, email, password } = req.body;
//       console.log("Registration attempt for:", { username, email });
      
//       try {
//       if (!username || !email || !password) {
//         console.log("Missing required fields");
//         return res.status(400).json({ message: "All fields are required" });
//       } 
      
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         console.log("Email already exists:", email);
//         return res.status(409).json({ message: "Email already exists" });
//       }
  
//       console.log("Creating new user...");
      
//       // Create verification token
//       const token = crypto.randomBytes(32).toString("hex");
  
//       // Save user with email verification
//       const user = await User.create({
//         username,
//         email,
//         password,
//         verifyToken: token,
//         verifyTokenExpires: Date.now() + 3600000, // 1 hour
//       });
  
//       console.log("User created successfully:", user._id);
  
//       // Send verification email
//       try {
//         const transporter = nodemailer.createTransport({
//           service: "Gmail",
//           auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS, // use App Password if Gmail
//           },
//         });
  
//         const link = `${baseUrl}/verify-email?token=${token}`;
        
//         await transporter.sendMail({
//           from: '"Solo To-Do" <no-reply@solotodo.com>',
//           to: user.email,
//           subject: "Verify Your Email",
//           html: `<h3>Hello, ${username}</h3>
//                  <p>Click below to verify your email:</p>
//                  <a href="${link}">${link}</a>`,
//         });
        
//         console.log("Verification email sent successfully");
//       } catch (emailError) {
//         console.error("Email sending failed:", emailError);
//         // Don't fail registration if email fails, just log it
//       }
  
//       return res.status(201).json({ message: "Registered! Check your email to verify." });
  
//     } catch (error) {
//       console.error("Registration error details:", error);
//       console.error("Error stack:", error.stack);
//       return res.status(500).json({ message: "Something went wrong", details: error.message });
//     }
// };
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour

    // Save user
    const user = await User.create({
      username : name,
      email,
      password,
      verifyToken: token,
      verifyTokenExpires: tokenExpires,
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verifyUrl = `http://localhost:3000/auth/verify-email?token=${token}&email=${email}`;

    await transporter.sendMail({
      from: `"SynergySphere" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your email",
      html: `<p>Hi ${name},</p>
             <p>Please verify your email by clicking this link:</p>
             <a href="${verifyUrl}">Verify Email</a>`,
    });

    res.status(201).json({ message: "User created. Check your email to verify." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  const { token, email } = req.query;

  try {
    const user = await User.findOne({ email, verifyToken: token });
    if (!user) return res.status(400).send("Invalid token");

    if (user.verifyTokenExpires < Date.now()) {
      return res.status(400).send("Token expired");
    }

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpires = null;

    await user.save();

    res.send("Email verified! You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
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
