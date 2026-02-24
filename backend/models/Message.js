const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: { type: String, required: true }, // 'client', 'ca', 'admin'
    text: { type: String }, // Renamed from content
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    isForwarded: { type: Boolean, default: false },
    originalSenderId: { type: mongoose.Schema.Types.ObjectId }, // If forwarded by admin
    intendedFor: { type: String, enum: ["client", "ca"] }, // For admin messages: which thread to show in
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
