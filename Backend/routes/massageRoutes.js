import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Import models (you'll need to adjust the path based on your project structure)
// Assuming models are in a separate models folder

// Authentication middleware (should be applied before using these routes)
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Authorization header missing or invalid" });
    }
    const token = parts[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Apply authentication middleware to all routes in this router
router.use(authenticate);

/**
 * GET /messages/unread/count
 * Get unread message counts for the authenticated user
 */
router.get("/unread/count", async (req, res) => {
  try {
    const userId = req.userId;
    
    const unreadCounts = await Message.aggregate([
      { 
        $match: { 
          to: new mongoose.Types.ObjectId(userId), 
          readAt: null 
        } 
      },
      {
        $group: {
          _id: "$from",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalUnread = unreadCounts.reduce((sum, item) => sum + item.count, 0);
    
    return res.json({ 
      totalUnread,
      unreadByUser: unreadCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (err) {
    console.error("Error getting unread count:", err);
    return res.status(500).json({ message: "Failed to get unread count" });
  }
});

/**
 * GET /messages/:peerId
 * Get message history with a specific user
 * Query params: limit (default 50, max 200), before (ISO date string for pagination)
 */
router.get("/:peerId", async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;

    // Validate peerId
    if (!mongoose.Types.ObjectId.isValid(peer)) {
      return res.status(400).json({ message: "Invalid peer ID" });
    }

    // Check if users are blocked
    const blocked = await BlockedUser.findOne({
      $or: [
        { blocker: me, blocked: peer },
        { blocker: peer, blocked: me }
      ]
    });
    
    if (blocked) {
      return res.status(403).json({ message: "Cannot access messages with blocked user" });
    }

    // Parse query parameters
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const before = req.query.before ? new Date(req.query.before) : null;

    // Build query
    const query = {
      $or: [
        { from: me, to: peer },
        { from: peer, to: me },
      ],
    };
    if (before) query.createdAt = { $lt: before };

    // Fetch messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .lean();

    // Return messages in chronological order (oldest first)
    return res.json(messages.reverse());
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
});

/**
 * POST /messages/:peerId/read
 * Mark all messages from a specific user as read
 */
router.post("/:peerId/read", async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;

    // Validate peerId
    if (!mongoose.Types.ObjectId.isValid(peer)) {
      return res.status(400).json({ message: "Invalid peer ID" });
    }
    
    const result = await Message.updateMany(
      { from: peer, to: me, readAt: null },
      { $set: { readAt: new Date() } }
    );
    
    return res.json({ 
      success: true,
      updated: result.modifiedCount,
      message: `Marked ${result.modifiedCount} messages as read`
    });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    return res.status(500).json({ message: "Failed to mark messages as read" });
  }
});

/**
 * POST /messages/read
 * Mark specific messages as read by message IDs
 */
router.post("/read", async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.userId;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "Message IDs array is required" });
    }

    // Validate message IDs
    const invalidIds = messageIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: "Invalid message IDs provided" });
    }

    const result = await Message.updateMany(
      { 
        _id: { $in: messageIds },
        to: userId,
        readAt: null 
      },
      { $set: { readAt: new Date() } }
    );

    return res.json({ 
      success: true,
      updated: result.modifiedCount,
      message: `Marked ${result.modifiedCount} messages as read`
    });
  } catch (err) {
    console.error("Error marking specific messages as read:", err);
    return res.status(500).json({ message: "Failed to mark messages as read" });
  }
});

/**
 * DELETE /messages/:peerId
 * Delete entire chat history with a specific user
 */
router.delete("/:peerId", async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;

    // Validate peerId
    if (!mongoose.Types.ObjectId.isValid(peer)) {
      return res.status(400).json({ message: "Invalid peer ID" });
    }
    
    const result = await Message.deleteMany({
      $or: [
        { from: me, to: peer },
        { from: peer, to: me },
      ],
    });
    
    return res.json({ 
      success: true,
      message: "Chat history cleared successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error("Error clearing chat history:", err);
    return res.status(500).json({ message: "Failed to clear chat history" });
  }
});

/**
 * DELETE /messages
 * Delete specific messages by IDs (only messages sent by the user)
 */
router.delete("/", async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.userId;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "Message IDs array is required" });
    }

    // Validate message IDs
    const invalidIds = messageIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: "Invalid message IDs provided" });
    }

    // Only allow users to delete their own messages
    const result = await Message.deleteMany({
      _id: { $in: messageIds },
      from: userId
    });

    return res.json({
      success: true,
      message: "Messages deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Error deleting messages:", err);
    return res.status(500).json({ message: "Failed to delete messages" });
  }
});

/**
 * GET /messages/:peerId/info
 * Get conversation info (message count, last message, etc.)
 */
router.get("/:peerId/info", async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;

    // Validate peerId
    if (!mongoose.Types.ObjectId.isValid(peer)) {
      return res.status(400).json({ message: "Invalid peer ID" });
    }

    // Check if users are blocked
    const blocked = await BlockedUser.findOne({
      $or: [
        { blocker: me, blocked: peer },
        { blocker: peer, blocked: me }
      ]
    });
    
    if (blocked) {
      return res.status(403).json({ message: "Cannot access conversation with blocked user" });
    }

    const conversationQuery = {
      $or: [
        { from: me, to: peer },
        { from: peer, to: me }
      ]
    };

    // Get conversation statistics
    const [totalMessages, unreadCount, lastMessage] = await Promise.all([
      Message.countDocuments(conversationQuery),
      Message.countDocuments({ from: peer, to: me, readAt: null }),
      Message.findOne(conversationQuery)
        .sort({ createdAt: -1 })
        .populate('from', 'name avatar')
        .lean()
    ]);

    return res.json({
      totalMessages,
      unreadCount,
      lastMessage: lastMessage || null,
      conversationId: `${[me, peer].sort().join('_')}`
    });
  } catch (err) {
    console.error("Error getting conversation info:", err);
    return res.status(500).json({ message: "Failed to get conversation info" });
  }
});

/**
 * POST /messages/search
 * Search messages in conversations
 */
router.post("/search", async (req, res) => {
  try {
    const { query, peerId, limit = 20 } = req.body;
    const userId = req.userId;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Build search filter
    const searchFilter = {
      content: { $regex: query.trim(), $options: 'i' },
      $or: [
        { from: userId },
        { to: userId }
      ]
    };

    // If peerId is provided, limit search to that conversation
    if (peerId) {
      if (!mongoose.Types.ObjectId.isValid(peerId)) {
        return res.status(400).json({ message: "Invalid peer ID" });
      }
      searchFilter.$and = [
        {
          $or: [
            { from: userId, to: peerId },
            { from: peerId, to: userId }
          ]
        }
      ];
    }

    const messages = await Message.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit), 100))
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .lean();

    return res.json({
      results: messages,
      count: messages.length,
      query: query.trim()
    });
  } catch (err) {
    console.error("Error searching messages:", err);
    return res.status(500).json({ message: "Failed to search messages" });
  }
});

export default router;