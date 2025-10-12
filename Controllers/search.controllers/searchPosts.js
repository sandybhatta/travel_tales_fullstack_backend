
import User from "../../models/User.js";
import Post from "../../models/Post.js"; 
import saveSearchHistory from "../../utils/saveSearchHistory.js";

const searchPosts = async (req, res) => {
  try {
    const currentUser = req.user; // from protect middleware
    const q = req.query.q?.trim()?.toLowerCase();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || "20", 10)));

    if (!q) {
      return res.status(400).json({ message: "No search query provided." });
    }

    // Get user info for visibility & blocking
    const user = await User.findById(currentUser._id)
      .select("followers following closeFriends blockedUsers")
      .lean();

    const followingIds = user.following.map(id => id.toString());
    const blockedUsersIds = user.blockedUsers.map(id => id.toString());

    // Fetch all posts (avoid regex — filter in JS)
    const posts = await Post.find({
      author: { $nin: blockedUsersIds }, // exclude posts from blocked authors
    })
      .populate("author", "name username avatar blockedUsers closeFriends")
      .lean();

    // Filter by search query (no regex)
    const matchedPosts = posts.filter(post => {
      const caption = (post.caption || "").toLowerCase();
      const hashtags = (post.hashtags || []).map(tag => tag.toLowerCase());
      const location = post.location || {};
      const city = (location.city || "").toLowerCase();
      const state = (location.state || "").toLowerCase();
      const country = (location.country || "").toLowerCase();

      return (
        caption.includes(q) ||
        hashtags.some(tag => tag.includes(q)) ||
        city.includes(q) ||
        state.includes(q) ||
        country.includes(q)
      );
    });

    // Apply blocking & visibility filters
    const visiblePosts = matchedPosts.filter(post => {
      const author = post.author;
      if (!author) return false;

      const authorId = author._id.toString();
      const authorBlockedUsers = (author.blockedUsers || []).map(id => id.toString());

      // Skip if either blocked
      if (blockedUsersIds.includes(authorId) || authorBlockedUsers.includes(currentUser._id.toString())) {
        return false;
      }

      // Visibility check
      switch (post.visibility) {
        case "public":
          return true;
        case "followers":
          return followingIds.includes(authorId);
        case "close_friends":
          return author.closeFriends
            ?.map(id => id.toString())
            .includes(currentUser._id.toString());
        case "private":
          return authorId === currentUser._id.toString();
        default:
          return false;
      }
    });

    // Paginate
    const start = (page - 1) * limit;
    const paginatedResults = visiblePosts.slice(start, start + limit);

    // Save search history (non-blocking)
    saveSearchHistory(currentUser._id, q, "post").catch(() => {});

    return res.status(200).json({
      success: true,
      totalResults: visiblePosts.length,
      currentPage: page,
      totalPages: Math.ceil(visiblePosts.length / limit),
      posts: paginatedResults.map(post => ({
        _id: post._id,
        caption: post.caption,
        thumbnail: post.media?.[0]?.url || null,
        author: {
          _id: post.author._id,
          username: post.author.username,
          avatar: post.author.avatar,
        },
        visibility: post.visibility,
        createdAt: post.createdAt,
        likesCount: post.likes?.length || 0,
      })),
    });
  } catch (error) {
    console.error("Error in searchPosts:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export default searchPosts;
