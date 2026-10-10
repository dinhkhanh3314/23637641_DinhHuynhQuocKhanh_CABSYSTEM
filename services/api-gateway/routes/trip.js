const express = require("express");
const {
  createTrip,
  getTrip,
  startTrip,
  completeTrip,
  submitReview,
  getReview,
} = require("../grpc/tripClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

router.post("/", async (req, res) => {
  try {
    const trip = await createTrip(req.body);
    res.status(201).json({ trip });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    res.json({ trip: await getTrip(req.params.id) });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const action =
      req.body.status === "IN_PROGRESS" ? startTrip : completeTrip;
    if (!["IN_PROGRESS", "COMPLETED"].includes(req.body.status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    res.json({ trip: await action(req.params.id) });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/:id/rating", async (req, res) => {
  try {
    if (!Number.isInteger(Number(req.body.reviewerId))) {
      return res.status(400).json({ message: "reviewerId is required" });
    }

    const review = await submitReview({
      tripId: req.params.id,
      reviewerId: req.body.reviewerId,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    res.status(201).json({ review });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id/rating", async (req, res) => {
  try {
    const review = await getReview(req.params.id, req.query.reviewerId);
    res.json({ review });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
