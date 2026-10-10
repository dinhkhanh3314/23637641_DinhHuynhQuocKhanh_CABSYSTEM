const express = require("express");
const {
  createPayment,
  getPayment,
  processPayment,
  estimateFare,
} = require("../grpc/paymentClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");
const { requireRoles } = require("../middlewares/auth");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

router.post("/", async (req, res) => {
  try {
    res.status(201).json({ payment: await createPayment({
      trip_id: req.body.tripId,
      customer_id: req.user.userId,
      amount: 0,
      payment_method: req.body.paymentMethod || "MOCK_CARD",
      idempotency_key: req.get("Idempotency-Key"),
    }) });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/estimate/:tripId", async (req, res) => {
  try {
    res.json({ fare: await estimateFare(req.params.tripId) });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    res.json({ payment: await getPayment(req.params.id) });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/process", requireRoles("CUSTOMER"), async (req, res) => {
  try {
    res.json({ payment: await processPayment(req.params.id) });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
