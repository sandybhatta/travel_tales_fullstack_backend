import User from "../../models/User.js";
import Trip from "../../models/trip.js";
import Post from "../../models/post.js";
import SearchHistory from "../../models/SearchHistory.js";


const globalSearch = async (req, res) => {
  try {
    const query = req.query.q?.trim().toLowerCase() || "";

    
    if (!query) {
      const history = await SearchHistory.find({ user: req.user._id })
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean();
      return res.status(200).json({ history });
    }

    
    const existingHistory = await SearchHistory.findOne({
      user: req.user._id,
      query,
    });

    if (existingHistory) {
      existingHistory.updatedAt = new Date();
      await existingHistory.save();
    } else {
      await SearchHistory.create({
        user: req.user._id,
        query,
        type: "general",
      });
    }

    const currentUserId = req.user._id;

   
    const currentUser = await User.findById(currentUserId)
      .select("following closeFriends")
      .lean();

    const followingIds = currentUser.following.map((id) => id.toString());
    const closeFriendIds = currentUser.closeFriends.map((id) => id.toString());

  
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
      ],
      isDeactivated: { $ne: true },
    })
      .select("_id username name avatar bio")
      .limit(8)
      .lean();

   
    const trips = await Trip.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { "destinations.city": { $regex: query, $options: "i" } },
        { "destinations.country": { $regex: query, $options: "i" } },
        { tags: { $in: [query] } },
      ],
    })
      .populate("user", "username name avatar following closeFriends")
      .lean();

    const visibleTrips = trips.filter((trip) => {
      const creatorId = trip.user?._id?.toString();
      if (!creatorId) return false;

      switch (trip.visibility) {
        case "public":
          return true;
        case "followers":
          return followingIds.includes(creatorId);
        case "close_friends":
          return closeFriendIds.includes(creatorId);
        case "private":
          return creatorId === currentUserId.toString();
        default:
          return false;
      }
    });

  
    const posts = await Post.find({
      $or: [
        { caption: { $regex: query, $options: "i" } },
        { hashtags: { $in: [query] } },
        { "location.city": { $regex: query, $options: "i" } },
        { "location.country": { $regex: query, $options: "i" } },
      ],
    })
      .populate("author", "username name avatar following closeFriends")
      .lean();

    const visiblePosts = posts.filter((post) => {
      const authorId = post.author?._id?.toString();
      if (!authorId) return false;

      switch (post.visibility) {
        case "public":
          return true;
        case "followers":
          return followingIds.includes(authorId);
        case "close_friends":
          return closeFriendIds.includes(authorId);
        case "private":
          return authorId === currentUserId.toString();
        default:
          return false;
      }
    });

    

   
    res.status(200).json({
      query,
      users,
      trips: visibleTrips,
      posts: visiblePosts,
    });
  } catch (error) {
    console.error("Error in globalSearch:", error);
    res.status(500).json({ message: "Internal Server Error in Search " });
  }
};

export default globalSearch;
