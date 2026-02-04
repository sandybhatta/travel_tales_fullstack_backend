import Notification from "../models/Notification.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

/**
 * Creates a notification, manages the 30-notification limit per user, and emits a socket event.
 * @param {Object} params - The notification parameters.
 * @param {string} params.recipient - The ID of the user receiving the notification.
 * @param {string} params.sender - The ID of the user triggering the notification.
 * @param {string} params.type - The type of notification.
 * @param {string} [params.relatedPost] - The ID of the related post.
 * @param {string} [params.relatedTrip] - The ID of the related trip.
 * @param {string} [params.relatedComment] - The ID of the related comment.
 * @param {string} [params.message] - A custom message.
 */
export const createNotification = async ({
    recipient,
    sender,
    type,
    relatedPost = null,
    relatedTrip = null,
    relatedComment = null,
    message = ""
}) => {
    try {
        // Prevent sending notification to self (unless it's a test or specific requirement, but usually we don't notify self)
        if (recipient.toString() === sender.toString()) return;

        // 1. Create the notification
        const notification = new Notification({
            recipient,
            sender,
            type,
            relatedPost,
            relatedTrip,
            relatedComment,
            message
        });
        await notification.save();

        // 2. Enforce 30 notification limit (Delete oldest if > 30)
        const count = await Notification.countDocuments({ recipient });
        if (count > 30) {
            const notificationsToDelete = await Notification.find({ recipient })
                .sort({ createdAt: 1 }) // Oldest first
                .limit(count - 30)
                .select("_id");
            
            if (notificationsToDelete.length > 0) {
                const idsToDelete = notificationsToDelete.map(n => n._id);
                await Notification.deleteMany({ _id: { $in: idsToDelete } });
            }
        }

        // 3. Populate for socket emission
        // We populate similar to getNotifications to ensure frontend consistency
        const populatedNotification = await Notification.findById(notification._id)
            .populate("sender", "username avatar")
            .populate("relatedPost", "media")
            .populate("relatedTrip", "title coverPhoto");

        // 4. Emit socket event
        const receiverSocketId = getReceiverSocketId(recipient.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newNotification", populatedNotification);
        }

        return notification;
    } catch (error) {
        console.error("Error in createNotification:", error);
    }
};
