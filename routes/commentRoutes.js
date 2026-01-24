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



//create an root level comment on the post
router.post("/:postId", protect , createRootComment)


// reply to a comment or reply to a reply
router.post("/:postId/:rootCommentId/:parentCommentId/reply", protect , replyOfComment)


// get comments where the user is mentioned (MUST be before /:postId)
router.get("/mentioned-comments", protect, mentionedComments)


// get list of users who liked the comment
router.get("/:commentId/likes", protect, getListOfLikeOfComment )


// get root level comments on a post
router.get("/:postId", protect, getRootComment)


// get replies of a root comment or replies of replies
router.get("/:postId/:parentCommentId",protect , getReply)



// edit a comment or reply
router.patch("/:commentId", protect, editComment)

// delete a comment
router.delete("/:commentId", protect, deleteComment)






// like unlike a comment
router.post("/:commentId/like", protect, likeUnlikeComment)

export default router