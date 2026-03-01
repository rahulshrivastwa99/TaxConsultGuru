// backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const seedAdmin = require("./seeder");
const { createServer } = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

// Trust proxy for Render/Vercel
app.set("trust proxy", 1);

app.use(express.json());

// Proper CORS for Production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tcgfrontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

// --- Root Route for Health Check (JSON) ---
app.get("/", (req, res) => {
  res.json({ message: "TCG API Running Successfully 🚀", status: "online" });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/bids", require("./routes/bidRoutes"));

// 404 Handler for API
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// --- SOCKET.IO SETUP ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Map to track online users: userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New Connection:", socket.id);

  // User identities setup
  socket.on("setup", (userId) => {
    socket.join(userId);
    
    // Only log if the user is connecting with a new socket ID
    const existingSocketId = onlineUsers.get(userId);
    if (existingSocketId !== socket.id) {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
      
      // Broadcast to all that this user is online
      io.emit("user_online", userId);
    }
    
    socket.emit("connected");
  });

  // Initial Sync for online users
  socket.on("get_online_users", () => {
    const onlineIds = Array.from(onlineUsers.keys());
    socket.emit("online_users_list", onlineIds);
  });

  socket.on("join_chat", (requestId) => {
    socket.join(requestId);
    console.log(`User joined chat room: ${requestId}`);
  });

  socket.on("new_request", (data) => {
    // Broadcast to all admins and available CAs
    io.emit("request_alert", data);
  });

  socket.on("send_message", (data) => {
    // data should contain requestId
    if (data.requestId) {
      socket.to(data.requestId).emit("receive_message", data);
    } else {
      io.emit("receive_message", data); // Fallback
    }
  });

  socket.on("disconnect", () => {
    // Find and remove the user from onlineUsers
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} offline`);
        
        // Broadcast to all that this user is offline
        io.emit("user_offline", userId);
        break;
      }
    }
  });
});

// Export io so it can be used in routes
app.set("socketio", io);
// seedAdmin(); // Seed the Master Admin if not exists
seedAdmin();
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
