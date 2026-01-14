import User from "../../models/User.js";

const blockUser = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  try {
    if (user._id.toString() === id) {
        return res.status(400).json({ message: "You cannot block yourself" });
    }

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: "User not found" });

    if (user.blockedUsers.includes(id)) {
        return res.status(400).json({ message: "User already blocked" });
    }

    user.blockedUsers.push(id);

    // Unfollow logic
    user.following = user.following.filter(uid => uid.toString() !== id);
    target.followers = target.followers.filter(uid => uid.toString() !== user._id.toString());
    
    target.following = target.following.filter(uid => uid.toString() !== user._id.toString());
    user.followers = user.followers.filter(uid => uid.toString() !== id);

    user.closeFriends = user.closeFriends.filter(uid => uid.toString() !== id);
    target.closeFriends = target.closeFriends.filter(uid => uid.toString() !== user._id.toString());

    await user.save();
    await target.save();

    return res.status(200).json({ message: `Blocked ${target.username}` });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export default blockUser;
