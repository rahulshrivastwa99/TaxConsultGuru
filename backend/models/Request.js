const mongoose = require("mongoose");

const requestSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientName: { type: String, required: true },
    caId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    caName: { type: String },
    serviceType: { type: String, required: true }, // e.g., 'gst-filing'
    serviceName: { type: String, required: true }, // e.g., 'GST Filing'
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    expectedBudget: { type: Number }, // Suggested budget
    status: {
      type: String,
      enum: [
        "searching",
        "pending_approval",
        "live",
        "active",
        "completed",
        "cancelled",
        "awaiting_payment",
        "ready_for_payout",
        "payout_completed",
      ],
      default: "pending_approval", // New default status
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    adminApprove: { type: Boolean, default: false },
    hiredCA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isWorkspaceUnlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Request", requestSchema);
