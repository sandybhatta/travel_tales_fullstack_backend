import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tags: [
      {
        type: String,
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
        trim: true,
        lowercase: true,
      },
    ],

    isArchived: { type: Boolean, default: false },



    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    coverPhoto: {
        public_id: { type: String, trim: true },
        url: { type: String, trim: true },
      },
      
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    destinations: [
      {
        city: String,
        state: String,
        country: String,
        
      },
    ],

    travelBudget: { type: Number, default: 0 },

    expenses: [
      {
        title: {
          type:String,
          required:true
        },
        amount: {
          type:Number,
          required:true
        },
        spentBy: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User" 
        },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    notes: [
      {
        body: { 
          type: String,
           required: true, 
           trim: true 
          },
        createdAt: { 
          type: Date, 
          default: Date.now 
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", 
        },
        isPinned: { type: Boolean, default: false }, // helpful for highlighting
      }
    ],

    todoList: [
      {
        task: { 
          type: String,
          required: true,
          trim: true 
        },
        done: {
          type: Boolean,
          default: false 
        },
        dueDate: Date,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      }
    ],

    posts: [
    {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        dayNumber: {
          type: Number, // e.g., Day 1, Day 2 of the trip
          min: 1,
        },
        
        isHighlighted: {
          type: Boolean,
          default: false,
        },
        highlightedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", 
          default: null,
        },
    }
],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isCompleted: { type: Boolean, default: false },

    visibility: {
        type: String,
        enum: ["public", "followers", "close_friends","private"],
        default: "public",
      },
    invitedFriends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    acceptedFriends: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          acceptedAt: { type: Date, default: Date.now },
        }
      ]
      
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//to get the duration of the trip in days
tripSchema.virtual("duration").get(function () {
    if (!this.startDate || !this.endDate) return 0;
  
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
  
    const durationMs = end - start; // Difference in milliseconds
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) +1; // Convert to days
  
    return durationDays;
  });

  

// what is the trip status
tripSchema.virtual("tripStatus").get(function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  
    if (end < today) return "past";
    if (start > today) return "upcoming";
    return "ongoing";
  });
  

//   post count
tripSchema.virtual("postCount").get(function () {
    return this.posts?.length || 0;
  });
  
// destination count
tripSchema.virtual("destinationCount").get(function () {
    return this.destinations?.length || 0;
  });

// is the trip solo or collaborative
tripSchema.virtual("isCollaborative").get(function () {
    return this.acceptedFriends.length > 0;
  });
 
  


//    now instance methods







// for adding in todo list
tripSchema.methods.addTodo = function (userId, task, assignedTo, dueDate) {
  this.todoList.push({ task, createdBy: userId, assignedTo, dueDate });
  return this.save();
};


//toggling the todo list

tripSchema.methods.toggleTodo = function (todoId) {
  const todo = this.todoList.id(todoId);
  if (todo) todo.done = !todo.done;
  return this.save();
};




// Helper to safely get string ID from populated or unpopulated field
const getUserId = (field) => {
  if (!field) return null;
  return field._id ? field._id.toString() : field.toString();
};

// is the trip owned by the user
tripSchema.methods.isOwnedBy = function (userId) {
    if (!userId) return false;
    const ownerId = getUserId(this.user);
    return ownerId === userId.toString();
  };


// is the frined invited to the trip
tripSchema.methods.isFriendInvited = function (userId) {
    return this.invitedFriends.some(
      (friendId) => getUserId(friendId) === userId.toString()
    );
  };
// is the friend accepted the trip invitation
tripSchema.methods.isFriendAccepted = function (userId) {
    return this.acceptedFriends?.some(
      (friend) => getUserId(friend.user) === userId.toString()
    );
  }; 
  
  

// who can view 
tripSchema.methods.canView = async function (user) {
    // If public, anyone can view
    if (this.visibility === "public") return true;
  
    // If no user is logged in
    if (!user) return false;

    const userId = user._id.toString();
    const ownerId = getUserId(this.user);
  
    // If user is the trip owner
    if (ownerId === userId) return true;
    
    // If user is a collaborator
    const isCollaborator = this.acceptedFriends?.some(
      (friend) => getUserId(friend.user) === userId
    );
    if (isCollaborator) return true;
  
    // Fetch the owner's followers and closeFriends
    // We fetch using ownerId to be safe regardless of population state
    const TripOwner = await mongoose.model("User").findById(ownerId)
      .select("followers closeFriends")
      .lean();

    if (!TripOwner) return false;

    if (this.visibility === "followers") {
      return TripOwner.followers?.some(
        (followerId) => followerId.toString() === userId
      );
    }
  
    if (this.visibility === "close_friends") {
      return TripOwner.closeFriends?.some(
        (friendId) => friendId.toString() === userId
      );
    }
  
    return false; // fallback
  };



// who can post in the trip
tripSchema.methods.canPost = function (user) {
    if (!user) return false;
  
    const userId = user._id.toString();
    const ownerId = getUserId(this.user);
  
    // Check if the user is the trip owner
    if (userId === ownerId) return true;
  
    // Check if user is in accepted friends
    return this.acceptedFriends.some(
      friend => getUserId(friend.user) === userId
    );
  };
  

// to add a friend in invited
tripSchema.methods.inviteFriend = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const isAlreadyInvited = this.invitedFriends.some(
      (id) => id.toString() === userId.toString()
    );
    const isAlreadyAccepted = this.acceptedFriends.some(
      (id) => id.toString() === userId.toString()
    );
  
    if (!isAlreadyInvited && !isAlreadyAccepted) {
      this.invitedFriends.push(userId);
      await this.save();
    }
    console.log("Monkey d luffy")
  
  
  };

  // to accept a trip invitation and remove from invitedFriends
  tripSchema.methods.acceptInvitation = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const wasInvited = this.invitedFriends.some(
      (id) => id.toString() === userId.toString()
    );
    const alreadyAccepted = this.acceptedFriends.some(
      (id) => id.user.toString() === userId.toString()
    );
  
    if (wasInvited && !alreadyAccepted) {
      // Remove from invitedFriends
      this.invitedFriends = this.invitedFriends.filter(
        (id) => id.toString() !== userId.toString()
      );
  
      // Add to acceptedFriends
      this.acceptedFriends.push({
        user: userId,
        acceptedAt: new Date()
      });
  
      await this.save();
    }
  
    return this;
  };
  

  // now static nmethods

//   find trips by user
tripSchema.statics.getUserTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    return this.find({ user: userId }).sort({ createdAt: -1 });
  };


  // getting visisble trips for user
  tripSchema.statics.getVisibleTripsForUser = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const User = mongoose.model("User");
  
    // Fetch current user to get their following list
    const currentUser = await User.findById(userId)
      .select("following")
      .lean();
  
    const followingIds = currentUser?.following?.map((f) => f.toString()) || [];
  
    // Fetch all users who added this user to their closeFriends
    const closeFriendsOf = await User.find({
      closeFriends: userId,
    }).select("_id").lean();
  
    const closeFriendIds = closeFriendsOf.map(u => u._id.toString());
  
    return this.find({
      $or: [
        { user: userId }, // own trips
        { visibility: "public" },
        { visibility: "followers", user: { $in: followingIds } },
        { visibility: "close_friends", user: { $in: closeFriendIds } },
      ],
    }).sort({ createdAt: -1 });
  };
 
  

//   static method for getting collaborated trips
tripSchema.statics.getCollaboratedTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    return this.find({
      acceptedFriends: userId,
    }).sort({ createdAt: -1 });
  };


// get a specific trip with post details
tripSchema.statics.getTripWithPosts = async function (tripId) {
    if (!tripId) throw new Error("Trip ID is required");
  
    return this.findById(tripId)
      .select("-__v") // Optional: remove unwanted internal fields
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } }, // Sort posts newest first
        populate: [
          {
            path: "author",
            select: "name username avatar", // Show post author info
          },
          {
            path: "comments",
            select: "_id", // To show comment count if needed
          },
        ],
      })
      .lean(); // Return plain JS object (faster, lightweight)
  };

// get users who have upcoming trip
tripSchema.statics.getUpcomingTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const today = new Date();
  
    return this.find({
      user: userId,
      startDate: { $gt: today },
    }).sort({ startDate: 1 }).lean();
  };
// users who is having ongoing trip
tripSchema.statics.getOngoingTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const today = new Date();
  
    return this.find({
      user: userId,
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).sort({ startDate: 1 }).lean();
  };
  
  //users who have completed their trips
tripSchema.statics.getPastTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const today = new Date();
  
    return this.find({
      user: userId,
      endDate: { $lt: today },
    }).sort({ endDate: -1 }).lean();
  };

  

const Trip= mongoose.model("Trip", tripSchema);
export default Trip;