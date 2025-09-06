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
router.post("/invite/:id",authMiddleware,async (req,res)=>{
    console.log("Hello");
});


export default router;