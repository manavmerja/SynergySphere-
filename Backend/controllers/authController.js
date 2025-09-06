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

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);
      
      if (!email || !password) {
        console.log("Missing credentials");
        return res.status(400).json({ error: "Missing credentials" });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ error: "User not found" });
      }
  
      console.log("User found, checking password...");
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password mismatch for user:", email);
        return res.status(401).json({ error: "Incorrect password" });
      }
  
      console.log("Password verified, generating token...");
      const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      isVerified: user.isVerified || false, // ✅ include verification status
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  
      console.log("Login successful for user:", user.username);
      res.status(200).json({ token });
    } catch (err) {
      console.error("Login error details:", err);
      console.error("Error stack:", err.stack);
      res.status(500).json({ error: "Server error", details: err.message });
    }
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
      console.log("Registration attempt for:", { username, email });
      
      try {
      if (!username || !email || !password) {
        console.log("Missing required fields");
        return res.status(400).json({ message: "All fields are required" });
      } 
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("Email already exists:", email);
        return res.status(409).json({ message: "Email already exists" });
      }
  
      console.log("Creating new user...");
      
      // Create verification token
      const token = crypto.randomBytes(32).toString("hex");
  
      // Save user with email verification
      const user = await User.create({
        username,
        email,
        password,
        verifyToken: token,
        verifyTokenExpires: Date.now() + 3600000, // 1 hour
      });
  
      console.log("User created successfully:", user._id);
  
      // Send verification email
      try {
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // use App Password if Gmail
          },
        });
  
        const link = `${baseUrl}/verify-email?token=${token}`;
        
        await transporter.sendMail({
          from: '"Solo To-Do" <no-reply@solotodo.com>',
          to: user.email,
          subject: "Verify Your Email",
          html: `<h3>Hello, ${username}</h3>
                 <p>Click below to verify your email:</p>
                 <a href="${link}">${link}</a>`,
        });
        
        console.log("Verification email sent successfully");
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail registration if email fails, just log it
      }
  
      return res.status(201).json({ message: "Registered! Check your email to verify." });
  
    } catch (error) {
      console.error("Registration error details:", error);
      console.error("Error stack:", error.stack);
      return res.status(500).json({ message: "Something went wrong", details: error.message });
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
