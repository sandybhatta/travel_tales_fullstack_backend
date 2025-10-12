import User from "../../models/User.js";

const followingOfUser = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const target = await User.findById(id).select("following followers closeFriends isBanned isDeactivated blockedUsers privacy");

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
      (userId) => userId.toString() === user._id.toString()
    );

    if (isBlocked) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }
    
    

    const hasBlocked = user.blockedUsers?.some(
      (userId) => userId.toString() === target._id.toString()
    );

    if (hasBlocked) {
      return res.status(403).json({ message: "You blocked the user" });
    }

    const visibility = target.privacy?.profileVisibility || "public";

    
        if (visibility === "private") {
            if(id.toString() !== user._id.toString()){
                return res.status(403).json({ message: "This account is private" });
            }
        
        }
    

    if (visibility === "followers") {
      const isFollower = target.followers.some(
        (followerId) => followerId.toString() === user._id.toString()
      );

      if (!isFollower) {
        return res.status(403).json({
          message: "Only followers can view this user's following",
        });
      }
    }
    if(visibility==="close_friends"){

        const isCloseFriends= target.closeFriends?.some(uid=>uid.toString() === user._id.toString())

        if(!isCloseFriends){
            return res.status(403).json({
                message: "Only close friends can view this user's followings",
              });
        }

    }

    // Paginate the followers manually
    const totalFollowings = target.following.length;
    if (totalFollowings === 0) {
        return res.status(200).json({
          count: 0,
          followeingList: [],
          hasMore: false,
        });
      }
    const followingIds = target.following.slice(skip, skip + limit);

    const followings = await User.find({ _id: { $in: followingIds } })
      .select("username name avatar")
      .lean();

    return res.status(200).json({
        count:totalFollowings,
      followingList: followings,
      hasMore: skip + limit < totalFollowings,
    });

  } catch (error) {
    console.error("Error fetching followings:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default followingOfUser;
