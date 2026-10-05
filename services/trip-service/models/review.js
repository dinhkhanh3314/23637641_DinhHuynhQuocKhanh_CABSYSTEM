const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewId: {
      type: Number,
      required: true,
      unique: true,
    },

    tripId: {
      type: Number,
      required: true,
    },

    reviewerId: {
      type: Number,
      required: true,
    },

    revieweeId: {
      type: Number,
      required: true,
    },

    reviewerType: {
      type: String,
      enum: ["CUSTOMER", "DRIVER"],
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    tripId: 1,
    reviewerId: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Review", reviewSchema);
