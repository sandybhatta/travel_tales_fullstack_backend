import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength: 3,
      index: true,
    },
    usernameChangedAt: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    resgistersAt: Date,
    pendingEmail: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      public_id: { type: String, trim: true },
      url: { type: String, trim: true, default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
    },
    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },

    //  Followers / Following
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
      },
    ],

    closeFriends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
      },
    ],
    // saved post for the user
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      }
    ],

    //  Roles (Admin, User, etc.)
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // =================================================================
    //  GAMIFICATION ENGINE (Matured & Advanced)
    // =================================================================
    
    // 1. XP & Leveling (Indexed for Leaderboards)
    xp: {
      type: Number,
      default: 0,
      index: true, 
    },
    level: {
      type: Number,
      default: 1,
      index: true,
    },

    // 2. Travel Passport (Visual Achievements)
    // Tracks countries visited via Posts/Trips
    passport: [
      {
        countryName: { type: String, required: true }, // e.g., "Japan"
        countryCode: { type: String }, // ISO Code e.g., "JP" (Optional but good for flags)
        visitedAt: { type: Date, default: Date.now },
        firstVisitPostId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" } // The post that triggered the stamp
      }
    ],

    // 3. Badges (The Trophy Case)
    // Replaces the old simple string array
    badges: [
      {
        badgeId: { type: mongoose.Schema.Types.ObjectId, ref: "Badge" },
        earnedAt: { type: Date, default: Date.now },
        isNewBadge: { type: Boolean, default: true } // For showing "New Badge!" UI notification
      }
    ],

    // 4. Quests & Challenges
    quests: [
      {
        questId: { type: mongoose.Schema.Types.ObjectId, ref: "Quest" },
        status: { type: String, enum: ["in_progress", "completed", "claimed"], default: "in_progress" },
        progress: { type: Number, default: 0 }, // e.g., 2/5 posts created
        assignedAt: { type: Date, default: Date.now },
        completedAt: Date
      }
    ],

    // =================================================================

    //  Last Login
    lastLogin: {
      type: Date,
    },

    //  Account settings
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Store a *hashed* token so the raw value never lives in DB
    emailVerifyToken: String,

    // Optional expiry (ISO date). TTL index removes stale docs automatically.
    emailVerifyTokenExpires: Date,

    isBanned: {
      type: Boolean,
      default: false,
    },

    isDeactivated: {
      type: Boolean,
      default: false,
    },
    deactivationReason: {
      type: String,

    },
    deactivatedDate: {
      type: Date
    },

    // for extra features 
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "followers", "private", "close_friends"],
        default: "public",
      },
      allowComments: {
        type: String,
        enum: ["everyone", "followers", "close_friends", "no_one"],
        default: "everyone",
      },
    },

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
      },
    ],

    interests: {
      type: [String],
      enum: [
        "adventure",
        "beach",
        "mountains",
        "history",
        "food",
        "wildlife",
        "culture",
        "luxury",
        "budget",
        "road_trip",
        "solo",
        "group",
        "trekking",
        "spiritual",
        "nature",
        "photography",
        "festivals",
        "architecture",
        "offbeat",
        "shopping",
      ],
      default: [],

    },

  },
  {
    timestamps: true,
  }
);

// indexing for frequent search
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if password is changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 64-char string
  this.emailVerifyToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  this.emailVerifyTokenExpires = Date.now() + 30 * 60 * 1000;

  return rawToken;
};


// =================================================================
//  GAMIFICATION INSTANCE METHODS
// =================================================================

/**
 * Adds XP to the user and checks for level up.
 * @param {number} amount - Amount of XP to add
 * @returns {object} - { leveledUp: boolean, newLevel: number }
 */
userSchema.methods.addXp = async function (amount) {
  this.xp += amount;
  
  // Simple Level Formula: Level = floor(sqrt(XP / 100))
  // Or linear/exponential: Level * 1000 XP needed
  // Let's use a standard RPG curve: Level N requires 100 * (N)^1.5 XP roughly
  
  // Current simple implementation: 
  // Level 1: 0-100
  // Level 2: 101-300
  // Level 3: 301-600
  // Formula: Threshold = Level * 100 + PreviousThreshold? 
  
  // Let's stick to a predictable threshold: Each level needs 200 * Level XP
  // No, let's keep it simple for MVP: Level = floor(xp / 500) + 1
  const calculatedLevel = Math.floor(this.xp / 500) + 1;
  
  let leveledUp = false;
  if (calculatedLevel > this.level) {
    this.level = calculatedLevel;
    leveledUp = true;
    // Potentially add a "Level Up" badge here automatically
  }
  
  await this.save();
  return { leveledUp, currentLevel: this.level, currentXp: this.xp };
};

/**
 * Stamps the user's passport if they haven't visited the country yet.
 * @param {string} countryName 
 * @param {string} postId 
 */
userSchema.methods.stampPassport = async function (countryName, postId) {
  // Check if already visited
  const alreadyVisited = this.passport.some(stamp => stamp.countryName.toLowerCase() === countryName.toLowerCase());
  
  if (!alreadyVisited) {
    this.passport.push({
      countryName,
      firstVisitPostId: postId,
      visitedAt: new Date()
    });
    // Award bonus XP for new country
    await this.addXp(100); 
    return true; // New stamp added
  }
  return false; // Already visited
};

/**
 * Unlocks a badge for the user.
 * @param {string} badgeId - The ObjectId of the badge
 */
userSchema.methods.unlockBadge = async function (badgeId) {
  const hasBadge = this.badges.some(b => b.badgeId.toString() === badgeId.toString());
  
  if (!hasBadge) {
    this.badges.push({
      badgeId,
      earnedAt: new Date(),
      isNew: true
    });
    await this.save();
    return true;
  }
  return false;
};

/**
 * Updates progress for a specific quest type.
 * @param {string} actionType - e.g., 'create_post', 'like_post'
 */
userSchema.methods.updateQuestProgress = async function (actionType) {
  // Find active quests matching this action
  // We need to populate quests to check criteria, but inside methods usually we rely on what's loaded.
  // Best practice: Store criteria snapshot in userQuest or fetch Quests. 
  // For simplicity, we assume the caller handles the logic or we iterate simple counters.
  
  // This is complex because we need the Quest definition. 
  // We will leave this for the Controller/Service layer to handle:
  // 1. Fetch User
  // 2. Fetch User's Active Quests
  // 3. Match ActionType
  // 4. Update Progress
};

const User = mongoose.model("User", userSchema);

export default User;
