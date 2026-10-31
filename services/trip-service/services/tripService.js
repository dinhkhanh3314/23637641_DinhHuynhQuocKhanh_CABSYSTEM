const Trip = require("../models/trip");
const Review = require("../models/review");
const Counter = require("../models/counter");

async function createTrip(data) {
  const existingTrip = await Trip.findOne({
    bookingId: Number(data.bookingId),
  });

  if (existingTrip) {
    return existingTrip;
  }

  const lastTrip = await Trip.findOne().sort({ tripId: -1 }).select("tripId").lean();
  const lastTripId = lastTrip?.tripId || 0;
  try {
    await Counter.updateOne(
      { _id: "trip" },
      { $max: { sequence: lastTripId } },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }
  }

  const counter = await Counter.findOneAndUpdate(
    { _id: "trip" },
    { $inc: { sequence: 1 } },
    { new: true },
  );
  if (!counter) {
    throw new Error("TRIP_ID_ALLOCATION_FAILED");
  }
  try {
    return await Trip.create({
      tripId: counter.sequence,
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
  } catch (error) {
    if (error.code === 11000) {
      const trip = await Trip.findOne({
        bookingId: Number(data.bookingId),
      });
      if (trip) {
        return trip;
      }
    }
    throw error;
  }
}

async function startTrip(tripId) {
  const trip = await Trip.findOne({
    tripId: Number(tripId),
  });

  if (!trip) {
    throw new Error("TRIP_NOT_FOUND");
  }

  if (trip.status === "IN_PROGRESS") {
    return trip;
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

  if (trip.status === "COMPLETED") {
    await createPendingReview(trip);
    return trip;
  }

  if (trip.status !== "IN_PROGRESS") {
    throw new Error("TRIP_CANNOT_COMPLETE");
  }

  trip.status = "COMPLETED";
  trip.completedAt = new Date();

  await trip.save();
  await createPendingReview(trip);

  return trip;
}

async function cancelTrip(bookingId, reason) {
  const trip = await Trip.findOne({ bookingId: Number(bookingId) });

  if (!trip) {
    throw new Error("TRIP_NOT_FOUND");
  }

  if (["COMPLETED", "CANCELED"].includes(trip.status)) {
    throw new Error("TRIP_CANNOT_CANCEL");
  }

  trip.status = "CANCELED";
  trip.canceledAt = new Date();
  trip.canceledBy = "CUSTOMER";
  trip.cancelReason = reason;

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

  if (existingReview?.status === "SUBMITTED") {
    throw new Error("REVIEW_ALREADY_EXISTS");
  }

  const rating = Number(data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("INVALID_RATING");
  }

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = data.comment || null;
    existingReview.status = "SUBMITTED";
    return existingReview.save();
  }

  const lastReview = await Review.findOne()
    .sort({ reviewId: -1 })
    .select("reviewId");
  return Review.create({
    reviewId: lastReview ? lastReview.reviewId + 1 : 1,
    tripId: Number(data.tripId),
    reviewerId: Number(data.reviewerId),
    revieweeId: trip.driverId,
    reviewerType: "CUSTOMER",
    rating,
    comment: data.comment || null,
    status: "SUBMITTED",
  });
}

async function createPendingReview(trip) {
  const existingReview = await Review.findOne({
    tripId: trip.tripId,
    reviewerId: trip.customerId,
  });

  if (existingReview) {
    return existingReview;
  }

  const lastReview = await Review.findOne()
    .sort({ reviewId: -1 })
    .select("reviewId");

  return Review.create({
    reviewId: lastReview ? lastReview.reviewId + 1 : 1,
    tripId: trip.tripId,
    reviewerId: trip.customerId,
    revieweeId: trip.driverId,
    reviewerType: "CUSTOMER",
    status: "PENDING",
  });
}

async function getReview(tripId) {
  const review = await Review.findOne({
    tripId: Number(tripId),
    reviewerType: "CUSTOMER",
  });

  if (!review) {
    throw new Error("REVIEW_NOT_FOUND");
  }

  return review;
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
  cancelTrip,
  getTrip,
  createReview,
  getReview,
  getTripHistory,
};
