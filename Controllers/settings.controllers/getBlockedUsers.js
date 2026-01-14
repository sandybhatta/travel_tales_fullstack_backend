import User from "../../models/User.js";

const getBlockedUsers = async (req, res) => {
  const user = req.user;
  try {
    const currentUser = await User.findById(user._id).populate("blockedUsers", "name username avatar");
    return res.status(200).json({ blockedUsers: currentUser.blockedUsers });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export default getBlockedUsers;
