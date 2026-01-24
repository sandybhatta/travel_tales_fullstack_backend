import Comment from "../../models/Comment.js";

const mentionedComments = async (req, res) => {
    try {
        const user = req.user;
        const comments = await Comment.find({
            mentions: user._id
        })
        .populate([
            {
                path: "author",
                select: "name username avatar"
            },
            {
                path: "post",
                select: "media caption _id" // Select basic post info to show context
            },
            {
                path: "parentComment",
                populate: { path: "author", select: "name username" } // If it's a reply, show who they replied to
            }
        ])
        .sort({ createdAt: -1 });

        if (comments.length === 0) {
            return res.status(200).json({ message: "No comments found where you are mentioned", comments: [] });
        }

        return res.status(200).json({ comments });

    } catch (error) {
        console.error("Error in mentionedComments:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default mentionedComments;
