import Comment from "../../models/Comment.js";
import { io, getReceiverSocketId } from "../../socket/socket.js";
import Notification from "../../models/Notification.js";

const likeUnlikeComment = async (req, res) => {
  try {
    const user = req.user;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).select("likes author post");
    if (!comment) {
      return res.status(404).json({ message: "No comment found" });
    }

    const alreadyLiked = comment.likes.some(
      (likeId) => likeId.toString() === user._id.toString()
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (likeId) => likeId.toString() !== user._id.toString()
      );
    } else {
      comment.likes.push(user._id);

      // Notification Logic
      if (comment.author.toString() !== user._id.toString()) {
        try {
          const notification = new Notification({
            recipient: comment.author,
            sender: user._id,
            type: "like_comment",
            relatedPost: comment.post,
            relatedComment: comment._id,
            message: `${user.username} liked your comment.`
          });
          await notification.save();

          const receiverSocketId = getReceiverSocketId(comment.author.toString());
          if (receiverSocketId) {
            await notification.populate("sender", "username profilePic");
            // If the UI displays the post image for context:
            if (comment.post) {
               await notification.populate("relatedPost", "images");
            }
            io.to(receiverSocketId).emit("newNotification", notification);
          }
        } catch (e) {
          console.error("Error creating like_comment notification:", e);
        }
      }
    }

    await comment.save();

    return res.status(200).json({
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      likeCount: comment.likes.length,
    });

  } catch (error) {
    console.error("Error in likeUnlikeComment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default likeUnlikeComment;
