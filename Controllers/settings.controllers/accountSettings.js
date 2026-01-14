import User from "../../models/User.js";
import deleteUser from "../user.controllers/deleteUser.js";

// PUT /settings/account
export const updateAccountStatus = async (req, res) => {
  const user = req.user;
  const { action, password } = req.body;

  try {
    if (action === "deactivate") {
        if (!password) {
             return res.status(400).json({ message: "Password required for deactivation" });
        }
        
        // Need to explicitly select password as it's excluded by default
        const userWithPassword = await User.findById(user._id).select("+password");
        if (!userWithPassword) return res.status(404).json({ message: "User not found" });

        const isMatch = await userWithPassword.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

      user.isDeactivated = true;
      user.deactivatedDate = new Date();
      user.deactivationReason = req.body.reason || "User preference";
      await user.save();
      
       res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({ message: "Account deactivated successfully." });
    }
    
    return res.status(400).json({ message: "Invalid action. Use 'deactivate'." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteAccount = deleteUser;
