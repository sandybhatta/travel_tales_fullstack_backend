import Post from "../../models/Post.js";
import Trip from "../../models/Trip.js";
import User from "../../models/User.js";

const userProfile = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const targetUser = await User.findById(id).select(
      "name username avatar location bio privacy interests followers following closeFriends blockedUsers isBanned isDeactivated"
    );

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.isDeactivated) {
      return res.status(410).json({ message: "User is deactivated" });
    }

    if (targetUser.isBanned) {
      return res.status(403).json({ message: "User is banned" });
    }


    const isBlocked = targetUser.blockedUsers?.some(
      (uid) => uid.toString() === user._id.toString()
    );

    const hasBlocked = user.blockedUsers?.some(
      (uid) => uid.toString() === targetUser._id.toString()
    );

    if (isBlocked || hasBlocked) {
      return res
        .status(403)
        .json({ message: "Cannot view this person's profile" });
    }

 
    const postCount = await Post.countDocuments({ author: id });
    const tripCount = await Trip.countDocuments({ user: id });


    if (user._id.toString() === id.toString()) {
      return res.status(200).json({
        user: targetUser.toObject(),
        followerCount: targetUser.followers.length,
        followingCount: targetUser.following.length,
        closeFriendCount: targetUser.closeFriends.length,
        postCount,
        tripCount,
      });
    }

    const userFollowingIds = user.following.map((uid) => uid.toString());
    const profileVisibility =
      targetUser.privacy.profileVisibility || "public";

  
    if (profileVisibility === "followers") {
      if (!userFollowingIds.includes(targetUser._id.toString())) {
        return res.status(200).json({
          user: {
            name: targetUser.name,
            username: targetUser.username,
            avatar: targetUser.avatar,
          },
          privacy: "followers",
          criteriaMet: false,
        });
      }
    }

    if (
      profileVisibility === "private" &&
      targetUser._id.toString() !== user._id.toString()
    ) {
      return res.status(200).json({
        user: {
          name: targetUser.name,
          username: targetUser.username,
          avatar: targetUser.avatar,
        },
        privacy: "private",
        criteriaMet: false,
      });
    }

    if (profileVisibility === "close_friends") {
      const isCloseFriend = targetUser.closeFriends?.some(
        (uid) => uid.toString() === user._id.toString()
      );

      if (!isCloseFriend) {
        return res.status(200).json({
          user: {
            name: targetUser.name,
            username: targetUser.username,
            avatar: targetUser.avatar,
          },
          privacy: "close_friends",
          criteriaMet: false,
        });
      }
    }

   
    return res.status(200).json({
      user: targetUser.toObject(),
      followerCount: targetUser.followers.length,
      followingCount: targetUser.following.length,
      closeFriendCount: targetUser.closeFriends.length,
      postCount,
      tripCount,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default userProfile;
