
import SearchHistory from "../../models/SearchHistory.js";

const deleteAllSearch = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await SearchHistory.deleteMany({ user: userId });

    return res.status(200).json({
      success: true,
      message: "All search history cleared successfully",
      clearedCount: result.deletedCount,
    });

  } catch (error) {
    console.error("Error clearing search history:", error);
    res.status(500).json({
      success: false,
      message: "Server error clearing search history",
    });
  }
};

export default deleteAllSearch;
