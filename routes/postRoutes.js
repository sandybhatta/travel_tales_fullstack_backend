import express from "express"
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";
import createPost from "../Controllers/post.controllers/createPost.js";
import getPostDetails from "../Controllers/post.controllers/getPostDetails.js";
import editPost from "../Controllers/post.controllers/editPost.js";
import sharePost from "../Controllers/post.controllers/sharePost.js";
import toggleLikePost from "../Controllers/post.controllers/togglelikePost.js";
import getLikesOfPost from "../Controllers/post.controllers/getLikesOfPost.js";
import postsLikedByUser from "../Controllers/post.controllers/postsLikedByUser.js";
import mentionedPost from "../Controllers/post.controllers/mentionedPost.js";
import myPost from "../Controllers/post.controllers/myPost.js";
import postOfOthers from "../Controllers/post.controllers/postOfOthers.js";
import feedOfFollowing from "../Controllers/post.controllers/feedOfFollowing.js";
import exploreFeed from "../Controllers/post.controllers/exploreFeed.js";
const router = express.Router();






//create a new post
router.post("/",upload.array("post",20), protect, createPost)

// get post details
router.get("/:postId",protect, getPostDetails)

//share a post
router.post("/:postId/share", protect , sharePost)

// to edit a post
router.patch("/:postId" , protect , editPost)


// toggle like a post
router.patch("/:postId/like", protect , toggleLikePost)



// get all the users who liked the post
router.get("/:postId/likes", protect, getLikesOfPost)


// get all post liked by the current user
router.get("/liked-posts" , protect , postsLikedByUser)


// posts that the user has been mentioned
router.get("/mentioned-posts", protect , mentionedPost)

// posts that current user have made
router.get("/me", protect , myPost)


//all posts of a specific user
router.get("/user/:userId" , protect , postOfOthers)




// feed of posts of following
router.get("/feed/following", protect , feedOfFollowing)




// feed for exploring
router.get("/feed/explore" , protect , exploreFeed)

export default router;