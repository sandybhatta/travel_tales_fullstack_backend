import Post from "../../models/Post.js";
import Comment from "../../models/Comment.js";
import User from "../../models/User.js";

const getPostDetails = async (req, res) => {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).populate([
      {
        path: "author",
        select: "name username avatar followers closeFriends privacy",
      },
      {
        path: "taggedUsers",
        select: "name username avatar followers",
      },
      {
        path: "mentions",
        select: "name username avatar",
      },
      {
        path: "likes",
        select: "name username avatar",
      },
      {
        path: "tripId",
        select: "title visibility startDate endDate acceptedFriends user coverPhoto destinations",
        populate: [
          {
            path: "user",
            select: "name username avatar",
          },
          {
            path: "acceptedFriends.user",
            select: "name username avatar",
          },
        ],
      },
      {
        path: "sharedFrom",
        populate: [
          {
            path: "author",
            select: "name username avatar",
          },
          {
            path: "taggedUsers",
            select: "name username avatar",
          },
          {
            path: "mentions",
            select: "name username avatar",
          },
          {
            path: "tripId",
            select: "title visibility startDate endDate acceptedFriends user coverPhoto destinations",
            populate: [
              {
                path: "user",
                select: "name username avatar",
              },
              {
                path: "acceptedFriends.user",
                select: "name username avatar",
              },
            ],
          },
        ],
      },
    ]);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.author) {
      return res.status(404).json({ message: "Post author not found" });
    }

    const isOwner = post.author._id.toString() === user._id.toString();

    // Step 1: Trip-based visibility
    if (post.tripId) {
      const canView = await post.tripId.canView(user);
      if (!canView) {
        return res
          .status(403)
          .json({ message: "You are not allowed to view this post." });
      }
    } else {
      // Step 2: Post-level visibility
      const visibility = post.visibility || "public";

      if (!isOwner) {
        if (visibility === "followers") {
          const followerIds = post.author.followers.map((f) =>
            f._id.toString()
          );
          if (!followerIds.includes(user._id.toString())) {
            return res.status(403).json({
              message: "Only followers and the post owner can see the post",
            });
          }
        } else if (visibility === "close_friends") {
          const closeFriendIds = post.author.closeFriends.map((f) =>
            f._id.toString()
          );
          if (!closeFriendIds.includes(user._id.toString())) {
            return res.status(403).json({
              message: "Only close friends and the post owner can see the post",
            });
          }
        } else if (visibility === "private") {
          return res.status(403).json({
            message: "Only the post owner can see this post",
          });
        }
      }
    }

  
    if (post.sharedFrom && !isOwner) {
      const original = post.sharedFrom;
      let isOriginalPublic = false;

      if (original.tripId) {
        // If part of a trip, Trip visibility dictates
        isOriginalPublic = original.tripId.visibility === "public";
      } else {
        // Standalone post
        isOriginalPublic = (original.visibility || "public") === "public";
      }

      if (!isOriginalPublic) {
        return res.status(403).json({
          message: "The original post has been restricted by the author.",
        });
      }
    }

    // Step 3: Engagement info
    const likeIds = post.likes.map(like => like._id);
    const [
      commentsCount,
      hasLiked,
      bookmarkCount,
      isBookmarked,
      shareCount,
      followedLikes,
    ] = await Promise.all([
      Comment.countDocuments({ post: post._id }),
      Post.exists({ _id: post._id, likes: user._id }),
      User.countDocuments({ bookmarks: post._id }),
      User.exists({ _id: user._id, bookmarks: post._id }),
      Post.countDocuments({ sharedFrom: post._id }),
      User.find({
        $and: [
          { _id: { $in: likeIds } },
          { _id: { $in: user.following } }
        ]
      })
        .select("name username avatar")
        .limit(3),
    ]);

    const likesCount = post.likes?.length || 0;

    // Step 4: Shareability
    // Logic: Trip overrides Post. If Trip exists, check Trip visibility. Else check Post.
    const isPostPublic = post.tripId
      ? post.tripId.visibility === "public"
      : (post.visibility || "public") === "public";

    let isOriginalPublic = true;
    const sharedFrom = post.sharedFrom;
    if (sharedFrom) {
      isOriginalPublic = sharedFrom.tripId
        ? sharedFrom.tripId.visibility === "public"
        : (sharedFrom.visibility || "public") === "public";
    }

    const canShare = isPostPublic && isOriginalPublic;

    res.status(200).json({
      message: "Post details fetched successfully",
      post,
      isOwner,
      likesCount,
      commentsCount,
      hasLiked: !!hasLiked,
      canShare,
      bookmarkCount,
      isBookmarked: !!isBookmarked,
      shareCount,
      followedLikes,
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).json({ message: "Server error while fetching post" });
  }
};

export default getPostDetails;
