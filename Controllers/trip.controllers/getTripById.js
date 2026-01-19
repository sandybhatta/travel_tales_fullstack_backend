import Comment from "../../models/Comment.js";
import Trip from "../../models/Trip.js";
import User from "../../models/User.js";

const getTripById = async (req, res) => {
  const user = req.user;
  const { tripId } = req.params;

  try {
    if (!tripId) return res.status(400).json({ message: "Invalid trip ID" });

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const canView = await trip.canView(user);
    if (!canView)
      return res
        .status(403)
        .json({ message: "You are not allowed to view this trip" });

    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);
    const isLiked = trip.likes?.some(
      (id) => id.toString() === user._id.toString()
    );

    const currentUserFlags = {
      userStatus: isOwner
        ? "owner"
        : isCollaborator
        ? "collaborator"
        : "viewer",
      isInvited: trip.isFriendInvited(user._id),
      isLiked,
      canAddPost: trip.canPost(user),
      canEditTrip: isOwner || isCollaborator,
      canDeleteTrip: isOwner,
      canInviteFriends: isOwner || isCollaborator,
      canAccessPrivateData: isOwner || isCollaborator,
    };

    // Populate all necessary references
    await trip.populate([
      { path: "user", select: "name username avatar" },
      { path: "acceptedFriends.user", select: "name username avatar" },
      { path: "expenses.spentBy", select: "name username avatar" },
      { path: "notes.createdBy", select: "username avatar" },
      { path: "todoList.createdBy", select: "username avatar"},
      { path: "todoList.assignedTo", select: "username avatar"},
      {
        path: "posts.post",
        populate: [
          { path: "author", select: "name username avatar" },
          { path: "mentions", select: "name username avatar" },
          { path: "taggedUsers", select: "name username avatar" },
        ],
      },
      {
        path: "posts.highlightedBy",
        select: "username avatar ",
      },
    ]);

    // Process posts
    const posts = await Promise.all(
      trip.posts.map(
        async ({ post, addedAt, dayNumber, isHighlighted, highlightedBy }) => {
          if (!post) return null; // Handle case where post might be null
          const likeCount = post.likes?.length || 0;
          const commentCount = await Comment.countDocuments({ post: post._id });

          const isLikedByCurrentUser = post.likes.some(
            (id) => id.toString() === user._id.toString()
          );
          const isPostedByOwner =
            trip.user._id.toString() === post.author._id.toString();

          let highlightedByUser = isHighlighted && highlightedBy ? highlightedBy : null;

          return {
            ...post.toObject(),
            addedAt,
            dayNumber,
            isHighlighted,
            highlightedBy: highlightedByUser,
            likeCount,
            commentCount,
            isLikedByCurrentUser,
            isPostedByOwner,
          };
        }
      )
    );

    // Group by itinerary days
    const itinerary = posts.reduce((acc, post) => {
      if (!post || !post.dayNumber) return acc;
      if (!acc[post.dayNumber]) acc[post.dayNumber] = [];
      acc[post.dayNumber].push(post);
      return acc;
    }, {});

    // Calculate total comments for the trip
    const totalComments = posts.reduce((acc, post) => {
      if (!post) return acc;
      return acc + (post.commentCount || 0);
    }, 0);

    // Prepare main trip data object
    const rawTrip = {
      ...trip.toObject(),
    };
    if (!currentUserFlags.canAccessPrivateData) {
      delete rawTrip.notes;
      delete rawTrip.todoList;
      delete rawTrip.expenses;
    } else {
      const notes = [...trip.notes].sort((a, b) => {
        if (a.isPinned === b.isPinned)
          return new Date(b.createdAt) - new Date(a.createdAt);
        return a.isPinned ? -1 : 1;
      });

      const todos = [...trip.todoList].sort(
        (a, b) =>
          new Date(a.dueDate || a.createdAt) -
          new Date(b.dueDate || b.createdAt)
      );
      const expenses = [...trip.expenses].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const totalTasks = todos.length;
      const completedTasks = todos.filter((t) => t.done).length;

      rawTrip.travelBudget = trip.travelBudget || 0;
      rawTrip.totalSpent = totalSpent;
      rawTrip.notes = notes;
      rawTrip.todoList = todos;
      rawTrip.expenses = expenses;
      rawTrip.taskStats = { totalTasks, completedTasks };
    }
    const tripData = {
      ...rawTrip,
      virtuals: {
        tripStatus: trip.tripStatus,
        duration: trip.duration,
        postCount: trip.postCount,
        isCollaborative: trip.isCollaborative,
      },
      currentUser: currentUserFlags,
      totalLikes: trip.likes?.length || 0,
      totalComments,
      tags: trip.tags || [],
      isArchived: trip.isArchived,
      itinerary,
    };

    // Liked by followings
    const userDoc = await User.findById(user._id)
      .select("following")
      .populate("following", "name username avatar")
      .lean();
    const likesOfTrip = trip.likes?.map((id) => id.toString()) || [];
    const likedByFollowings = userDoc.following.filter((f) =>
      likesOfTrip.includes(f._id.toString())
    );

    tripData.likedByFollowings = likedByFollowings;

    // Pending invites if owner
    if (isOwner) {
      const pendingInvites = await User.find({
        _id: { $in: trip.invitedFriends || [] },
      }).select("name username avatar");
      tripData.pendingInvites = pendingInvites;
    }

    // Engagement summary
    tripData.engagement = {
      totalLikes: trip.likes?.length || 0,
      totalPosts: trip.posts.length,
      collaboratorCount: trip.acceptedFriends?.length || 0,
    };

    res.status(200).json({ trip: tripData });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getTripById;
