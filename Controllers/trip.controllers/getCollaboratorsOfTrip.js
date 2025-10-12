import Trip from "../../models/Trip.js";

const getCollaboratorsOfTrip = async (req, res) => {
  const { tripId } = req.params;
  const user = req.user;

  try {
    if (!tripId) {
      return res.status(400).json({ success: false, message: "Trip ID is required" });
    }

    const trip = await Trip.findById(tripId)
      .select("acceptedFriends user title")
      .populate([{
        path: "acceptedFriends.user",
        select: "name username avatar",
      },
      {
        path:"user",
        select:"name username avatar"
      }
    
    ]);

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const isOwner = user ? trip.isOwnedBy(user._id) : false;

    res.status(200).json({
      success: true,
      owner:trip.user,
      title:trip.title,
      collaborators: trip.acceptedFriends,
      collaboratorsCount: trip.acceptedFriends?.length || 0,
      isOwner,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getCollaboratorsOfTrip;
