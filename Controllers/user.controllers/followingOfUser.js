import User from "../../models/User.js";

const followingOfUser = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  try {
    
    if (id.toString() === user._id.toString()) {
      const self = await User.findById(user._id)
        .select("following")
        .populate({
          path: "following",
          select: "name username avatar",
          options: { skip, limit },
        });

      const followingList = self.following.map((f) => {
        const fObj = f.toObject();
        return {
          ...fObj,
          isCloseFriend: user.closeFriends?.some(
            (cfId) => cfId.toString() === f._id.toString()
          ),
        };
      });

      return res.status(200).json({
        count: self.following.length,
        followingList,
        hasMore: self.following.length > skip + limit,
      });
    }

   
    const target = await User.findById(id).select(
      "following followers closeFriends isBanned isDeactivated blockedUsers privacy"
    );

    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.isBanned || target.isDeactivated)
      return res.status(403).json({ message: "User not available" });

    const isBlocked = target.blockedUsers?.includes(user._id);
    const hasBlocked = user.blockedUsers?.includes(target._id);

    if (isBlocked) return res.status(403).json({ message: "You are blocked" });
    if (hasBlocked) return res.status(403).json({ message: "You blocked this user" });

    const visibility = target.privacy?.profileVisibility || "public";

    if (visibility === "private")
      return res.status(403).json({ message: "This account is private" });

    if (visibility === "followers") {
      const isFollower = target.followers.some(
        (f) => f.toString() === user._id.toString()
      );
      if (!isFollower)
        return res
          .status(403)
          .json({ message: "Only followers can view this user's following" });
    }

    if (visibility === "close_friends") {
      const isCloseFriend = target.closeFriends?.some(
        (f) => f.toString() === user._id.toString()
      );
      if (!isCloseFriend)
        return res
          .status(403)
          .json({ message: "Only close friends can view this user's following" });
    }

    
    const totalFollowings = target.following.length;
    if (totalFollowings === 0)
      return res.status(200).json({
        count: 0,
        followingList: [],
        hasMore: false,
      });

    const followingIds = target.following.slice(skip, skip + limit);
    const followings = await User.find({ _id: { $in: followingIds } })
      .select("username name avatar")
      .lean();

    return res.status(200).json({
      count: totalFollowings,
      followingList: followings,
      hasMore: skip + limit < totalFollowings,
    });
  } catch (error) {
    console.error("Error fetching followings:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default followingOfUser;
