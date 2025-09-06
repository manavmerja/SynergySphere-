import { Router } from "express";
import { createProject, getProject } from "../controllers/projectController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Protected route
router.post("/createProject", authMiddleware, createProject);
router.get("/getProject", authMiddleware, getProject);

export default router;
