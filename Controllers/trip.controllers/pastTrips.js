import Trip from "../../models/Trip.js";

const pastTrips = async (req, res) => {
  try {
    const user = req.user;

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    // only trips that ends before today 
    const trips = await Trip.find({
      user: user._id,
      endDate:{$lt:today}
    }).populate(
      [
        {
          path:"user",
          select:"name username avatar"
      },{
        path:"acceptedFriends.user",
        select:"name username avatar"
      }
      ]
      ).sort({ startDate: 1 }) 

    return res.status(200).json({
      count: trips.length,
      pastTrips: trips
    });
  } catch (error) {
  
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default pastTrips;