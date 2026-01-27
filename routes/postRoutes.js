import express from "express"
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";
import createPost from "../Controllers/post.controllers/createPost.js";
import getPostDetails from "../Controllers/post.controllers/getPostDetails.js";
import editPost from "../Controllers/post.controllers/editPost.js";
import sharePost from "../Controllers/post.controllers/sharepost.js";
import toggleLikePost from "../Controllers/post.controllers/togglelikePost.js";
import getLikesOfPost from "../Controllers/post.controllers/getLikesOfPost.js";
import postsLikedByUser from "../Controllers/post.controllers/postsLikedByUser.js";
import mentionedPost from "../Controllers/post.controllers/mentionedPost.js";
import taggedPosts from "../Controllers/post.controllers/taggedPosts.js";
import myPost from "../Controllers/post.controllers/myPost.js";
import postOfOthers from "../Controllers/post.controllers/postOfOthers.js";
import deletePost from "../Controllers/post.controllers/deletePost.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management and interaction
 */


/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               post:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               caption:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 */
//create a new post
router.post("/",upload.array("post",20), protect, createPost)


/**
 * @swagger
 * /api/posts/me:
 *   get:
 *     summary: Get my posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my posts
 */
// posts that current user have made
router.get("/me", protect , myPost)


/**
 * @swagger
 * /api/posts/liked-posts:
 *   get:
 *     summary: Get posts liked by me
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of liked posts
 */
// get all post liked by the current user
router.get("/liked-posts" , protect , postsLikedByUser)




/**
 * @swagger
 * /api/posts/mentioned-posts:
 *   get:
 *     summary: Get posts where I am mentioned
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of mentioned posts
 */
// posts that the user has been mentioned
router.get("/mentioned-posts", protect , mentionedPost)

/**
 * @swagger
 * /api/posts/tagged-posts:
 *   get:
 *     summary: Get posts where I am tagged
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tagged posts
 */
// posts that the user has been tagged in
router.get("/tagged-posts", protect, taggedPosts)







/**
 * @swagger
 * /api/posts/{postId}:
 *   get:
 *     summary: Get post details
 *     tags: [Posts]
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
 *         description: Post details
 */
// get post details
router.get("/:postId",protect, getPostDetails)

/**
 * @swagger
 * /api/posts/{postId}/share:
 *   post:
 *     summary: Share a post
 *     tags: [Posts]
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
 *         description: Post shared
 */
//share a post
router.post("/:postId/share", protect , sharePost)

/**
 * @swagger
 * /api/posts/{postId}:
 *   patch:
 *     summary: Edit a post
 *     tags: [Posts]
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
 *               caption:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 */
// to edit a post
router.patch("/:postId" , protect , editPost)

/**
 * @swagger
 * /api/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
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
 *         description: Post deleted
 */
// delete a post
router.delete("/:postId", protect, deletePost)



/**
 * @swagger
 * /api/posts/{postId}/like:
 *   patch:
 *     summary: Toggle like on a post
 *     tags: [Posts]
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
 *         description: Like toggled
 */
// toggle like a post
router.patch("/:postId/like", protect , toggleLikePost)



/**
 * @swagger
 * /api/posts/{postId}/likes:
 *   get:
 *     summary: Get users who liked a post
 *     tags: [Posts]
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
 *         description: List of users who liked
 */
// get all the users who liked the post
router.get("/:postId/likes", protect, getLikesOfPost)










/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Get posts of a specific user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's posts
 */
//all posts of a specific user
router.get("/user/:userId" , protect , postOfOthers)





export default router;