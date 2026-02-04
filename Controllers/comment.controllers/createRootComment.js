import Post from "../../models/Post.js";
import Comment from "../../models/Comment.js";
import User from "../../models/User.js";
import { createNotification } from "../../utils/notificationHandler.js";

const createRootComment = async (req, res) => {
  try {
    const  user  = req.user;
    const { postId } = req.params;
    const { content, mentions: rawMentions } = req.body;


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
    if (Array.isArray(rawMentions) && rawMentions.length > 0) {
        // Validate that provided IDs are real users to prevent bad data
        const validUsers = await User.find({ _id: { $in: rawMentions } }).select("_id");
        mentions = validUsers.map(u => u._id);
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

    // Create Notification for Post Author
    if (post.author._id.toString() !== user._id.toString()) {
      await createNotification({
          recipient: post.author._id,
          sender: user._id,
          type: "comment_post",
          relatedPost: post._id,
          relatedComment: newComment._id,
          message: `${user.username} commented on your post.`
      });
    }

    // Handle Mentions Notifications
    if (mentions.length > 0) {
       mentions.forEach(async (mentionedUserId) => {
           if (mentionedUserId.toString() !== user._id.toString()) {
                await createNotification({
                    recipient: mentionedUserId,
                    sender: user._id,
                    type: "mention_in_comment",
                    relatedPost: post._id,
                    relatedComment: newComment._id,
                    message: `${user.username} mentioned you in a comment.`
                });
           }
       });
    }

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
