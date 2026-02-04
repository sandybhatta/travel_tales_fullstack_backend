import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
        type: String, 
        enum: [
            "like_post", 
            "like_trip", 
            "comment_post", 
            "follow", 
            "trip_invite", 
            "reply_comment", 
            "like_comment",
            "tagged_in_post",
            "mention_in_caption",
            "mention_in_comment",
            "new_post_from_following",
            "new_trip_from_following"
        ], 
        required: true 
    },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    relatedTrip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    relatedComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    message: { type: String },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
