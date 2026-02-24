const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Request = require("../models/Request");
const { protect, admin } = require("../middleware/authMiddleware");

// Apply middleware to all routes in this router
router.use(protect);
router.use(admin);

// @desc    Get all pending CAs
// @route   GET /api/admin/pending-cas
router.get("/pending-cas", async (req, res) => {
  try {
    const pendingCAs = await User.find({ role: "ca", isVerified: false });
    res.json(pendingCAs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify a CA
// @route   PATCH /api/admin/verify-ca/:id
router.patch("/verify-ca/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    await user.save();
    res.json({ message: "CA verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all pending jobs
// @route   GET /api/admin/pending-jobs
router.get("/pending-jobs", async (req, res) => {
  try {
    const pendingJobs = await Request.find({ status: "pending_approval" });
    res.json(pendingJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve a job
// @route   PATCH /api/admin/approve-job/:id
router.patch("/approve-job/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Job request not found" });

    // If it has a CA, it's being approved for work, otherwise it's being approved to be live
    if (request.caId) {
      request.status = "active";
    } else {
      request.status = "live";
    }

    await request.save();
    res.json({ message: `Job approved and is now ${request.status}`, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reject a job
// @route   PATCH /api/admin/reject-job/:id
router.patch("/reject-job/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Job request not found" });

    request.status = "cancelled";
    await request.save();
    res.json({ message: "Job rejected and cancelled", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Unlock workspace (Payment verified)
// @route   PATCH /api/admin/requests/:id/unlock
router.patch("/requests/:id/unlock", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Job request not found" });

    request.status = "active";
    request.isWorkspaceUnlocked = true;
    
    await request.save();
    res.json({ message: "Workspace unlocked and project is now active", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Archive a job (Payout completed)
// @route   PATCH /api/admin/requests/:id/archive
router.patch("/requests/:id/archive", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Job request not found" });

    request.status = "payout_completed";
    request.isArchived = true;
    
    await request.save();
    res.json({ message: "Job archived and payout completed", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Force approve a job (Admin intervention)
// @route   PATCH /api/admin/requests/:id/force-approve
router.patch("/requests/:id/force-approve", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Job request not found" });

    if (request.status !== "completed") {
      return res.status(400).json({ message: "Only completed jobs can be force approved" });
    }

    request.status = "ready_for_payout";
    await request.save();
    res.json({ message: "Admin intervention: Work force-approved.", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
