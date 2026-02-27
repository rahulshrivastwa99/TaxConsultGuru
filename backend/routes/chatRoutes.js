const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const Message = require("../models/Message");

// Configure Multer to hold files in memory (10MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } 
});

const { protect } = require("../middleware/authMiddleware");

// 1. Send Message & Upload File
// Adjusted route to accept the requestId dynamically
router.post("/:requestId/messages", protect, upload.single("file"), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { text, intendedFor } = req.body; 

    let fileUrl = null;
    let fileName = null;

    // If a file was attached, upload it to Cloudinary
    if (req.file) {
      const uploadFromBuffer = (req) => {
        return new Promise((resolve, reject) => {
          const cld_upload_stream = cloudinary.uploader.upload_stream(
            {
              folder: 'tcg_documents',
              resource_type: 'auto',
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
        });
      };

      const result = await uploadFromBuffer(req);
      fileUrl = result.secure_url; 
      fileName = req.file.originalname; 
    }

    // Apply Anti-Bypass Filter to the text message
    let maskedText = text || "";
    if (maskedText) {
      maskedText = maskedText
        .replace(/\b\d{10}\b/g, '**********')
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.com');
    }

    const Request = require("../models/Request");
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Save to Database
    const newMessage = await Message.create({
      requestId,
      senderId: req.user._id,
      senderRole: req.user.role,
      senderName: req.user.name,
      text: maskedText,
      fileUrl,
      fileName,
      intendedFor: req.user.role === "admin" ? intendedFor : undefined,
    });

    // Notify participants in real-time
    const io = req.app.get("socketio");
    if (io) {
      // 1. Emit to the chat room
      io.to(requestId).emit("receive_message", newMessage);
      
      // 2. Also emit to specific rooms for notification toasts/alerts
      if (req.user.role === "client") {
        if (request.caId) io.to(request.caId.toString()).emit("receive_message", newMessage);
      } else if (req.user.role === "ca") {
        io.to(request.clientId.toString()).emit("receive_message", newMessage);
      }
      
      // 3. Notify Admins
      io.emit("message_alert", { requestId, message: newMessage });
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to send message or upload file", error: error.message });
  }
});

// 2. Original Send Message (Kept as fallback just in case your mock context still uses it)
router.post("/send", async (req, res) => {
  try {
    const newMessage = await Message.create(req.body);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Get Messages for a Request
router.get("/:requestId", async (req, res) => {
  try {
    const messages = await Message.find({
      requestId: req.params.requestId,
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;