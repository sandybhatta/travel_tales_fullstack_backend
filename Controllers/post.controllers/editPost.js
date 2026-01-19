
import Post from "../../models/Post.js";
import Trip from "../../models/Trip.js";
import User from "../../models/User.js";

const editPost = async (req, res) => {
  try {
    const { caption, location, visibility, tripId, taggedUsers, dayNumber, isHighlighted } = req.body;
    const user = req.user;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Only the post owner can edit" });
    }

    if (taggedUsers !== undefined) {
      post.taggedUsers = taggedUsers;
    }

    if (tripId && !post.sharedFrom) {
      if (post.tripId?.toString() === tripId.toString()) {
        return res.status(400).json({ message: "This post already belongs to that trip" });
      }

      // If the post was previously assigned to a trip, remove it from that trip
      if (post.tripId) {
        const oldTrip = await Trip.findById(post.tripId);
        if (oldTrip) {
          oldTrip.posts = oldTrip.posts.filter(p => p.post.toString() !== postId.toString());
          await oldTrip.save();
        }
      }

      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const canPost = trip.canPost(user);
      if (!canPost) {
        return res.status(403).json({ message: "You are neither the owner nor a collaborator of that trip" });
      }

      // Add the post to the new trip's posts array with details
      trip.posts.push({
        post: post._id,
        dayNumber: dayNumber,
        isHighlighted: isHighlighted,
        highlightedBy: isHighlighted ? user._id : null,
        addedAt: new Date()
      });
      await trip.save();

      post.tripId = trip._id;
      post.visibility = trip.visibility;
    }

    if (!post.tripId && visibility && ["public", "followers", "close_friends", "private"].includes(visibility)) {
      post.visibility = visibility;
    }

    let mentions = [];
    let hashtags = [];

    if (caption !== undefined) {
      post.caption = caption;
      
      // If mentions are explicitly provided in body (from frontend state), use them
      if (req.body.mentions) {
         post.mentions = req.body.mentions;
      } else {
          // Fallback: Parse from caption if not provided
          // Extract mentions
          const mentionNames = caption
            .split(" ")
            .filter(word => word.startsWith("@"))
            .map(word => word.slice(1).trim());

          if (mentionNames.length > 0) {
            const mentionedUsers = await User.find({
              username: { $in: mentionNames },
            }).select("_id");
            mentions = [...new Set(mentionedUsers.map(user => user._id.toString()))];
            post.mentions = mentions;
          } else {
             post.mentions = [];
          }
      }

      // Extract hashtags
      hashtags = caption
        .split(" ")
        .filter(word => word.startsWith("#"))
        .map(word => word.slice(1).trim().toLowerCase())
        .filter(tag => tag.length > 0);

      hashtags = [...new Set(hashtags)];
      post.hashtags = hashtags;
    } else if (req.body.mentions) {
       // Case where caption isn't updated but mentions are (unlikely but safe to handle)
       post.mentions = req.body.mentions;
    }

    if (location) {
      post.location = location;
    }

    await post.save();

    return res.status(200).json({ message: "Post modified successfully", post });
  } catch (error) {
    console.error("Edit post error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default editPost;
