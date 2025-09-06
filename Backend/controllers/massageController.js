import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import "dotenv/config";

// ----------------- Models -----------------
// User Model (minimal for messaging)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: String,
  password: { type: String, required: true },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Message Model
const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  readAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

// Blocked User Model
const blockedUserSchema = new mongoose.Schema({
  blocker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blocked: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const BlockedUser = mongoose.model('BlockedUser', blockedUserSchema);

// ----------------- App Setup -----------------
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || "*";

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/messaging");

// Middlewares
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}));
app.use(express.json());

// ----------------- Auth Middleware -----------------
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

// ----------------- Auth Router -----------------
const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple password check (in production, use bcrypt)
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: payload });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ----------------- User Router -----------------
const userRouter = express.Router();

// Apply authentication middleware to all user routes
userRouter.use(authenticate);

userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('name email avatar')
      .limit(50);
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

userRouter.get("/friends", async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("connections", "name email avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    const connections = user.connections || [];
    return res.json({ data: connections });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch friends" });
  }
});

// User blocking routes
userRouter.post("/:userId/block", async (req, res) => {
  try {
    const blockerId = req.userId;
    const blockedId = req.params.userId;
    
    if (blockerId === blockedId) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }
    
    const existing = await BlockedUser.findOne({
      blocker: blockerId,
      blocked: blockedId
    });
    
    if (existing) {
      return res.status(400).json({ message: "User already blocked" });
    }
    
    await BlockedUser.create({
      blocker: blockerId,
      blocked: blockedId
    });
    
    return res.json({ message: "User blocked successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to block user" });
  }
});

userRouter.delete("/:userId/block", async (req, res) => {
  try {
    const blockerId = req.userId;
    const blockedId = req.params.userId;
    
    const result = await BlockedUser.findOneAndDelete({
      blocker: blockerId,
      blocked: blockedId
    });
    
    if (!result) {
      return res.status(404).json({ message: "Block relationship not found" });
    }
    
    return res.json({ message: "User unblocked successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to unblock user" });
  }
});

userRouter.get("/blocked", async (req, res) => {
  try {
    const userId = req.userId;
    
    const blockedUsers = await BlockedUser.find({ blocker: userId })
      .populate("blocked", "name email avatar")
      .sort({ createdAt: -1 });
    
    return res.json({
      blockedUsers: blockedUsers.map(block => ({
        id: block.blocked._id,
        name: block.blocked.name,
        email: block.blocked.email,
        avatar: block.blocked.avatar,
        blockedAt: block.createdAt
      }))
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch blocked users" });
  }
});

// ----------------- Message Router -----------------
const messageRouter = express.Router();

// Apply authentication middleware to all message routes
messageRouter.use(authenticate);

// Get message history with a specific user
messageRouter.get("/:peerId", async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;

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

    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const before = req.query.before ? new Date(req.query.before) : null;

    const query = {
      $or: [
        { from: me, to: peer },
        { from: peer, to: me },
      ],
    };
    if (before) query.createdAt = { $lt: before };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .lean();

    return res.json(messages.reverse());
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Mark messages as read
messageRouter.post("/:peerId/read", async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;
    
    const result = await Message.updateMany(
      { from: peer, to: me, readAt: null },
      { $set: { readAt: new Date() } }
    );
    
    return res.json({ updated: result.modifiedCount });
  } catch (err) {
    return res.status(500).json({ message: "Failed to mark messages as read" });
  }
});

// Delete chat history
messageRouter.delete("/:peerId", async (req, res) => {
  try {
    const me = req.userId;
    const peer = req.params.peerId;
    
    const result = await Message.deleteMany({
      $or: [
        { from: me, to: peer },
        { from: peer, to: me },
      ],
    });
    
    return res.json({ 
      message: "Chat history cleared", 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to clear chat history" });
  }
});

// Get unread message counts
messageRouter.get("/unread/count", async (req, res) => {
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
    return res.status(500).json({ message: "Failed to get unread count" });
  }
});

// ----------------- Mount Routers -----------------
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ----------------- Socket.io Setup -----------------
const io = new Server(server, {
  cors: {
    origin: frontendUrl === "*" ? "*" : [frontendUrl],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket authentication
io.use((socket, next) => {
  try {
    const header = socket.handshake.auth?.token
      || socket.handshake.headers?.authorization
      || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;
    
    if (!token) return next(new Error("NO_AUTH_TOKEN"));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    return next();
  } catch (err) {
    return next(new Error("INVALID_TOKEN"));
  }
});

const onlineUsers = new Map();
const typingUsers = new Map();

io.on("connection", (socket) => {
  const userId = String(socket.userId);
  console.log(`User ${userId} connected`);
  
  // Track online users
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socket.id);
  
  socket.join(userId);
  
  // Broadcast online status
  broadcastPresence(userId, true);

  // Handle sending messages
  socket.on("chat:send", async ({ to, content }, ack) => {
    try {
      if (!to || !content?.trim()) {
        if (ack) ack({ ok: false, error: "INVALID_PAYLOAD" });
        return;
      }

      // Check if users are blocked
      const blocked = await BlockedUser.findOne({
        $or: [
          { blocker: userId, blocked: to },
          { blocker: to, blocked: userId }
        ]
      });
      
      if (blocked) {
        if (ack) ack({ ok: false, error: "USER_BLOCKED" });
        return;
      }

      // Save message to database
      const msg = await Message.create({
        from: userId,
        to,
        content: content.trim(),
        deliveredAt: new Date(),
      });

      const populatedMsg = await Message.findById(msg._id)
        .populate('from', 'name avatar')
        .populate('to', 'name avatar');

      // Emit to sender and receiver
      io.to(userId).emit("chat:receive", populatedMsg);
      io.to(to).emit("chat:receive", populatedMsg);

      if (ack) ack({ ok: true, message: populatedMsg });
      
    } catch (err) {
      console.error("Error sending message:", err);
      if (ack) ack({ ok: false, error: "SERVER_ERROR" });
    }
  });

  // Handle typing indicators
  socket.on("chat:typing", async ({ to, typing }) => {
    try {
      // Check if users are blocked
      const blocked = await BlockedUser.findOne({
        $or: [
          { blocker: userId, blocked: to },
          { blocker: to, blocked: userId }
        ]
      });
      
      if (blocked) return;

      // Track typing state
      if (!typingUsers.has(userId)) {
        typingUsers.set(userId, new Set());
      }
      
      if (typing) {
        typingUsers.get(userId).add(to);
      } else {
        typingUsers.get(userId).delete(to);
      }

      // Emit typing indicator
      io.to(to).emit("chat:typing", { from: userId, typing: !!typing });
    } catch (err) {
      console.error("Error handling typing:", err);
    }
  });

  // Handle message read receipts
  socket.on("chat:read", async ({ messageIds }) => {
    try {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      await Message.updateMany(
        { 
          _id: { $in: messageIds },
          to: userId,
          readAt: null 
        },
        { $set: { readAt: new Date() } }
      );

      // Notify senders about read status
      const messages = await Message.find({ _id: { $in: messageIds } });
      messages.forEach(msg => {
        io.to(msg.from.toString()).emit("chat:read", {
          messageId: msg._id,
          readAt: new Date(),
          readBy: userId
        });
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log(`User ${userId} disconnected: ${reason}`);
    
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        broadcastPresence(userId, false);
      }
    }

    // Clear typing indicators
    if (typingUsers.has(userId)) {
      const typingTo = typingUsers.get(userId);
      typingTo.forEach(targetUserId => {
        io.to(targetUserId).emit("chat:typing", { from: userId, typing: false });
      });
      typingUsers.delete(userId);
    }
  });
});

// Broadcast presence to user's connections
async function broadcastPresence(userId, online) {
  try {
    const user = await User.findById(userId).select('connections');
    if (user?.connections) {
      user.connections.forEach(connectionId => {
        io.to(connectionId.toString()).emit("presence:update", {
          userId,
          online
        });
      });
    }
  } catch (err) {
    console.error("Error broadcasting presence:", err);
  }
}

// ----------------- Start Server -----------------
server.listen(PORT, () => {
  console.log(`Messaging server running on port ${PORT}`);
});