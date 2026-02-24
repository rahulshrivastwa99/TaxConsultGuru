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
    origin: "*", // Production mein frontend URL yahan replace karna
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("new_request", (data) => {
    io.emit("request_alert", data);
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });
});
// seedAdmin(); // Seed the Master Admin if not exists
seedAdmin();
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
