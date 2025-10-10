
import User from "../../models/User.js";
import saveSearchHistory from "../../utils/saveSearchHistory.js"


const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.status(400).json({ success: false, message: "Query  is required." });
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 50); 
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const searchQuery = q.toLowerCase();

    const currentUser = await User.findById(req.user._id)
      .select("following followers closeFriends blockedUsers")
      .lean();

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

   
    const pipeline = [
      {
        $match: {
          _id: { $ne: currentUser._id }, 
          blockedUsers: { $ne: currentUser._id }, 
        },
      },
      {
        $addFields: {
          _usernameLower: { $toLower: { $ifNull: ["$username", ""] } },
          _nameLower: { $toLower: { $ifNull: ["$name", ""] } },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $gt: [{ $indexOfCP: ["$_usernameLower", searchQuery] }, -1] },
              { $gt: [{ $indexOfCP: ["$_nameLower", searchQuery] }, -1] },
            ],
          },
        },
      },
  
      {
        $project: {
          username: 1,
          name: 1,
          "avatar.url": 1,
          bio: 1,
          followers: 1,
          following: 1,
          closeFriends: 1,
          _usernameLower: 0,
          _nameLower: 0,
          password: 0,
          email: 0,
          emailVerifyToken: 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit + 0 },
    ];

    const matchedUsers = await User.aggregate(pipeline).exec();

    // If the current user has some blocked users then filter them out (users blocked by this user)
    const blockedByCurrent = (currentUser.blockedUsers || []).map((id) => id.toString());
    const filteredUsers = matchedUsers.filter(
      (u) => !blockedByCurrent.includes(String(u._id))
    );

    
    const followingSet = new Set((currentUser.following || []).map((id) => id.toString()));
    const followerSet = new Set((currentUser.followers || []).map((id) => id.toString()));
    const closeFriendSet = new Set((currentUser.closeFriends || []).map((id) => id.toString()));

    const results = filteredUsers.map((u) => {
      const uid = u._id.toString();
      return {
        _id: u._id,
        username: u.username,
        name: u.name,
        avatar: u.avatar?.url || (u.avatar || null),
        isFollowing: followingSet.has(uid),
        isFollower: followerSet.has(uid),
        isCloseFriend: closeFriendSet.has(uid),
      };
    });

    
    saveSearchHistory(req.user._id, q, "user").catch((err) => {
      console.error("Failed to save search history:", err.message || err);
    });

    const countPipeline = [
      {
        $match: {
          _id: { $ne: currentUser._id },
          blockedUsers: { $ne: currentUser._id },
        },
      },
      {
        $addFields: {
          _usernameLower: { $toLower: { $ifNull: ["$username", ""] } },
          _nameLower: { $toLower: { $ifNull: ["$name", ""] } },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $gt: [{ $indexOfCP: ["$_usernameLower", searchQuery] }, -1] },
              { $gt: [{ $indexOfCP: ["$_nameLower", searchQuery] }, -1] },
            ],
          },
        },
      },
      { $count: "total" },
    ];

    const countResult = await User.aggregate(countPipeline).exec();
    const total = countResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      users: results,
    });
  } catch (err) {
    console.error("searchUsers error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while searching users.",
      error: err.message,
    });
  }
};

export default searchUsers;






