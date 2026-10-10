const express = require("express");
const {
  createCustomer,
  getCustomer,
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

router.get("/:userId", async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Can only access your own customer profile" });
    }
    res.json(await getCustomer(req.params.userId));
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Can only update your own customer profile" });
    }
    res.json(await updateCustomer(req.params.userId, req.body));
  } catch (error) {
    console.error(error);
    const mapped = grpcErrorToHttp(error);
    res.status(mapped.status).json({ message: mapped.message });
  }
});

module.exports = router;
