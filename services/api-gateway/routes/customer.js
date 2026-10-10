const express = require("express");
const {
  createCustomer,
  getCustomer,
  updateCustomer,
} = require("../grpc/customerClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    res.status(201).json(await createCustomer({ user_id: req.body.userId }));
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    res.json(await getCustomer(req.params.userId));
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    res.json(await updateCustomer(req.params.userId, req.body));
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

module.exports = router;
