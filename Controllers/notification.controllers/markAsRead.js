import Notification from "../../models/Notification.js";

export const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error in markAsRead:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
