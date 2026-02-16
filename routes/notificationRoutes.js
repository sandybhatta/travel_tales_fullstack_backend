import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getNotifications } from "../Controllers/notification.controllers/getNotifications.js";
import { markAsRead } from "../Controllers/notification.controllers/markAsRead.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /api/notification:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get("/", protect, getNotifications);

/**
 * @swagger
 * /api/notification/mark-read:
 *   put:
 *     summary: Mark all or specific notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationId:
 *                 type: string
 *                 description: Optional ID to mark a specific notification. If omitted, marks all.
 *     responses:
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/mark-read", protect, markAsRead);

export default router;
