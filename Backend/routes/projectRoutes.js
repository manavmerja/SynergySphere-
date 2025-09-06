import { Router } from "express";
import { createProject } from "../controllers/projectController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Protected route
router.post("/createProject", authMiddleware, createProject);

export default router;
