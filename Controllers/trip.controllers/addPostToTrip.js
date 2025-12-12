import Trip from "../../models/Trip.js";

const addPostToTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    // , , dayNumber, isHighlighted

    const { posts  } = req.body;
    const userId = req.user._id;


   

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (!trip.canPost(req.user)) {
      return res.status(403).json({ message: "Not allowed to add post to this trip" });
    }

 
    
    let tripPosts = []

    for( let post of posts ){
      let alreadyExists = false;

      if (!post._id) {
        return res.status(400).json({ error: "postId is required" });
      }
      alreadyExists = trip.posts?.some(p => p.post.toString() === post._id.toString());
      if(!alreadyExists){
        
        const postObj={
          ...post,
          highlightedBy:post.isHighlighted ? userId : null,
        }
        tripPosts.push(postObj)
      }
    }


     

    
 
    trip.posts = [...trip.posts, ...tripPosts]

    await trip.save();

    return res.status(200).json({
      message: "Post added to trip successfully",
      trip,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


export default addPostToTrip