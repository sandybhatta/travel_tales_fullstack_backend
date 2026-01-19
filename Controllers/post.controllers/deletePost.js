
import Post from "../../models/Post.js";

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default deletePost;
