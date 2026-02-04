import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // Base icon (default level 1)
    iconUrl: {
      type: String,
      required: true,
      default: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", 
    },
    
    // Dynamic Tiers (Video Game Style Progression)
    // e.g., Bronze -> Silver -> Gold -> Platinum -> Diamond
    tiers: [
      {
        tierName: { type: String, required: true }, // e.g., "Gold"
        iconUrl: { type: String, required: true },
        threshold: { type: Number, required: true }, // e.g., 50 posts (Overrides base threshold)
        xpBonus: { type: Number, default: 0 }, // Additional XP for reaching this tier
        effects: { type: String } // e.g., "Shiny Border", "Particle Effect" (Frontend visual cue)
      }
    ],
    category: {
      type: String,
      enum: ["travel", "social", "content", "special_event"],
      required: true,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common",
    },
    criteria: {
      type: {
        type: String,
        enum: ["country_count", "post_count", "trip_count", "xp_threshold", "manual"],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
      // For specific criteria like "Visit Japan"
      targetValue: {
        type: String, 
      }
    },
    xpBonus: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to find badges by category
badgeSchema.statics.findByCategory = function (category) {
  return this.find({ category });
};

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
