import User from "../../models/User.js";

const searchMentionableUser = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: "Query is required" });
    }

    const regex = new RegExp("^" + q, "i");

   
    const currentUser = await User.findById(currentUserId).select("following");

  
    const followingMatches = await User.find({
      _id: { $in: currentUser.following },
      username: { $regex: regex },
    })
      .select("username name avatar")
      .limit(5);

    if (followingMatches.length >= 5) {
      return res.json({ users: followingMatches });
    }

    const excludeIds = [
      currentUserId,
      ...followingMatches.map((u) => u._id),
    ];

    const globalMatches = await User.find({
      _id: { $nin: excludeIds },
      username: { $regex: regex },
    })
      .select("username name avatar")
      .limit(5 - followingMatches.length);

    return res.json({
      users: [...followingMatches, ...globalMatches],
    });
  } catch (error) {
    console.error("Mention search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default searchMentionableUser;
