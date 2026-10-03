const express = require("express");

const {
  registerCustomer,
  loginCustomer,
  registerDriver,
  sendDriverOtp,
  verifyDriverOtp,
  setDriverPassword,
} = require("../services/authService");

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

router.post("/driver/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Số điện thoại là bắt buộc",
      });
    }

    const otp = await sendDriverOtp(phone);

    res.status(200).json({
      message: "Đã gửi OTP",
      otp,
    });
  } catch (error) {
    console.error("Send driver OTP error:", error);

    res.status(500).json({
      message: "Không thể gửi OTP",
    });
  }
});

router.post("/driver/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        message: "Số điện thoại và OTP là bắt buộc",
      });
    }

    await verifyDriverOtp(phone, otp);

    res.status(200).json({
      message: "Xác thực OTP thành công",
    });
  } catch (error) {
    if (error.message === "OTP_EXPIRED") {
      return res.status(400).json({
        message: "OTP đã hết hạn",
      });
    }

    if (error.message === "INVALID_OTP") {
      return res.status(400).json({
        message: "OTP không hợp lệ",
      });
    }

    console.error("Verify driver OTP error:", error);

    res.status(500).json({
      message: "Không thể xác thực OTP",
    });
  }
});

router.post("/driver/register", async (req, res) => {
  try {
    const result = await registerDriver(req.body);

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "PHONE_NOT_VERIFIED") {
      return res.status(400).json({
        message: "Số điện thoại chưa được xác thực OTP",
      });
    }

    if (error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Số điện thoại hoặc email đã được đăng ký",
      });
    }

    if (error.message === "DRIVER_CREATION_FAILED") {
      return res.status(503).json({
        message: "Không thể tạo hồ sơ tài xế",
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  }
});

router.post("/driver/set-password", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập số điện thoại và mật khẩu",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const result = await setDriverPassword(phone, password);

    res.json(result);
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản",
      });
    }

    if (error.message === "NOT_DRIVER") {
      return res.status(400).json({
        message: "Tài khoản không phải tài xế",
      });
    }

    if (error.message === "PASSWORD_ALREADY_SET") {
      return res.status(400).json({
        message: "Tài khoản đã có mật khẩu",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Không thể đặt mật khẩu",
    });
  }
});

module.exports = router;
