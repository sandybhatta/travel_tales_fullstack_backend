import Notification from "../../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate("sender", "username profilePic")
            .populate("relatedPost", "images")
            .populate("relatedTrip", "tripName coverImage")
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error in getNotifications:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
