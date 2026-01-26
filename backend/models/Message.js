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
    content: { type: String, required: true },
    isForwarded: { type: Boolean, default: false },
    originalSenderId: { type: mongoose.Schema.Types.ObjectId }, // If forwarded by admin
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
