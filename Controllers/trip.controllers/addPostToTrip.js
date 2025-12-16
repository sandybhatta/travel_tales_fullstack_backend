
import Post from "../../models/Post.js";
import Trip from "../../models/Trip.js";

const addPostToTrip = async (req, res) => {
 

  try {
    const { tripId } = req.params;
    const { posts } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ message: "Posts array is required" });
    }

    const trip = await Trip.findById(tripId)
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!trip.canPost(req.user)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const existingPostIds = new Set(
      trip.posts.map(p => p.post.toString())
    );

    const newTripPosts = [];
    const postIdsToUpdate = [];

    for (const post of posts) {
      if (!post._id) continue;

      if (!existingPostIds.has(post._id.toString())) {
        newTripPosts.push({
          post: post._id,
          dayNumber: post.dayNumber ?? null,
          isHighlighted: !!post.isHighlighted,
          highlightedBy: post.isHighlighted ? userId : null,
        });

        postIdsToUpdate.push(post._id);
      }
    }

    if (postIdsToUpdate.length) {
      await Post.updateMany(
        { _id: { $in: postIdsToUpdate } },
        { $set: { tripId } },
        
      );
    }

    trip.posts.push(...newTripPosts);
    await trip.save();

   

    return res.status(200).json({
      message: "Posts added successfully",
      trip,
    });

  } catch (err) {
    
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  } 
};

export default addPostToTrip;
