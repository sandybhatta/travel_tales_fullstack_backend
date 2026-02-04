import Trip from "../../models/Trip.js";
import { io, getReceiverSocketId } from "../../socket/socket.js";
import Notification from "../../models/Notification.js";

const inviteToTrip = async (req, res) => {
  const { tripId } = req.params;
  const user = req.user;
  const { invitee } = req.body;

  try {
    // 🔒 Basic validation
    if (!tripId || !invitee) {
      return res.status(400).json({ message: "Trip ID and invitee are required." });
    }

    //  Fetch trip
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }
    

    //  Check permissions
    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "You are not authorized to invite users to this trip." });
    }

    // trip is completed or archived
    if(trip.isCompleted){
        return res.status(400).json({message:"The trip is completed , now invite can't be done"})
    }
    if(trip.isArchived){
        return res.status(400).json({message:"The trip is soft deleted, restore it to invite"})
    }

    // Already accepted
    const isAlreadyAccepted = trip.isFriendAccepted(invitee);
    if (isAlreadyAccepted) {
      return res.status(200).json({ message: "User already a collaborator." });
    }

    //  Already invited
    const isAlreadyInvited = trip.isFriendInvited(invitee);
    if (isAlreadyInvited) {
      return res.status(200).json({ message: "User already invited." });
    }

    trip.invitedFriends.push(invitee);
    await trip.save()
    
    // Notification Logic
    try {
        const notification = new Notification({
            recipient: invitee,
            sender: user._id,
            type: "trip_invite",
            relatedTrip: trip._id,
            message: `${user.username} invited you to join '${trip.title}'`
        });
        await notification.save();

        const receiverSocketId = getReceiverSocketId(invitee.toString());
        if (receiverSocketId) {
            await notification.populate("sender", "username profilePic");
            await notification.populate("relatedTrip", "coverPhoto");
            io.to(receiverSocketId).emit("newNotification", notification);
        }
    } catch (e) { console.error(e); }




    return res.status(200).json({
      message: "User invited successfully.",
      InvitationSent: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default inviteToTrip;
