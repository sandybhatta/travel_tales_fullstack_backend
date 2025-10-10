import User from "../../models/User.js";
import Post from "../../models/Post.js";
import saveSearchHistory from "../../utils/saveSearchHistory.js";

const searchPosts = async (req, res) => {
  try {
    const currentUser = req.user;
    const q = req.query.q?.trim();

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const user = await User.findById(currentUser._id)
      .select("followers following closeFriends blockedUsers")
      .lean();

    const followingIds = user.following.map(id => id.toString());
    const blockedUsersIds = user.blockedUsers.map(id => id.toString());

    
    const posts = await Post.find({
      author: { $nin: blockedUsersIds }, 
      $or: [
        { caption: { $regex: q, $options: "i" } },
        { hashtags: { $regex: q, $options: "i" } },
        { "location.city": { $regex: q, $options: "i" } },
        { "location.state": { $regex: q, $options: "i" } },
        { "location.country": { $regex: q, $options: "i" } }
      ]
    })
      .populate("author", "name username avatar blockedUsers closeFriends")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();



    const visiblePosts = posts.filter(post => {
      if (!post.author) return false;

      const authorId = post.author._id.toString();
      const authorBlocked = (post.author.blockedUsers || []).map(id => id.toString());

      
      if (
        blockedUsersIds.includes(authorId) ||
        authorBlocked.includes(currentUser._id.toString())
      ) {
        return false;
      }

      
      switch (post.visibility) {
        case "public":
          return true;
        case "followers":
          return followingIds.includes(authorId);
        case "close_friends":
          return (post.author.closeFriends || [])
            .map(id => id.toString())
            .includes(currentUser._id.toString());
        case "private":
          return authorId === currentUser._id.toString();
        default:
          return false;
      }
    });

 
    saveSearchHistory(currentUser._id, q, "post").catch(() => {});

 
    return res.status(200).json({
      success: true,
      totalResults: visiblePosts.length,
      currentPage: page,
      posts: visiblePosts.map(post => ({
        _id: post._id,
        caption: post.caption,
        thumbnail: post.media?.[0]?.url || null,
        author: {
          _id: post.author._id,
          username: post.author.username,
          name:post.author.name,
          avatar: post.author.avatar,
        },
        visibility: post.visibility,
        createdAt: post.createdAt,
        likesCount: post.likes?.length || 0,
      })),
    });
  } catch (error) {
    console.error("Error in searchPosts:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching posts",
      error: error.message,
    });
  }
};

export default searchPosts;
