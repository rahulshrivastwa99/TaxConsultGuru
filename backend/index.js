// backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const connectDB = require("./config/db");
const seedAdmin = require("./seeder");
const { createServer } = require("http");
const { Server } = require("socket.io");

// 1. Load Environment Variables & Validate
dotenv.config();

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("FATAL ERROR: MONGO_URI or JWT_SECRET is not defined in .env");
  process.exit(1);
}

connectDB(); // Connect to MongoDB

const app = express();

// 2. Proxy and Security Configuration
// Trust proxy for Render/Vercel (Required for rate limiting behind load balancers)
app.set("trust proxy", 1);

// 3. Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(express.json({ limit: "10kb" })); // Body parser, limited to 10kb to prevent DDoS
app.use(mongoSanitize()); // Prevent NoSQL query injection
app.use(xss()); // Prevent Cross-Site Scripting (XSS)
app.use(hpp()); // Prevent HTTP parameter pollution

// Rate Limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again in 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// 4. CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tcgfrontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS policy violation"), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

// 5. Health Check Route
app.get("/", (req, res) => {
  res.json({ message: "TCG API Running Successfully 🚀", status: "online" });
});

// 6. API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/bids", require("./routes/bidRoutes"));

// 7. 404 & Global Error Handler
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
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

  socket.on("setup", (userId) => {
    socket.join(userId);
    const existingSocketId = onlineUsers.get(userId);
    if (existingSocketId !== socket.id) {
      onlineUsers.set(userId, socket.id);
      io.emit("user_online", userId);
    }
    socket.emit("connected");
  });

  socket.on("get_online_users", () => {
    const onlineIds = Array.from(onlineUsers.keys());
    socket.emit("online_users_list", onlineIds);
  });

  socket.on("join_chat", (requestId) => {
    socket.join(requestId);
  });

  socket.on("new_request", (data) => {
    io.emit("request_alert", data);
  });

  socket.on("send_message", (data) => {
    if (data.requestId) {
      socket.to(data.requestId).emit("receive_message", data);
    } else {
      io.emit("receive_message", data);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("user_offline", userId);
        break;
      }
    }
  });
});

app.set("socketio", io);
seedAdmin();
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
