import User from "../../models/User.js";
import Trip from "../../models/Trip.js";
import Post from "../../models/Post.js"
import saveSearchHistory from "../../utils/saveSearchHistory.js";

const globalSearch = async (req, res) => {
  try {
    const query = req.query.q?.trim()?.toLowerCase() || "";
    const userId = req.user._id;


    if (!query) {
        return res
          .status(400)
          .json({ success: false, message: "Search query is required" });
      }

      saveSearchHistory(userId , query , "general").catch(()=>{})

    

 
    const currentUser = await User.findById(userId)
      .select("following closeFriends blockedUsers")
      .lean();

    // Prepare Sets for O(1) lookups
    const followingSet = new Set(currentUser.following.map(id => id.toString()));
    const followerSet = new Set((currentUser.followers || []).map(id => id.toString()));
    const closeFriendSet = new Set(currentUser.closeFriends.map(id => id.toString()));
    const blockedIds = currentUser.blockedUsers.map(id => id.toString());

    // Run searches in parallel for better performance
    const [users, trips, posts] = await Promise.all([
      // 1. Search Users
      User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
          { bio: { $regex: query, $options: "i" } },
        ],
        isDeactivated: { $ne: true },
        _id: { $nin: [...blockedIds, userId] },
      })
      .select("_id username name avatar blockedUsers followers following closeFriends") // Need these fields to determine relationship
      .limit(20)
      .lean(),

      // 2. Search Trips
      Trip.find({
        $and: [
          {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { "destinations.city": { $regex: query, $options: "i" } },
              { "destinations.country": { $regex: query, $options: "i" } },
              { tags: { $in: [query] } },
            ],
          },
          { isArchived: { $ne: true } },
          { user: { $nin: blockedIds } },
        ],
      })
      .populate("user", "username name avatar closeFriends blockedUsers")
      .lean(),

      // 3. Search Posts
      Post.find({
        $and: [
          {
            $or: [
              { caption: { $regex: query, $options: "i" } },
              { hashtags: { $in: [query] } },
              { "location.city": { $regex: query, $options: "i" } },
              { "location.country": { $regex: query, $options: "i" } },
            ],
          },
          { author: { $nin: blockedIds } },
        ],
      })
      .populate("author", "username name avatar closeFriends blockedUsers")
      .lean()
    ]);

    // Process Users (Filter blocked & Add relationship status)
    const visibleUsers = users.filter((u) => {
      const blockedIdOfUser = (u.blockedUsers || []).map(id => id.toString());
      if (blockedIdOfUser.includes(userId.toString())) {
        return false;
      }
      return true;
    }).map(u => {
      const uid = u._id.toString();
      return {
        _id: u._id,
        username: u.username,
        name: u.name,
        avatar: u.avatar,
        // Add relationship flags
        isFollowing: followingSet.has(uid),
        isFollower: followerSet.has(uid),
        isCloseFriend: closeFriendSet.has(uid),
      };
    });

    const visibleTrips = trips.filter(trip => {
      if (!trip.user) return false;

      const ownerId = trip.user._id.toString();
      const ownerBlockedIds =
        (trip.user.blockedUsers || []).map(id => id.toString()) || [];

      const ownerCloseFriendIds =
        (trip.user.closeFriends || []).map(id => id.toString()) || [];

      
      if (
        blockedIds.includes(ownerId) ||
        ownerBlockedIds.includes(userId.toString())
      ) {
        return false;
      }

      
      switch (trip.visibility) {
        case "public":
          return true;
        case "followers":
          return followingSet.has(ownerId);
        case "close_friends":
          return ownerCloseFriendIds.includes(userId.toString());
        case "private":
          return ownerId === userId.toString();
        default:
          return false;
      }
    });

    const visiblePosts = posts.filter(post => {
      if (!post.author) return false;

      const authorId = post.author._id.toString();
      const authorBlockedIds =(post.author.blockedUsers || []).map(id => id.toString()) || [];

      const authorCloseFriendIds =(post.author.closeFriends || []).map(id => id.toString()) || [];

     
      if (
        blockedIds.includes(authorId) ||
        authorBlockedIds.includes(userId.toString())
      ) {
        return false;
      }

      
      switch (post.visibility) {
        case "public":
          return true;
        case "followers":
          return followingIds.includes(authorId);
        case "close_friends":
          return authorCloseFriendIds.includes(userId.toString());
        case "private":
          return authorId === userId.toString();
        default:
          return false;
      }
    });

    return res.status(200).json({
      success: true,
      users:visibleUsers,
      trips: visibleTrips,
      posts: visiblePosts,
      total: {
        users: visibleUsers.length,
        trips: visibleTrips.length,
        posts: visiblePosts.length,
      },
    });
  } catch (error) {
    console.error(" Error in globalSearch:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in Global Search",
      error: error.message,
    });
  }
};

export default globalSearch;
