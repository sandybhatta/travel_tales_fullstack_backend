import Trip from "../../models/Trip.js";
import User from "../../models/User.js";
import saveSearchHistory from "../../utils/saveSearchHistory.js";

const searchTrips = async (req, res) => {
  try {
    const query = req.query.q?.trim()?.toLowerCase();

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

   
    const currentUser = await User.findById(userId)
      .select("following closeFriends blockedUsers")
      .lean();

    const followingIds = currentUser?.following?.map((f) => f.toString()) || [];
    const blockedIds = currentUser?.blockedUsers?.map((b) => b.toString()) || [];

    
    const searchFilter = {
      $and: [
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: query },
            { "destinations.city": { $regex: query, $options: "i" } },
            { "destinations.state": { $regex: query, $options: "i" } },
            { "destinations.country": { $regex: query, $options: "i" } },
          ],
        },
        { user: { $nin: blockedIds } },
        { isArchived: { $ne: true } },
      ],
    };

   
    const trips = await Trip.find(searchFilter)
      .select(
        "title coverPhoto destinations tags   visibility user acceptedFriends createdAt"
      )
      .populate("user", "name username avatar closeFriends blockedUsers")
      .populate("acceptedFriends.user", "name username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    
    saveSearchHistory(userId, req.query.q, "trip").catch(() => {});

    
    const results = trips.filter((trip) => {
      if (!trip.user) return false;

      const ownerId = trip.user._id.toString();
      const ownerBlockedIds =
        (trip.user.blockedUsers || []).map((id) => id.toString()) || [];
      const ownerCloseFriendIds =
        (trip.user.closeFriends || []).map((id) => id.toString()) || [];

     
      if (
        blockedIds.includes(ownerId) ||
        ownerBlockedIds.includes(currentUser._id.toString())
      ) {
        return false;
      }

    
      switch (trip.visibility) {
        case "public":
          return true;
        case "followers":
          return followingIds.includes(ownerId);
        case "close_friends":
          return ownerCloseFriendIds.includes(currentUser._id.toString());
        case "private":
          return ownerId === currentUser._id.toString();
        default:
          return false;
      }
    });

   
    return res.status(200).json({
      success: true,
      count: results.length,
      page,
      limit,
      trips: results,
    });
  } catch (error) {
    console.error("❌ Error in /search/trips:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching trips",
      error: error.message,
    });
  }
};

export default searchTrips;
