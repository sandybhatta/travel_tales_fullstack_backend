import Post from "../../models/Post.js";
import Trip from "../../models/Trip.js";
import User from "../../models/User.js";

const getUniversalFeed = async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Fetch user context (following, closeFriends, interests, blocked)
    const currentUser = await User.findById(user._id)
      .select("following closeFriends interests bookmarks blockedUsers")
      .lean();

    const followingIds = (currentUser.following || []).map((f) => f.toString());
    const closeFriendIds = (currentUser.closeFriends || []).map((id) => id.toString());
    const interestTags = currentUser.interests || [];
    const blockedUserIds = (currentUser.blockedUsers || []).map((id) => id.toString());
    const bookmarks = (currentUser.bookmarks || []).map((id) => id.toString());

    // --- 1. Post Query ---
    const postQuery = {
      author: { $nin: blockedUserIds },
      $or: [
        // A. My own posts
        { author: user._id },
        
        // B. Posts from people I follow (Home Feed)
        {
          author: { $in: followingIds },
          $or: [
            { visibility: "public" },
            { visibility: "followers" },
            // If they are also close friends, I can see close_friends posts
            { 
               visibility: "close_friends", 
               author: { $in: closeFriendIds } 
            }
          ]
        },

        // C. Posts from Close Friends (explicitly)
        {
          author: { $in: closeFriendIds },
          visibility: "close_friends"
        },

        // D. Public posts matching interests (Explore Feed)
        // If the user wants "everything", we include public interest-based posts
        {
          visibility: "public",
          $or: [
            { hashtags: { $in: interestTags } },
            // Also include if I'm mentioned or tagged (though strictly that's notifications, but good for feed)
            { mentions: user._id },
            { taggedUsers: user._id }
          ]
        },
        
        // E. Posts where I am tagged/mentioned (regardless of visibility? usually implies permission)
        { mentions: user._id },
        { taggedUsers: user._id }
      ]
    };

    // --- 2. Trip Query ---
    const tripQuery = {
      user: { $nin: blockedUserIds },
      isArchived: false,
      $or: [
        // A. My own trips
        { user: user._id },
        
        // B. Trips I am part of
        { "acceptedFriends.user": user._id },
        { invitedFriends: user._id },

        // C. Trips from people I follow
        {
          user: { $in: followingIds },
          $or: [
            { visibility: "public" },
            { visibility: "followers" },
            { 
               visibility: "close_friends", 
               user: { $in: closeFriendIds } 
            }
          ]
        },

        // D. Public trips matching interests (Discover Feed)
        {
          visibility: "public",
          tags: { $in: interestTags }
        }
      ]
    };


    const fetchSize = skip + limit;

    const [posts, trips] = await Promise.all([
      Post.find(postQuery)
        .populate([
          { path: "author", select: "name username avatar" },
          { path: "taggedUsers", select: "name username avatar" },
          { path: "mentions", select: "username _id" },
          { path: "tripId", select: "title visibility" },
          {
            path: "sharedFrom",
            populate: [
              { path: "author", select: "name username avatar" },
              { path: "taggedUsers", select: "name username avatar" }
            ],
            select: "media caption taggedUsers author createdAt tripId" 
          },
          { path: "likes", select: "name username avatar _id" },
          { path: "comments", select: "_id" }
        ])
        .sort({ createdAt: -1 })
        .limit(fetchSize)
        .lean(),

      Trip.find(tripQuery)
        .populate("user", "name username avatar")
        .populate("acceptedFriends.user", "name username avatar")
        .populate("likes", "name username avatar _id")
        .sort({ createdAt: -1 })
        .limit(fetchSize)
        .lean()
    ]);

    // --- 4. Process and Merge ---
    
    // Helper: Calculate relevance score (simplified version of discoverFeed)
    // We prioritize Following/CloseFriends over random Public content
    const scoreItem = (item, type) => {
      let score = 0;
      const authorId = type === "post" ? item.author?._id?.toString() : item.user?._id?.toString();
      
      // Base chronology score (to keep recent items high)
      // This is implicit in sort, but if we want to mix heavily, we can use it.
      // For now, let's rely mostly on Date, but boost friends.
      
      if (authorId === user._id.toString()) score += 50;
      if (closeFriendIds.includes(authorId)) score += 40;
      if (followingIds.includes(authorId)) score += 30;
      
      // Interest match
      if (type === "post" && item.hashtags?.some(t => interestTags.includes(t))) score += 10;
      if (type === "trip" && item.tags?.some(t => interestTags.includes(t))) score += 10;
      
      return score;
    };

    const wrappedPosts = posts.map(p => ({
      type: "post",
      data: { 
        ...p, 
        _score: scoreItem(p, "post"),
        isLikedByViewer: p.likes?.some(l => (l._id || l).toString() === user._id.toString()),
        isBookmarkedByViewer: bookmarks.includes(p._id.toString()),
        likeCount: p.likes?.length || 0,
        commentCount: p.comments?.length || 0,
        fromTrip: p.tripId?.title || null
      }
    }));

    const wrappedTrips = trips.map(t => ({
      type: "trip",
      data: {
        ...t,
        _score: scoreItem(t, "trip"),
        isLikedByViewer: t.likes?.some(l => (l._id || l).toString() === user._id.toString()),
        likeCount: t.likes?.length || 0
      }
    }));

    // Combine
    let fullFeed = [...wrappedPosts, ...wrappedTrips];

    // Sort: Primary by Date, Secondary by Score (or vice versa? User asked for a feed, usually time-based)
    // "Universal Feed" usually implies chronological.
    // Let's stick to pure Chronological for a "Timeline" feel, as that's what "Following" usually expects.
    // But since we mix in "Explore" (which can be old but popular), maybe we should strictly enforce date.
    // I will Sort by CreatedAt descending.
    
    fullFeed.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));


    
    const resultFeed = fullFeed.slice(skip, skip + limit);

    const totalPosts = await Post.countDocuments(postQuery);
    const totalTrips = await Trip.countDocuments(tripQuery);
    const totalCount = totalPosts + totalTrips;

    return res.status(200).json({
      feed: resultFeed,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasMore: (page * limit) < totalCount
    });

  } catch (error) {
    console.error("Error in getUniversalFeed:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export default getUniversalFeed;
