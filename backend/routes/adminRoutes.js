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

    // Notify CA in real-time
    const io = req.app.get("socketio");
    if (io) {
      io.to(user._id.toString()).emit("account_verified", { 
        message: "Your account has been verified by the administrator!",
        user 
      });
    }

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

    // Real-time notifications
    const io = req.app.get("socketio");
    if (io) {
      if (request.status === "live") {
        io.emit("new_live_job", request);
      } else {
        io.emit("request_update", request);
      }
    }

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
    
    // Notify Client and CA
    const io = req.app.get("socketio");
    if (io) {
      const updateData = { requestId: request._id, message: "Workspace unlocked by Admin" };
      io.to(request.clientId.toString()).emit("workspace_unlocked", updateData);
      if (request.caId) io.to(request.caId.toString()).emit("workspace_unlocked", updateData);
      io.emit("job_status_updated", { ...updateData, status: "active" });
    }

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

    // Notify relevant parties
    const io = req.app.get("socketio");
    if (io) {
      const updateData = { requestId: request._id, status: "payout_completed", message: "Project archived and payout completed" };
      io.to(request.clientId.toString()).emit("job_status_updated", updateData);
      if (request.caId) io.to(request.caId.toString()).emit("job_status_updated", updateData);
    }

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

    // Notify relevant parties
    const io = req.app.get("socketio");
    if (io) {
      const updateData = { requestId: request._id, status: "ready_for_payout", message: "Admin Intervention: Work force-approved" };
      io.to(request.clientId.toString()).emit("job_status_updated", updateData);
      if (request.caId) io.to(request.caId.toString()).emit("job_status_updated", updateData);
    }

    res.json({ message: "Admin intervention: Work force-approved.", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users (for Admin Overwatch)
// @route   GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
