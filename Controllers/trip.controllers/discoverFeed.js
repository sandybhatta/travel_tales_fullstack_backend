import Post from "../../models/Post.js";
import Trip from "../../models/Trip.js";
import User from "../../models/User.js";

const discoverFeed = async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page-1)*limit;

    // Fetch user context
    const currentUser = await User.findById(user._id)
      .select("following closeFriends interests bookmarks blockedUsers")
      .lean();

    const followingIds = currentUser.following.map((f) => f.toString());
    const closeFriendIds = currentUser.closeFriends.map((id) => id.toString());
    const interestTags = currentUser.interests || [];
    const blockedUserIds = currentUser.blockedUsers.map((id) => id.toString());
    const bookmarks = currentUser.bookmarks.map((id) => id.toString());

    // Define postQuery
    const postQuery = {
      $and: [
        {
          $or: [
            { visibility: "public" },
            { visibility: "followers", author: { $in: followingIds } },
            { visibility: "close_friends", author: { $in: closeFriendIds } },
            { author: user._id },
          ],
        },
        {
          $or: [
            { hashtags: { $in: interestTags } },
            { taggedUsers: user._id },
            { taggedUsers: { $in: followingIds } },
            { taggedUsers: { $in: closeFriendIds } },
          ],
        },
        {
          author: { $nin: blockedUserIds },
        },
      ],
    };

    // Trip visibility filter
    const visibilityFilter = {
      $or: [
        { visibility: "public" },
        { visibility: "followers", user: { $in: followingIds } },
        { visibility: "close_friends", user: { $in: closeFriendIds } },
        { user: user._id },
      ],
    };

    // Fetch posts
    let posts = await Post.find(postQuery)
      .populate([
        { path: "author", select: "name username avatar" },
        { path: "taggedUsers", select: "name username avatar" },
        { path: "tripId", select: "title" },
        {
          path: "sharedFrom",
          populate: { path: "author", select: "username avatar" },
        },
        { path: "likes", select: "name username avatar _id" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit * 3)
      .lean();

    // Fetch trips
    let trips = await Trip.find({
      ...visibilityFilter,
      user: { $nin: blockedUserIds },
      isArchived: false,
      $or: [
        { tags: { $in: interestTags } },
        { isCompleted: true },
        { user: user._id },
        { user: { $in: followingIds } },
        { user: { $in: closeFriendIds } },
      ],
    })
      .populate("user", "username avatar name")
      .populate("likes", "name username avatar _id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit * 3)
      .lean();

    // Score helper
    const scoreContent = (item, type = "post") => {
      let score = 0;
      const likes = item.likes?.length || 0;
      const comments = item.comments?.length || 0;

      const authorId =
        type === "post"
          ? item.author?._id?.toString()
          : item.user?._id?.toString();
      if (closeFriendIds.includes(authorId)) score += 30;
      if (followingIds.includes(authorId)) score += 20;
      if (type === "post" && item.tripId) score += 15;
      if (item.hashtags?.some((tag) => interestTags.includes(tag))) score += 10;
      if (item.tags?.some((tag) => interestTags.includes(tag))) score += 15;
      
      const engagement = likes + comments;
      score += Math.min(engagement, 50);
      if (engagement === 0) score -= 10;

      return score;
    };

    const followingIdSet = new Set(followingIds);
    
    // Helper function to get followings who liked the item
    const getFollowingsWhoLiked = (item) => {
      if (!item.likes || item.likes.length === 0) return [];
      
      // If likes are populated (objects), filter by _id
      // If likes are just IDs, filter directly
      const likedByFollowings = item.likes.filter((like) => {
        const likeId = like._id ? like._id.toString() : like.toString();
        return followingIdSet.has(likeId);
      });
      
      // Return user info if populated
      return likedByFollowings.map((like) => {
        if (like._id) {
          // Already populated
          return {
            _id: like._id,
            name: like.name || "",
            username: like.username || "",
            avatar: like.avatar || null,
          };
        } else {
          // Just ID - this shouldn't happen if populate worked, but handle it
          return { _id: like };
        }
      });
    };
    // Wrap content with score
    const wrappedPosts = posts.map((post) => ({
      type: "post",
      data: { ...post, _score: scoreContent(post, "post") },
    }));

    const wrappedTrips = trips.map((trip) => ({
      type: "trip",
      data: { ...trip, _score: scoreContent(trip, "trip") },
    }));

    // Merge, sort, deduplicate
    const fullFeed = [...wrappedPosts, ...wrappedTrips];
    fullFeed.sort(
      (a, b) =>
        b.data._score - a.data._score ||
        new Date(b.data.createdAt) - new Date(a.data.createdAt)
    );

    // Enrichment
    for (let item of fullFeed) {
      const d = item.data;

      // Check if current user liked this item
      const isLikedByViewer = d.likes?.some((like) => {
        const likeId = like._id ? like._id.toString() : like.toString();
        return likeId === user._id.toString();
      });
      d.isLikedByViewer = isLikedByViewer;

      // Get followings who liked this item
      const followingsWhoLiked = getFollowingsWhoLiked(d);
      d.likedByFollowings = followingsWhoLiked;

      if (item.type === "post") {
        d.isBookmarkedByViewer = bookmarks.includes(d._id.toString());
        d.likeCount = d.likes?.length || 0;
        d.commentCount = d.comments?.length || 0;
        d.fromTrip = d.tripId?.title || null;
      } else {
        d.likeCount = d.likes?.length || 0;
      }
    }

    // Apply pagination to the sorted feed
    const filteredFeed = fullFeed.slice(skip, skip + limit);
    const totalCount = fullFeed.length;

    res.status(200).json({
      feed: filteredFeed,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasMore: skip + limit < totalCount,
    });
  } catch (err) {
    console.error("Error in discoverFeed:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export default discoverFeed;
