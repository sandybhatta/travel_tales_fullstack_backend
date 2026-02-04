import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getNotifications } from "../Controllers/notification.controllers/getNotifications.js";
import { markAsRead } from "../Controllers/notification.controllers/markAsRead.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/mark-read", protect, markAsRead);

export default router;
