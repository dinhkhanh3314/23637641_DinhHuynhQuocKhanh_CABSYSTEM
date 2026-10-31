const express = require("express");
const {
  getPayment,
  getPaymentByTrip,
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

router.get("/estimate/:tripId", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    res.json({ fare: await estimateFare(req.params.tripId) });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/trip/:tripId", requireRoles("CUSTOMER"), async (req, res) => {
  try {
    res.json({
      payment: await getPaymentByTrip(req.params.tripId),
    });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    res.json({ payment: await getPayment(req.params.id) });
  } catch (error) {
    handleError(res, error);
  }
});

async function processPaymentRequest(req, res, paymentId) {
  const { amount, paymentMethod } = req.body || {};
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !["CASH", "BANK_TRANSFER"].includes(paymentMethod)
  ) {
    return res.status(400).json({
      message: "A valid amount and supported paymentMethod are required",
    });
  }

  try {
    res.json({
      payment: await processPayment(paymentId, {
        amount,
        paymentMethod,
      }),
    });
  } catch (error) {
    handleError(res, error);
  }
}

router.put("/trip/:tripId/process", requireRoles("CUSTOMER"), async (req, res) => {
  try {
    const payment = await getPaymentByTrip(req.params.tripId);
    return processPaymentRequest(req, res, payment.id);
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/process", requireRoles("CUSTOMER"), async (req, res) => {
  return processPaymentRequest(req, res, req.params.id);
});

module.exports = router;
