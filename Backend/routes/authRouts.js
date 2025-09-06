// routes/authRoutes.js
import { Router } from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

// protected route example
router.get("/me", authMiddleware, getMe);

export default router;
