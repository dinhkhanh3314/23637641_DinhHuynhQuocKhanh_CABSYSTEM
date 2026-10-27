const express = require("express");
const {
  createCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} = require("../grpc/customerClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");
const { requireRoles } = require("../middlewares/auth");

const router = express.Router();

router.post("/", requireRoles("CUSTOMER"), async (req, res) => {
  try {
    res.status(201).json(await createCustomer({ user_id: req.user.userId }));
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

router.get("/", requireRoles("CUSTOMER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const result = await getCustomers();
    res.json({ customers: result.customers || [] });
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

router.get("/:userId", requireRoles("CUSTOMER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    res.json(await getCustomer(req.params.userId));
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

router.put("/:userId", requireRoles("CUSTOMER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    res.json(await updateCustomer(req.params.userId, req.body || {}));
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

module.exports = router;
