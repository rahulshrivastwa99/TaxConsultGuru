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
    status: {
      type: String,
      enum: [
        "searching",
        "pending_approval",
        "active",
        "completed",
        "cancelled",
      ],
      default: "searching",
    },
    adminApprove: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Request", requestSchema);
