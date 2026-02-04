
import Post from "../../models/Post.js";
import { createNotification } from "../../utils/notificationHandler.js";

const toggleLikePost = async (req, res) => {
  try {
    const user = req.user;
    const { postId } = req.params;

    

    const post = await Post.findById(postId).select("likes author");
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
    if (post.author.toString() !== user._id.toString()) {
      await createNotification({
          recipient: post.author,
          sender: user._id,
          type: "like_post",
          relatedPost: post._id,
          message: `${user.username} liked your post.`
      });
    }

    return res.status(200).json({ hasLiked: true });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default toggleLikePost;
