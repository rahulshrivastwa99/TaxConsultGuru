const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const { protect, admin } = require("../middleware/authMiddleware");

// 1. Create a new Request (Client)
router.post("/create", async (req, res) => {
  try {
    const newRequest = await Request.create({
      ...req.body,
      status: "pending_approval", // Ensure newly created requests are pending approval
    });
    
    // Emit Socket Event to Admins
    const io = req.app.get("socketio");
    if (io) {
      io.emit("new_pending_job", newRequest);
    }

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get All Requests (For Admin)
router.get("/all", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. CA Accept Request
router.put("/:id/accept", async (req, res) => {
  try {
    const { caId, caName } = req.body;
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { caId, caName, status: "pending_approval" },
      { new: true },
    );
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Admin Approve Request
router.put("/:id/approve", async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "active", adminApprove: true },
      { new: true },
    );

    // Notify Client and CA
    const io = req.app.get("socketio");
    if (io) {
      io.emit("request_update", updatedRequest);
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. Submit Bid (CA)
// @route   POST /api/requests/:id/bids
router.post("/:id/bids", protect, async (req, res) => {
  const { price, proposalText } = req.body;

  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "live") {
      return res.status(400).json({ message: "Bidding is only allowed on live requests" });
    }

    const Bid = require("../models/Bid");
    // Check if CA already bid
    const existingBid = await Bid.findOne({ requestId: req.params.id, caId: req.user._id });
    if (existingBid) {
      return res.status(400).json({ message: "You have already placed a bid on this request" });
    }

    const bid = await Bid.create({
      requestId: req.params.id,
      caId: req.user._id,
      price,
      proposalText,
    });

    // Notify Client in real-time
    const io = req.app.get("socketio");
    if (io) {
      // Emit to the client's room
      io.to(request.clientId.toString()).emit("new_bid_received", {
        requestId: request._id,
        bid
      });
    }

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Fetch Bids (Client)
// @route   GET /api/requests/:id/bids
router.get("/:id/bids", protect, async (req, res) => {
  try {
    const Bid = require("../models/Bid");
    // Populate CA name and experience but exclude email/password/phone
    const bids = await Bid.find({ requestId: req.params.id })
      .populate("caId", "name experience certificationDetails isVerified")
      .select("-email -phone") // Extra safety
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7. Fetch Messages (Client/CA/Admin)
// @route   GET /api/requests/:id/messages
router.get("/:id/messages", protect, async (req, res) => {
  try {
    const Message = require("../models/Message");
    const messages = await Message.find({ requestId: req.params.id })
      .populate("senderId", "name role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 8. Send Message (Client/CA/Admin)
// @route   POST /api/requests/:id/messages
router.post("/:id/messages", protect, async (req, res) => {
  const { text, fileUrl, fileName, intendedFor } = req.body;

  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Anti-Bypass Filter: Mask emails and phone numbers
    let maskedText = text || "";
    if (maskedText) {
      maskedText = maskedText
        .replace(/\b\d{10}\b/g, '**********')
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.com');
    }

    const Message = require("../models/Message");
    const newMessage = await Message.create({
      requestId: req.params.id,
      senderId: req.user._id,
      senderRole: req.user.role,
      text: maskedText,
      fileUrl,
      fileName,
      intendedFor: req.user.role === "admin" ? intendedFor : undefined,
    });

    // Notify participants in real-time
    const io = req.app.get("socketio");
    if (io) {
      // 1. Emit to the chat room (participants)
      io.to(req.params.id).emit("receive_message", newMessage);
      
      // 2. Also emit to specific rooms for notification toasts/alerts
      if (req.user.role === "client") {
        if (request.caId) io.to(request.caId.toString()).emit("receive_message", newMessage);
      } else if (req.user.role === "ca") {
        io.to(request.clientId.toString()).emit("receive_message", newMessage);
      }
      
      // 3. Notify Admins (broadcast or admin room)
      io.emit("message_alert", { requestId: req.params.id, message: newMessage });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 9. CA Completes Work
// @route   PATCH /api/requests/:id/complete
router.patch("/:id/complete", protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only the hired CA can complete the work
    if (request.caId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the assigned expert can mark this as completed" });
    }

    request.status = "completed";
    await request.save();

    // Notify Client and Admin
    const io = req.app.get("socketio");
    if (io) {
      const updateData = { requestId: request._id, status: "completed", message: "Expert marked work as completed" };
      io.to(request.clientId.toString()).emit("job_status_updated", updateData);
      io.emit("job_status_updated", updateData); // Broadcast to admins
    }

    res.json({ message: "Work marked as completed. Waiting for client approval.", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 10. Client Approves Work
// @route   PATCH /api/requests/:id/approve-work
router.patch("/:id/approve-work", protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only the client who created the request can approve the work
    if (request.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the client can approve this work" });
    }

    if (request.status !== "completed") {
      return res.status(400).json({ message: "Work must be marked as completed by the expert first" });
    }

    request.status = "ready_for_payout";
    await request.save();

    // Notify CA and Admin
    const io = req.app.get("socketio");
    if (io) {
      const updateData = { requestId: request._id, status: "ready_for_payout", message: "Client approved work" };
      if (request.caId) io.to(request.caId.toString()).emit("job_status_updated", updateData);
      io.emit("job_status_updated", updateData); // Broadcast to admins
    }

    res.json({ message: "Work approved. Payment is now ready for payout.", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 11. Client Rejects Work (Requests Changes)
// @route   PATCH /api/requests/:id/reject-work
router.patch("/:id/reject-work", protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only the client who created the request can reject the work
    if (request.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the client can refuse this work" });
    }

    if (request.status !== "completed") {
      return res.status(400).json({ message: "Work must be in completed status to request changes" });
    }

    request.status = "active"; // Move back to active
    await request.save();

    // Notify CA and Admin
    const io = req.app.get("socketio");
    if (io) {
      const updateData = { requestId: request._id, status: "active", message: "Client requested changes" };
      if (request.caId) io.to(request.caId.toString()).emit("job_status_updated", updateData);
      io.emit("job_status_updated", updateData);
    }

    res.json({ message: "Changes requested. The project is now active again.", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
