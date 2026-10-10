const express = require("express");

const {
  registerCustomer,
  loginCustomer,
  sendDriverOtp,
  verifyDriverOtp,
  registerDriver,
  setDriverPassword,
} = require("../grpc/authClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

router.post("/register", async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    if (!phone || !email || !password) {
      return res.status(400).json({
        message: "Phone, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const user = await registerCustomer({ phone, email, password });
    res.status(201).json(user);
  } catch (error) {
    handleError(res, error);
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

    const user = await loginCustomer({ identifier, password });
    res.json(user);
  } catch (error) {
    handleError(res, error);
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

    const result = await sendDriverOtp(phone);

    if (process.env.NODE_ENV === "production") {
      delete result.otp;
    }

    res.json(result);
  } catch (error) {
    handleError(res, error);
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

    const result = await verifyDriverOtp(phone, otp);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/driver/register", async (req, res) => {
  try {
    const result = await registerDriver({
      phone: req.body.phone,
      email: req.body.email,
      full_name: req.body.fullName,
      license_no: req.body.licenseNo,
      vehicle_type: req.body.vehicleType,
      plate_number: req.body.plateNumber,
      brand: req.body.brand,
      model: req.body.model,
      color: req.body.color,
    });

    res.status(201).json(result);
  } catch (error) {
    handleError(res, error);
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

    if (password.length < 8) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      });
    }

    const result = await setDriverPassword(phone, password);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
