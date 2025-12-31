import Post from "../../models/Post.js";
import Trip from "../../models/Trip.js";


const fixTripPostLinks = async (req, res) => {
  try {
    const user = req.user
    const posts = await Post.find({ tripId: { $ne: null }, author: user._id})
      .select("_id tripId");

    let fixed = 0;
    let skipped = 0;
    let missingTrips = 0;

    for (const post of posts) {
      const trip = await Trip.findById(post.tripId);

      if (!trip) {
        missingTrips++;
        continue;
      }

      const alreadyLinked = trip.posts.some(
        (p) => p.post.toString() === post._id.toString()
      );

      if (alreadyLinked) {
        skipped++;
        continue;
      }

      trip.posts.push({
        post: post._id,
        dayNumber: 1,
        isHighlighted: false,
        highlightedBy: null,
      });

      await trip.save();
      fixed++;
    }

    res.status(200).json({
      message: "Trip ↔ Post sync completed",
      stats: {
        totalChecked: posts.length,
        fixed,
        skipped,
        missingTrips,
      },
    });
  } catch (err) {
    console.error("Fix failed:", err);
    res.status(500).json({ message: "Repair job failed" });
  }
};

export default fixTripPostLinks;
