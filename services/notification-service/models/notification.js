const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: Number,
      required: true,
      unique: true,
    },

    recipientId: {
      type: Number,
      required: true,
    },

    recipientType: {
      type: String,
      enum: ["CUSTOMER", "DRIVER"],
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["UNREAD", "READ"],
      default: "UNREAD",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
