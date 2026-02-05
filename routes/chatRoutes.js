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

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/description").put(protect, updateGroupDescription);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/coadmin").put(protect, makeCoAdmin);
router.route("/removecoadmin").put(protect, removeCoAdmin);

export default router;
