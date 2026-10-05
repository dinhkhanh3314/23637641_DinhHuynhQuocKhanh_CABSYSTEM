const Trip = require("../models/trip");
const Review = require("../models/review");

async function createTrip(data) {
  const existingTrip = await Trip.findOne({
    bookingId: Number(data.bookingId),
  });

  if (existingTrip) {
    throw new Error("TRIP_ALREADY_EXISTS");
  }

  const lastTrip = await Trip.findOne().sort({ tripId: -1 }).select("tripId");

  const tripId = lastTrip ? lastTrip.tripId + 1 : 1;

  return Trip.create({
    tripId,

    bookingId: Number(data.bookingId),
    customerId: Number(data.customerId),
    driverId: Number(data.driverId),

    pickup: {
      latitude: Number(data.pickupLatitude),
      longitude: Number(data.pickupLongitude),
    },

    destination: {
      latitude: Number(data.destinationLatitude),
      longitude: Number(data.destinationLongitude),
    },

    status: "ACCEPTED",
  });
}

async function startTrip(tripId) {
  const trip = await Trip.findOne({
    tripId: Number(tripId),
  });

  if (!trip) {
    throw new Error("TRIP_NOT_FOUND");
  }

  if (trip.status !== "ACCEPTED") {
    throw new Error("TRIP_CANNOT_START");
  }

  trip.status = "IN_PROGRESS";
  trip.startedAt = new Date();

  return trip.save();
}

async function completeTrip(tripId) {
  const trip = await Trip.findOne({
    tripId: Number(tripId),
  });

  if (!trip) {
    throw new Error("TRIP_NOT_FOUND");
  }

  if (trip.status !== "IN_PROGRESS") {
    throw new Error("TRIP_CANNOT_COMPLETE");
  }

  trip.status = "COMPLETED";
  trip.completedAt = new Date();

  return trip.save();
}

async function getTrip(tripId) {
  const trip = await Trip.findOne({
    tripId: Number(tripId),
  });

  if (!trip) {
    throw new Error("TRIP_NOT_FOUND");
  }

  return trip;
}

async function createReview(data) {
  const trip = await Trip.findOne({
    tripId: Number(data.tripId),
  });

  if (!trip) {
    throw new Error("TRIP_NOT_FOUND");
  }

  if (trip.status !== "COMPLETED") {
    throw new Error("TRIP_NOT_COMPLETED");
  }

  const existingReview = await Review.findOne({
    tripId: Number(data.tripId),
    reviewerId: Number(data.reviewerId),
  });

  if (existingReview) {
    throw new Error("REVIEW_ALREADY_EXISTS");
  }

  const lastReview = await Review.findOne()
    .sort({ reviewId: -1 })
    .select("reviewId");

  const reviewId = lastReview ? lastReview.reviewId + 1 : 1;

  return Review.create({
    reviewId,
    tripId: Number(data.tripId),
    reviewerId: Number(data.reviewerId),
    revieweeId: Number(data.revieweeId),
    reviewerType: data.reviewerType,
    rating: Number(data.rating),
    comment: data.comment || null,
  });
}

async function getTripHistory(userId, userType) {
  const field = userType === "driver" ? "driverId" : "customerId";

  return Trip.find({
    [field]: Number(userId),
  }).sort({
    createdAt: -1,
  });
}

module.exports = {
  createTrip,
  startTrip,
  completeTrip,
  getTrip,
  createReview,
  getTripHistory,
};
