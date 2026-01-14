import Post from "../../models/Post.js";

const getLikedPosts = async (req, res) => {
  const user = req.user;
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 12;

  try {
    const posts = await Post.find({ likes: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);


    const safePosts = posts || [];

    return res.status(200).json({
      count: safePosts.length,
      posts: safePosts,
      hasMore: safePosts.length === limit,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getLikedPosts;
