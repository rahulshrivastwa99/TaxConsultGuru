const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

// 1. Create a new Request (Client)
router.post("/create", async (req, res) => {
  try {
    const newRequest = await Request.create(req.body);
    // TODO: Emit Socket Event here (later)
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
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
