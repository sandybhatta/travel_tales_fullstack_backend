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
      minLength:3,
      index:true,
    },
    usernameChangedAt:{
      type:Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index:true,
    },
    resgistersAt:Date,
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
      type: String,
      public_id: { type: String, trim: true },
      url: { type: String, trim: true },
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
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
        default:[]
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default:[]
      },
    ],

    closeFriends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default:[]
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

    //  Badges for Gamification
    badges: [
      {
        type: String, // e.g. "city_hopper", "mountain_master"
      },
    ],

    //  XP & Level System
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },

  
   

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
    deactivationReason:{
      type:String,
      
    },
    deactivatedDate:{
      type:Date
    },


    // for extra features 

    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "followers", "private","close_friends"],
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
        default:[]
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
const User = mongoose.model("User", userSchema);

export default User;
