const express = require("express");

const { registerCustomer, loginCustomer } = require("../services/authService");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    if (!phone || !email || !password) {
      return res.status(400).json({
        message: "Phone, email and password are required",
      });
    }

    const user = await registerCustomer({
      phone,
      email,
      password,
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    if (error.message === "CUSTOMER_CREATION_FAILED") {
      return res.status(503).json({
        message: "Customer Service is unavailable",
      });
    }

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Identifier and password are required",
      });
    }

    const user = await loginCustomer({
      identifier,
      password,
    });

    res.json(user);
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (error.message === "USER_INACTIVE") {
      return res.status(403).json({
        message: "User is inactive",
      });
    }

    res.status(500).json({
      message: "Login failed",
    });
  }
});

module.exports = router;
