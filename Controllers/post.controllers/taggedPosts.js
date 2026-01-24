import Post from "../../models/Post.js";

const taggedPosts = async (req, res) => {
    try {
        const user = req.user;
        const posts = await Post.find({
            taggedUsers: user._id
        }).populate([
            {
                path: "author",
                select: "name username avatar",
            },
            {
                path: "taggedUsers",
                select: "name username avatar"
            },
            {
                path: "likes",
                select: "_id",
            },
            {
                path: "comments",
                options: { limit: 2 },
                populate: { path: "author", select: "name username avatar" }
            }
        ]).sort({ createdAt: -1 });

        if (posts.length === 0) {
            return res.status(200).json({ message: "No posts found where you are tagged", posts: [] });
        }
        return res.status(200).json({ posts });
    } catch (error) {
        console.error("Error in taggedPosts:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export default taggedPosts;
