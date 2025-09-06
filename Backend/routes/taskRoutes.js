import { Router } from "express";
import {createTask, getTasksByProject} from "../controllers/taskController.js"
import authMiddleware from "../middlewares/authMiddleware.js";
import { Project } from "../models/project.js";
import nodemailer from "nodemailer"
import { User } from "../models/User.js";

const router = Router();


router.post("/createTask/:id",authMiddleware,createTask);
router.get("/getTask/:id",authMiddleware,getTasksByProject);
// routes/project.js
// routes/project.js
router.post("/:id/invite", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
    console.log(id,email);
    
//   try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already a member
    // if (project.members.find((m) => m.id.toString() === user._id.toString())) {
    //   return res.status(400).json({ message: "User already a member" });
    // }

    // Add to project members
    project.members.push({
      id: user._id,
      name: user.name,
      role: "Member",
      avatar: user.avatar || "/placeholder.svg",
    });
    await project.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or your email provider
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Project Management" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `You have been invited to project: ${project.name}`,
      html: `<p>Hi ${user.name},</p>
             <p>You have been added to the project <strong>${project.name}</strong>.</p>
             <p>Login to your account to view it.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ id: user._id, name: user.name, role: "Member", avatar: user.avatar });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
});



export default router;