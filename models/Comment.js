import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    rootComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);




// is the comment liked by the user
commentSchema.methods.isLikedBy = function (userId) {
    if (!userId) return false;
    return this.likes.some(
      (id) => id.toString() === userId.toString()
    );
  };


  
  //is reply virtual method to send in response

//   Instance Method: For internal logic



// comment soft delete , marking the isdelete true and content to [deleted]

commentSchema.methods.softDelete = async function () {
    // Mark the comment as deleted
    this.isDeleted = true;
  
    // Optionally, also remove sensitive data like content
    this.content = "[deleted]";
  
    await this.save();

    // Recursively soft-delete children
    const children = await this.model("Comment").find({ parentComment: this._id });
    for (const child of children) {
        await child.softDelete();
    }
  
    return this; // return the updated comment if needed
  };

 
 
  
// Add index for performance
commentSchema.index({ post: 1 });
commentSchema.index({ parentComment: 1 });

export default mongoose.model("Comment", commentSchema);
