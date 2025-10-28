import User from "../../models/User.js";

const followerOfId = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const target = await User.findById(id)
      .select("followers isBanned isDeactivated blockedUsers privacy closeFriends")
      .populate({
        path: "followers",
        select: "name username avatar",
      });

    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (target.isBanned) {
      return res.status(403).json({ message: "User is banned from TravelTales" });
    }

    if (target.isDeactivated) {
      return res.status(403).json({ message: "User is currently deactivated" });
    }

    const isBlocked = target.blockedUsers?.some(
      (uid) => uid.toString() === user._id.toString()
    );
    if (isBlocked) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    const hasBlocked = user.blockedUsers?.some(
      (uid) => uid.toString() === target._id.toString()
    );
    if (hasBlocked) {
      return res.status(403).json({ message: "You blocked this user" });
    }

    const userFollowingIds = user.following.map((f) => f.toString());
    const totalFollowers = target.followers.length;

    if (totalFollowers === 0) {
      return res.status(200).json({ followers: [] });
    }

   
    const visibility = target.privacy?.profileVisibility || "public";

    if (visibility === "private" && id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "This account is private" });
    }

    if (visibility === "followers") {
      const isFollower = target.followers.some(
        (f) => f._id.toString() === user._id.toString()
      );
      if (!isFollower) {
        return res.status(403).json({
          message: "Only followers can view this user's followers",
        });
      }
    }

    if (visibility === "close_friends") {
      const isCloseFriend = target.closeFriends?.some(
        (uid) => uid.toString() === user._id.toString()
      );
      if (!isCloseFriend) {
        return res.status(403).json({
          message: "Only close friends can view this user's followers",
        });
      }
    }

    const followers = target.followers.map((follower) => ({
      ...follower.toObject(),
      followBack: userFollowingIds.includes(follower._id.toString()),
    }));

    return res.status(200).json({ followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default followerOfId;
