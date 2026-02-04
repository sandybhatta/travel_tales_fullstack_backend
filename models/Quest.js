import mongoose from "mongoose";

const questSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["daily", "weekly", "special", "onboarding"],
      required: true,
    },
    xpReward: {
      type: Number,
      required: true,
      default: 10,
    },
    badgeReward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
    },
    criteria: {
      action: {
        type: String,
        enum: ["create_post", "like_post", "create_trip", "comment", "login", "share_trip"],
        required: true,
      },
      count: {
        type: Number,
        default: 1,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // For limited time quests
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Instance method to check if a user action satisfies the quest
questSchema.methods.checkProgress = function (actionType, currentCount) {
  if (this.criteria.action !== actionType) return false;
  return currentCount >= this.criteria.count;
};

const Quest = mongoose.model("Quest", questSchema);

export default Quest;
