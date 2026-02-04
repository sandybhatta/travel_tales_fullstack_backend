import Post from "../../models/Post.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import Trip from "../../models/Trip.js";
import User from "../../models/User.js";
import { createNotification } from "../../utils/notificationHandler.js";

const createPost = async (req, res) => {
  try {
    const user = req.user;


    const fieldsToParse = [
      "taggedUsers",
      "location",
      "mentions",
    ];

    fieldsToParse.forEach((field) => {
      if (typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (err) {
          req.body[field] = [];
        }
      }
    });




    const {
      caption,
      taggedUsers = [],
      tripId,
      location,
      visibility,
      mentions = [],
      dayNumber,
      isHighlighted,
    } = req.body;

    if (!caption && (!req.files || req.files.length === 0)) {
      return res
        .status(400)
        .json({ message: "Post must have either caption or media." });
    }

    // Upload media to Cloudinary
    const media = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const resource_type = file.mimetype.startsWith("video")
          ? "video"
          : "image";
        const result = await uploadToCloudinary(
          file.buffer,
          `posts/${user._id}`,
          resource_type
        );
        media.push({
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        });
      }
    }

    // Validate taggedUsers (must be in user's following list)
    const followingIds = user.following.map((id) => id.toString());
    const validTaggedUsers = Array.isArray(taggedUsers)
      ? taggedUsers.filter((id) => {
          const idStr = id.toString();
          return idStr !== user._id.toString() && followingIds.includes(idStr);
        })
      : [];

    // Extract hashtags & mentions from caption
    let hashtags = [];

    if (caption) {
      hashtags = caption
        .split(" ")
        .filter((word) => word.startsWith("#"))
        .map((tag) => tag.slice(1).trim().toLowerCase())
        .filter((tag) => tag.length > 0);
    }

    let postVisibility;
    let trip;
    if (tripId) {
      trip = await Trip.findById(tripId);
      if (!trip || !trip.canPost(user)) {
        return res
          .status(403)
          .json({ message: "You cannot post to this trip." });
      }
      postVisibility = trip.visibility;
    }

    const allowedVisibility = [
      "public",
      "followers",
      "close_friends",
      "private",
    ];
    // Create post
    const newPost = await Post.create({
      author: user._id,
      caption: caption ? caption.trim() : undefined,
      hashtags,
      media,
      visibility: postVisibility
        ? postVisibility
        : allowedVisibility.includes(visibility)
        ? visibility
        : undefined,
      tripId: tripId || null,
      taggedUsers: validTaggedUsers,
      location: location ? location : undefined,
      mentions: mentions?.length > 0 ? mentions : undefined,
    });

    if (tripId) {
      trip.posts.push({
        post: newPost._id,
        dayNumber: dayNumber ? dayNumber : 1,
        isHighlighted: isHighlighted ? isHighlighted : false,
        highlightedBy:isHighlighted?user._id:null
      });
      await trip.save()
    }

    // --- Notifications Logic ---

    // 1. Tagged Users
    if (validTaggedUsers.length > 0) {
        await Promise.all(validTaggedUsers.map(async (taggedUserId) => {
            await createNotification({
                recipient: taggedUserId,
                sender: user._id,
                type: "tagged_in_post",
                relatedPost: newPost._id,
                message: `${user.username} tagged you in a post.`
            });
        }));
    }

    // 2. Mentions in Caption
    if (mentions && mentions.length > 0) {
        await Promise.all(mentions.map(async (mentionedUserId) => {
             // Only notify if not already tagged (to avoid duplicates if logic overlaps, though strict usage suggests they are distinct)
             // We cast to string for comparison just in case
             if (!validTaggedUsers.some(id => id.toString() === mentionedUserId.toString())) {
                await createNotification({
                    recipient: mentionedUserId,
                    sender: user._id,
                    type: "mention_in_caption",
                    relatedPost: newPost._id,
                    message: `${user.username} mentioned you in a caption.`
                });
             }
        }));
    }

    // 3. Notify Followers (New Post)
    if (["public", "followers"].includes(newPost.visibility)) {
        const authorWithFollowers = await User.findById(user._id).select("followers");
        if (authorWithFollowers && authorWithFollowers.followers.length > 0) {
            await Promise.all(authorWithFollowers.followers.map(async (followerId) => {
                 await createNotification({
                    recipient: followerId,
                    sender: user._id,
                    type: "new_post_from_following",
                    relatedPost: newPost._id,
                    message: `${user.username} created a new post.`
                });
            }));
        }
    }
    // ---------------------------

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    console.error("Post creation failed:", err);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

export default createPost;
