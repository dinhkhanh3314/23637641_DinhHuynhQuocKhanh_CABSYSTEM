const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tripId: {
      type: Number,
      required: true,
      unique: true,
    },

    bookingId: {
      type: Number,
      required: true,
      unique: true,
    },

    customerId: {
      type: Number,
      required: true,
    },

    driverId: {
      type: Number,
      required: true,
    },

    pickup: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    destination: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["ACCEPTED", "IN_PROGRESS", "COMPLETED"],
      default: "ACCEPTED",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Trip", tripSchema);
