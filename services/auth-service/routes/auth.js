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

    res.status(201).json({
      message: "Customer registered successfully",
      user,
    });
  } catch (error) {
    if (error.message === "Phone or email already exists") {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal server error",
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

    const result = await loginCustomer({
      identifier,
      password,
    });

    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (error.message === "Account is not active") {
      return res.status(403).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = router;
