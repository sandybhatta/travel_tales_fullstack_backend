import Post from "../../models/Post.js";
import User from "../../models/User.js";

//  Recursive function to trace the original post
const findOriginalPost = async (postId) => {
  const post = await Post.findById(postId).select("sharedFrom");
  if (!post) return null;
  return post.sharedFrom ? findOriginalPost(post.sharedFrom) : post;
};

const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, taggedUsers = [], location, mentions } = req.body;
    const user = req.user;

    //  Get the very original post (not just the shared one)
    const originalPost = await findOriginalPost(postId);
    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }

    //  Load original post with trip info
    const original = await Post.findById(originalPost._id)
      .select("tripId visibility")
      .populate("tripId", "visibility");

    // Strict visibility check:
    // 1. If part of a trip, ONLY trip visibility matters.
    // 2. If NOT part of a trip, post visibility matters.
    let isShareable = false;

    if (original.tripId) {
      // Post is part of a trip -> Trip visibility rules apply
      isShareable = original.tripId.visibility === "public";
    } else {
      // Post is standalone -> Post visibility rules apply
      isShareable = original.visibility === "public";
    }

    if (!isShareable) {
      return res.status(403).json({
        message: "Only public posts or posts from public trips can be shared",
      });
    }

    //  Filter valid tagged users (must be in following)
    const followingIds = user.following.map((id) => id.toString());
    const validTaggedUsers = Array.isArray(taggedUsers)
      ? taggedUsers.filter((id) => {
          const idStr = id.toString();
          return idStr !== user._id.toString() && followingIds.includes(idStr);
        })
      : [];

    //  Hashtags and Mentions
    let hashtags = [];
   

    if (caption) {
      const words = caption.split(" ");

      hashtags = words
        .filter((word) => word.startsWith("#"))
        .map((tag) => tag.slice(1).trim().toLowerCase())
        .filter((tag) => tag.length > 0);

     
    }

    //  Create the shared post
    const newPost = await Post.create({
      author: user._id,
      caption: caption?.trim() || undefined,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      mentions: mentions?.length > 0 ? mentions : undefined,
      taggedUsers: validTaggedUsers.length > 0 ? validTaggedUsers : [],
      sharedFrom: original._id,
      location: location || undefined,
      visibility:  "public", // default fallback
    });

    return res.status(201).json({
      message: "Post shared successfully",
      post: newPost,
    });
  } catch (error) {
    console.error(" Error sharing post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default sharePost;
