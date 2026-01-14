import User from "../../models/User.js";

export const updatePrivacy = async (req, res) => {
  const user = req.user;
  const { profileVisibility, allowComments } = req.body;

  try {
    const validVisibility = ["public", "followers", "private", "close_friends"];
    const validComments = ["everyone", "followers", "close_friends", "no_one"];

    // Handle profileVisibility mapping if user sends "friends-only"
    let newVisibility = profileVisibility;
    if (newVisibility === "friends-only") newVisibility = "followers"; 

    if (newVisibility && !validVisibility.includes(newVisibility)) {
      return res.status(400).json({ message: "Invalid profile visibility option" });
    }

    if (allowComments && !validComments.includes(allowComments)) {
      return res.status(400).json({ message: "Invalid comment permission option" });
    }

    // Update fields if provided
    if (newVisibility) user.privacy.profileVisibility = newVisibility;
    if (allowComments) user.privacy.allowComments = allowComments;

    await user.save();

    return res.status(200).json({
      message: "Privacy settings updated",
      privacy: user.privacy,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
