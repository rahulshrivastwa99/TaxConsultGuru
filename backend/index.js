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

app.use(express.json());

// IMPORTANT: CORS configuration for deployment
// Jab frontend deploy ho jaye, to "*" hata kar frontend ka URL daal dena security ke liye
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// --- FIX: Root Route for Health Check ---
app.get("/", (req, res) => {
  res.send("TCG Server is Running Successfully 🚀");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/bids", require("./routes/bidRoutes"));

// --- SOCKET.IO SETUP ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
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
    }
    
    socket.emit("connected");
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
