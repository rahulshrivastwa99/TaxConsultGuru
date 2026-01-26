// console.log("Server running");
// backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const seedAdmin = require("./seeder"); // Import seeder
const { createServer } = require("http"); // New for Socket.io
const { Server } = require("socket.io");

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

app.use(express.json()); // Allow JSON data
app.use(cors()); // Allow Frontend to talk to Backend

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/requestRoutes")); // New
app.use("/api/chat", require("./routes/chatRoutes"));

// --- SOCKET.IO SETUP ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }, // Allow frontend to connect
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // Join a room based on user role or ID
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Handle Live Events
  socket.on("new_request", (data) => {
    // Broadcast to all CAs
    io.emit("request_alert", data);
  });

  socket.on("send_message", (data) => {
    // Broadcast to specific Request Room (chat)
    io.to(data.requestId).emit("receive_message", data);
  });
});

// Run the Admin Seeder on startup
// seedAdmin();
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
