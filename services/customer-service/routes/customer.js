const express = require("express");
const {
  getCustomerByUserId,
  createCustomer,
  updateCustomer,
} = require("../services/customerService");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    const customer = await getCustomerByUserId(userId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get customer",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = Number(req.body.userId);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    const customer = await createCustomer({
      ...req.body,
      userId,
    });

    res.status(201).json(customer);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Customer already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create customer",
    });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    const customer = await updateCustomer(userId, req.body);

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update customer",
    });
  }
});

module.exports = router;
