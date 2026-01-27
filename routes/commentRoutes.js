import express from "express"
import { protect } from "../middlewares/authMiddleware.js";
import createRootComment from "../Controllers/comment.controllers/createRootComment.js";
import getRootComment from "../Controllers/comment.controllers/getRootComment.js";
import replyOfComment from "../Controllers/comment.controllers/replyOfComment.js";
import getReply from "../Controllers/comment.controllers/getReply.js";
import editComment from "../Controllers/comment.controllers/editComment.js";
import likeUnlikeComment from "../Controllers/comment.controllers/likeunlikecomment.js";
import getListOfLikeOfComment from "../Controllers/comment.controllers/getListOfLikeOfComment.js";
import mentionedComments from "../Controllers/comment.controllers/mentionedComments.js";
import deleteComment from "../Controllers/comment.controllers/deleteComment.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management
 */


/**
 * @swagger
 * /api/comment/{postId}:
 *   post:
 *     summary: Create a root comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
//create an root level comment on the post
router.post("/:postId", protect , createRootComment)


/**
 * @swagger
 * /api/comment/{postId}/{rootCommentId}/{parentCommentId}/reply:
 *   post:
 *     summary: Reply to a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: rootCommentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: parentCommentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply created
 */
// reply to a comment or reply to a reply
router.post("/:postId/:rootCommentId/:parentCommentId/reply", protect , replyOfComment)


/**
 * @swagger
 * /api/comment/mentioned-comments:
 *   get:
 *     summary: Get comments where I am mentioned
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentioned comments
 */
// get comments where the user is mentioned (MUST be before /:postId)
router.get("/mentioned-comments", protect, mentionedComments)


/**
 * @swagger
 * /api/comment/{commentId}/likes:
 *   get:
 *     summary: Get likes of a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of likes
 */
// get list of users who liked the comment
router.get("/:commentId/likes", protect, getListOfLikeOfComment )


/**
 * @swagger
 * /api/comment/{postId}:
 *   get:
 *     summary: Get root comments of a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of root comments
 */
// get root level comments on a post
router.get("/:postId", protect, getRootComment)


/**
 * @swagger
 * /api/comment/{postId}/{parentCommentId}:
 *   get:
 *     summary: Get replies of a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: parentCommentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of replies
 */
// get replies of a root comment or replies of replies
router.get("/:postId/:parentCommentId",protect , getReply)



/**
 * @swagger
 * /api/comment/{commentId}:
 *   patch:
 *     summary: Edit a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 */
// edit a comment or reply
router.patch("/:commentId", protect, editComment)

/**
 * @swagger
 * /api/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 */
// delete a comment
router.delete("/:commentId", protect, deleteComment)






/**
 * @swagger
 * /api/comment/{commentId}/like:
 *   post:
 *     summary: Toggle like on a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled
 */
// like unlike a comment
router.post("/:commentId/like", protect, likeUnlikeComment)

export default router