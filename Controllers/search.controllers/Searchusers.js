
import User from "../../models/User.js";
import saveSearchHistory from "../../utils/saveSearchHistory.js";

const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: "Query is required." });
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    // Get current user to check following status and blocked users
    const currentUser = await User.findById(req.user._id)
      .select("following blockedUsers")
      .lean();

    if (!currentUser) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const blockedIds = (currentUser.blockedUsers || []).map((id) =>
      id.toString()
    );
    const followingSet = new Set(
      (currentUser.following || []).map((id) => id.toString())
    );

    // Construct Query
    const query = {
      _id: { $nin: [...blockedIds, currentUser._id] }, // Exclude self and users blocked by me
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
      blockedUsers: { $ne: currentUser._id }, // Exclude users who blocked me
    };

    // Find Users
    const users = await User.find(query)
      .select("username name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Count Total (for pagination)
    const total = await User.countDocuments(query);

    // Format Results
    const results = users.map((u) => ({
      _id: u._id,
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      isFollowing: followingSet.has(u._id.toString()),
    }));

    // Save History (Async)
    saveSearchHistory(req.user._id, q, "user").catch((err) => {
      console.error("Failed to save search history:", err.message || err);
    });

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
