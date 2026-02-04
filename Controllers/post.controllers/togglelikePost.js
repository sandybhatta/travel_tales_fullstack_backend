
import Post from "../../models/Post.js";
import { io, getReceiverSocketId } from "../../socket/socket.js";
import Notification from "../../models/Notification.js";

const toggleLikePost = async (req, res) => {
  try {
    const user = req.user;
    const { postId } = req.params;

    

    const post = await Post.findById(postId).select("likes user");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likes.some((id) => id.equals(user._id));

    if (hasLiked) {
      post.likes = post.likes.filter((id) => !id.equals(user._id));
      await post.save();
      return res.status(200).json({ hasLiked: false });
    }

    post.likes.push(user._id);
    await post.save();

    // Create Notification
    if (post.user.toString() !== user._id.toString()) {
      try {
        const notification = new Notification({
          recipient: post.user,
          sender: user._id,
          type: "like_post",
          relatedPost: post._id,
          message: `${user.username} liked your post.`
        });
        await notification.save();

        const receiverSocketId = getReceiverSocketId(post.user.toString());
        if (receiverSocketId) {
          await notification.populate("sender", "username profilePic");
          await notification.populate("relatedPost", "images");
          io.to(receiverSocketId).emit("newNotification", notification);
        }
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Don't block the response if notification fails
      }
    }

    return res.status(200).json({ hasLiked: true });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default toggleLikePost;
