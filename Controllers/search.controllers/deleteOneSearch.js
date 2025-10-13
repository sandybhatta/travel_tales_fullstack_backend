import mongoose from "mongoose";
import SearchHistory from "../../models/SearchHistory.js";

const deleteOneSearch = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; 


    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing search history ID",
      });
    }


    const history = await SearchHistory.findById(id);
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Search history item not found",
      });
    }


    if (history.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own search history",
      });
    }


    await history.deleteOne();


    return res.status(200).json({
      success: true,
      message: "Search history item deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting search history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export default deleteOneSearch;
