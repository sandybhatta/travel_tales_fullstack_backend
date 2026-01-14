import User from "../../models/User.js";

const unblockUser = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  try {
    if (!user.blockedUsers.includes(id)) {
        return res.status(400).json({ message: "User is not blocked" });
    }

    user.blockedUsers = user.blockedUsers.filter(uid => uid.toString() !== id);
    await user.save();

    return res.status(200).json({ message: "User unblocked" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export default unblockUser;
