

import SearchHistory from "../../models/SearchHistory.js";

const history = async (req, res) => {
  try {
    const userId = req.user._id;

 
    const history = await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("query type createdAt ")
      .lean();

    res.status(200).json({
      success: true,
      history, 
    });
  } catch (error) {
    console.error("Error fetching search history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch search history",
    });
  }
};

export default history;
