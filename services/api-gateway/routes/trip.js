const express = require("express");
const {
  createTrip,
  getTrip,
  startTrip,
  completeTrip,
  submitReview,
  getReview,
} = require("../grpc/tripClient");
const { syncTripStatus } = require("../grpc/bookingClient");
const { createPayment, estimateFare } = require("../grpc/paymentClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");
const { requireRoles } = require("../middlewares/auth");
const escapeHtml = require("../utils/escapeHtml");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

function escapeReviewComment(review) {
  if (!review) {
    return review;
  }

  return {
    ...review,
    comment: escapeHtml(review.comment || ""),
  };
}

router.post("/", requireRoles("OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const trip = await createTrip(req.body);
    res.status(201).json({ trip });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const trip = await getTrip(req.params.id);
    res.json({ trip });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/status", requireRoles("DRIVER"), async (req, res) => {
  try {
    const trip = await getTrip(req.params.id);
    const action =
      req.body.status === "IN_PROGRESS" ? startTrip : completeTrip;
    if (!["IN_PROGRESS", "COMPLETED"].includes(req.body.status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    const updatedTrip = await action(req.params.id);
    await syncTripStatus(
      updatedTrip.bookingId,
      updatedTrip.tripId,
      updatedTrip.status,
    );
    const response = { trip: updatedTrip };
    if (updatedTrip.status === "COMPLETED") {
      const [fare] = await Promise.all([
        estimateFare(updatedTrip.tripId),
        createPayment({
          tripId: updatedTrip.tripId,
          customerId: updatedTrip.customerId,
        }),
      ]);
      response.fare = fare;
    }
    res.json(response);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/:id/rating", requireRoles("CUSTOMER"), async (req, res) => {
  try {
    const trip = await getTrip(req.params.id);
    const review = await submitReview({
      tripId: req.params.id,
      reviewerId: req.user.userId,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    res.status(201).json({ review: escapeReviewComment(review) });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id/rating", requireRoles("CUSTOMER"), async (req, res) => {
  try {
    const review = await getReview(req.params.id);
    res.json({ review: escapeReviewComment(review) });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
