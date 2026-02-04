import Trip from "../../models/Trip.js";
import { io, getReceiverSocketId } from "../../socket/socket.js";
import Notification from "../../models/Notification.js";

const toggleLike = async (req, res) => {
  try {
    const { tripId } = req.params;
    const user = req.user;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const isLiked = trip.likes?.some(id => id.toString() === user._id.toString());

    if (isLiked) {
      trip.likes = trip.likes.filter(id => id.toString() !== user._id.toString());
    } else {
      trip.likes.push(user._id);

      // Notification Logic
      if (trip.user.toString() !== user._id.toString()) {
          try {
            const notification = new Notification({
                recipient: trip.user,
                sender: user._id,
                type: "like_trip",
                relatedTrip: trip._id,
                message: `${user.username} liked your trip.`
            });
            await notification.save();

            const receiverSocketId = getReceiverSocketId(trip.user.toString());
            if (receiverSocketId) {
                await notification.populate("sender", "username profilePic");
                await notification.populate("relatedTrip", "coverPhoto"); 
                io.to(receiverSocketId).emit("newNotification", notification);
            }
          } catch (e) { console.error(e); }
      }
    }

    await trip.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: trip.likes.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default toggleLike;
