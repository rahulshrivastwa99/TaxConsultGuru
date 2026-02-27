const express = require("express");
const router = express.Router();
const Bid = require("../models/Bid");
const Request = require("../models/Request");
const { protect } = require("../middleware/authMiddleware");

// @desc    Hire a CA via a specific bid
// @route   POST /api/bids/:id/hire
router.post("/:id/hire", protect, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    const request = await Request.findById(bid.requestId);
    if (!request) return res.status(404).json({ message: "Parent request not found" });

    // 1. Update Request status and hiredCA
    request.status = "awaiting_payment";
    request.hiredCA = bid.caId;
    request.caId = bid.caId; // Keep for legacy context compatibility
    await request.save();

    // 2. Update Bid status
    bid.status = "accepted";
    await bid.save();

    // 3. Reject other bids for this request
    await Bid.updateMany(
      { requestId: request._id, _id: { $ne: bid._id } },
      { status: "rejected" }
    );

    res.json({ message: "CA hired successfully via bid", request, bid });

    // Notify CA and Admin
    const io = req.app.get("socketio");
    if (io) {
      io.emit("new_pending_payment", { requestId: request._id, request });
      io.emit("request_update", request);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all bids for a specific request
// @route   GET /api/bids/request/:requestId
router.get("/request/:requestId", protect, async (req, res) => {
  try {
    const bids = await Bid.find({ requestId: req.params.requestId })
      .populate("caId", "name email experience certificationDetails")
      .sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update bid status (Accept/Reject)
// @route   PATCH /api/bids/:id/status
router.patch("/:id/status", protect, async (req, res) => {
  const { status } = req.body;

  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    bid.status = status;
    await bid.save();

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
