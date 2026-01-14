import Post from "../../models/Post.js";
import Comment from "../../models/Comment.js";

const getCommentedPosts = async (req, res) => {
  const user = req.user;
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 12;

  try {
    // 1. Find all comments by this user
    const userComments = await Comment.find({ author: user._id })
      .sort({ createdAt: -1 })
      .select("post");

    // 2. Extract unique post IDs
    const postIds = [...new Set(userComments.map(c => c.post.toString()))];

    // 3. Paginate the Post IDs (not the comments)
    const paginatedIds = postIds.slice(skip, skip + limit);

    // 4. Fetch the actual posts
    const posts = await Post.find({ _id: { $in: paginatedIds } })
      .populate("author", "username name avatar")
      .populate("tripId", "title visibility");

    // Preserve the sorted order from the comment history
    const orderedPosts = paginatedIds
        .map(id => posts.find(p => p._id.toString() === id))
        .filter(p => p !== undefined); // Filter out any deleted posts

    return res.status(200).json({
      count: orderedPosts.length,
      posts: orderedPosts,
      hasMore: skip + limit < postIds.length,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getCommentedPosts;
