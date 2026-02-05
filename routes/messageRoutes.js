import express from "express";
import {
  sendMessage,
  allMessages,
  editMessage,
  deleteMessage
} from "../Controllers/message.controllers/messageControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);
router.route("/edit").put(protect, editMessage);
router.route("/delete").put(protect, deleteMessage);

export default router;
