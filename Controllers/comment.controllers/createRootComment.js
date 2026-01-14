import Post from "../../models/Post.js";
import Comment from "../../models/Comment.js";
import User from "../../models/User.js";

const createRootComment = async (req, res) => {
  try {
    const  user  = req.user;
    const { postId } = req.params;
    const { content } = req.body;


    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "A comment must have content" });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: "Only 1000 characters are allowed" });
    }

    
    const post = await Post.findById(postId).populate("author", "privacy followers closeFriends");
    if (!post) {
      return res.status(404).json({ message: "No post found" });
    }

    // Privacy Check
    const author = post.author;
    if (author) {
        const allowComments = author.privacy?.allowComments || "everyone";
        const isSelf = author._id.toString() === user._id.toString();

        if (!isSelf) {
             if (allowComments === "no_one") {
                 return res.status(403).json({ message: "Comments are disabled for this post." });
             }
             if (allowComments === "followers") {
                 const isFollower = author.followers.some(id => id.toString() === user._id.toString());
                 if (!isFollower) {
                      return res.status(403).json({ message: "Only followers can comment." });
                 }
             }
             if (allowComments === "close_friends") {
                 const isCloseFriend = author.closeFriends.some(id => id.toString() === user._id.toString());
                 if (!isCloseFriend) {
                      return res.status(403).json({ message: "Only close friends can comment." });
                 }
             }
        }
    }

    
    let mentions = [];

    const words = content.split(" ");
    const potentialMentions = words
      .filter((word) => word.startsWith("@"))
      .map((word) => word.slice(1).trim());

    if (potentialMentions.length > 0) {
      const mentionedUsers = await User.find({
        username: { $in: potentialMentions },
      }).select("_id");

      mentions = mentionedUsers.map((u) => u._id);
    }

    const newComment = await Comment.create({
      author: user._id,
      content: content.trim(),
      post: post._id,
      mentions,
      parentComment: null,
      rootComment: null,
    });

    post.comments.push(newComment._id);
    await post.save()
    
    const populatedComment = await Comment.findById(newComment._id)
      .populate("author", "username avatar _id")
      .lean();

    return res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment,
    });

  } catch (error) {
    console.error("Error creating root comment:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default createRootComment;
