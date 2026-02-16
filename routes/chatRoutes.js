import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  updateGroupDescription,
  makeCoAdmin,
  removeCoAdmin
} from "../Controllers/chat.controllers/chatControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat management and operations
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Access or create a one-on-one chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to chat with
 *     responses:
 *       200:
 *         description: The chat object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *   get:
 *     summary: Fetch all chats for the logged-in user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 */
router.route("/")
  .post(protect, accessChat)
  .get(protect, fetchChats);

/**
 * @swagger
 * /api/chat/group:
 *   post:
 *     summary: Create a group chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               users:
 *                 type: string
 *                 description: JSON stringified array of user IDs
 *     responses:
 *       200:
 *         description: The created group chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 */
router.route("/group").post(protect, createGroupChat);

/**
 * @swagger
 * /api/chat/rename:
 *   put:
 *     summary: Rename a group chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               chatName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated chat object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 */
router.route("/rename").put(protect, renameGroup);

/**
 * @swagger
 * /api/chat/description:
 *   put:
 *     summary: Update group description
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated chat object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 */
router.route("/description").put(protect, updateGroupDescription);

/**
 * @swagger
 * /api/chat/groupadd:
 *   put:
 *     summary: Add user to group
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated chat object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 */
router.route("/groupadd").put(protect, addToGroup);

/**
 * @swagger
 * /api/chat/groupremove:
 *   put:
 *     summary: Remove user from group
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated chat object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 */
router.route("/groupremove").put(protect, removeFromGroup);

/**
 * @swagger
 * /api/chat/coadmin:
 *   put:
 *     summary: Make user a co-admin
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated chat object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 */
router.route("/coadmin").put(protect, makeCoAdmin);

/**
 * @swagger
 * /api/chat/removecoadmin:
 *   put:
 *     summary: Remove co-admin status from user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated chat object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 */
router.route("/removecoadmin").put(protect, removeCoAdmin);

export default router;
