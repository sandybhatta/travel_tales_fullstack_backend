import Trip from "../../models/Trip.js";

const getLikedTrips = async (req, res) => {
  const user = req.user;
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 12;

  try {
    const trips = await Trip.find({ likes: user._id })
      .sort({ createdAt: -1 }) // or updated at?
      .skip(skip)
      .limit(limit)
      .populate("user", "username name avatar");

    return res.status(200).json({
      count: trips.length,
      trips,
      hasMore: trips.length === limit,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getLikedTrips;
