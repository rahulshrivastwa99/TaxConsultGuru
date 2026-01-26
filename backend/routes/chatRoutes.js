const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// 1. Send Message
router.post("/send", async (req, res) => {
  try {
    const newMessage = await Message.create(req.body);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get Messages for a Request
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
