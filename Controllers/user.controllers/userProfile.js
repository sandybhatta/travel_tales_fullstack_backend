import Post from "../../models/Post.js";
import Trip from "../../models/Trip.js";
import User from "../../models/User.js";

const userProfile = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const targetUser = await User.findById(id).select(
      "name username email avatar location bio privacy interests followers following closeFriends blockedUsers isBanned isDeactivated usernameChangedAt"
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

    const viewerId = user._id.toString();
    const targetId = targetUser._id.toString();

    const viewerFollowingIds = (user.following || []).map((uid) =>
      uid.toString()
    );
    const viewerFollowerIds = (user.followers || []).map((uid) =>
      uid.toString()
    );

    const targetFollowerIds = (targetUser.followers || []).map((uid) =>
      uid.toString()
    );

    const isSelf = viewerId === targetId;
    const isFollowing = viewerFollowingIds.includes(targetId);
    const isFollower = viewerFollowerIds.includes(targetId);
    const isCloseFriend =
      user.closeFriends?.some((uid) => uid.toString() === targetId) ||
      false;

    const mutualFollowersCount = targetFollowerIds.filter((fid) =>
      viewerFollowerIds.includes(fid)
    ).length;

    const viewerRelationship = {
      isSelf,
      isFollowing,
      isFollower,
      isCloseFriend,
      mutualFollowersCount,
    };

    const postCount = await Post.countDocuments({ author: id });
    const tripCount = await Trip.countDocuments({ user: id });

    if (isSelf) {
      const myPosts = await Post.find({ author: id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id caption createdAt visibility tripId");

      const likedPosts = await Post.find({ likes: id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id caption createdAt visibility tripId");

      const collaboratedTrips = await Trip.find({
        "acceptedFriends.user": id,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("_id title startDate endDate visibility");

      // Calculate Username Change Eligibility
      const lastChangeDate = targetUser.usernameChangedAt;
      let canChangeUsername = true;
      let daysRemainingForUsername = 0;

      if (lastChangeDate) {
        const now = new Date();
        const lastChange = new Date(lastChangeDate);
        const diffTime = Math.abs(now - lastChange);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
          canChangeUsername = false;
          daysRemainingForUsername = 30 - diffDays;
        }
      }

      return res.status(200).json({
        user: targetUser.toObject(),
        followerCount: targetUser.followers.length,
        followingCount: targetUser.following.length,
        closeFriendCount: targetUser.closeFriends.length,
        postCount,
        tripCount,
        viewerRelationship,
        myPosts,
        likedPosts,
        collaboratedTrips,
        usernameChangeStatus: {
          canChange: canChangeUsername,
          daysRemaining: daysRemainingForUsername,
          lastChangedAt: lastChangeDate,
        },
      });
    }

    const profileVisibility =
      targetUser.privacy.profileVisibility || "public";

    if (profileVisibility === "followers") {
      if (!viewerFollowingIds.includes(targetUser._id.toString())) {
        return res.status(200).json({
          user: {
            name: targetUser.name,
            username: targetUser.username,
            avatar: targetUser.avatar,
          },
          privacy: "followers",
          criteriaMet: false,
          viewerRelationship,
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
        viewerRelationship,
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
          viewerRelationship,
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
      viewerRelationship,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default userProfile;
