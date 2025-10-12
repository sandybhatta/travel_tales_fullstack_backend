import SearchHistory from "../models/SearchHistory.js"
async function saveSearchHistory(userId, query, type = "user") {
    if (!userId || !query) return;
  
    try {
      // normalize query to trimmed string
      const normalized = String(query).trim();
  
      // If already exists, update createdAt to now
      const existing = await SearchHistory.findOne({ user: userId, query: normalized, type });
      if (existing) {
        existing.createdAt = new Date();
        await existing.save();
        return;
      }
  
      await SearchHistory.create({ user: userId, query: normalized, type });
  
      // Keep only the latest 20 entries
      const total = await SearchHistory.countDocuments({ user: userId });
      if (total > 20) {
        const toRemove = await SearchHistory.find({ user: userId })
          .sort({ createdAt: 1 })
          .limit(total - 20)
          .select("_id")
          .lean();
        const ids = toRemove.map((d) => d._id);
        if (ids.length) await SearchHistory.deleteMany({ _id: { $in: ids } });
      }
    } catch (err) {
     
      console.error("saveSearchHistory error:", err);
    }
  }