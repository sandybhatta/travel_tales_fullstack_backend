import Post from "../../models/Post.js";
import Comment from "../../models/Comment.js";
import User from "../../models/User.js";
import { io, getReceiverSocketId } from "../../socket/socket.js";
import Notification from "../../models/Notification.js";

const replyOfComment = async (req, res) => {
  try {
    const user  = req.user;
    const { content } = req.body;
    const { postId, rootCommentId, parentCommentId } = req.params;

    
    const trimmedContent = content?.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      return res.status(400).json({ message: "Reply must contain content." });
    }
    if (trimmedContent.length > 1000) {
      return res.status(400).json({ message: "Maximum 1000 characters allowed." });
    }

    
    const post = await Post.findById(postId).populate("author", "privacy followers closeFriends");
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
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

    
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment || parentComment.isDeleted) {
      return res.status(400).json({ message: "Cannot reply to this comment." });
    }

    // Ensure parent comment belongs to the post
    if (parentComment.post.toString() !== post._id.toString()) {
      return res.status(400).json({ message: "Parent comment doesn't belong to this post." });
    }

    // Validate root comment
    const rootComment = await Comment.findById(rootCommentId).select("_id post");
    if (!rootComment || rootComment.post.toString() !== post._id.toString()) {
      return res.status(400).json({ message: "Invalid root comment for this post." });
    }

    // Extract @mentions
    const words = trimmedContent.split(" ");
    const potentialMentions = words
      .filter((word) => word.startsWith("@"))
      .map((word) => word.slice(1).trim());

    let mentions = [];
    if (potentialMentions.length > 0) {
      const mentionedUsers = await User.find({
        username: { $in: potentialMentions },
      }).select("_id");
      mentions = mentionedUsers.map((u) => u._id);
    }

    // Create reply
    const newReply = await Comment.create({
      post: post._id,
      author: user._id,
      content: trimmedContent,
      parentComment: parentComment._id,
      rootComment: rootComment._id,
      mentions,
    });

    // Notify Parent Comment Author
    if (parentComment.author.toString() !== user._id.toString()) {
      try {
        const notification = new Notification({
          recipient: parentComment.author,
          sender: user._id,
          type: "reply_comment",
          relatedPost: post._id,
          relatedComment: newReply._id,
          message: `${user.username} replied to your comment.`
        });
        await notification.save();

        const receiverSocketId = getReceiverSocketId(parentComment.author.toString());
        if (receiverSocketId) {
          await notification.populate("sender", "username profilePic");
          await notification.populate("relatedPost", "images"); 
          io.to(receiverSocketId).emit("newNotification", notification);
        }
      } catch (e) {
        console.error("Error sending reply notification:", e);
      }
    }

    return res.status(201).json({
      message: "Reply created successfully.",
      reply: newReply,
    });

  } catch (error) {
    console.error("Reply creation error:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export default replyOfComment;
