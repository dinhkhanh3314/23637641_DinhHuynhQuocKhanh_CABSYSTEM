const express = require("express");

const {
  createTrip,
  startTrip,
  completeTrip,
  getTrip,
  createReview,
  getTripHistory,
} = require("../services/tripService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const trip = await createTrip(req.body);

    res.status(201).json({
      message: "Tạo chuyến đi thành công",
      trip,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "TRIP_ALREADY_EXISTS") {
      return res.status(400).json({
        message: "Booking này đã có chuyến đi",
      });
    }

    res.status(500).json({
      message: "Không thể tạo chuyến đi",
    });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    let trip;

    if (status === "IN_PROGRESS") {
      trip = await startTrip(req.params.id);
    } else if (status === "COMPLETED") {
      trip = await completeTrip(req.params.id);
    } else {
      return res.status(400).json({
        message: "Trạng thái không hợp lệ",
      });
    }

    res.json({
      message: "Cập nhật trạng thái chuyến đi thành công",
      trip,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "TRIP_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy chuyến đi",
      });
    }

    if (error.message === "TRIP_CANNOT_START") {
      return res.status(400).json({
        message: "Chuyến đi không thể bắt đầu",
      });
    }

    if (error.message === "TRIP_CANNOT_COMPLETE") {
      return res.status(400).json({
        message: "Chuyến đi chưa thể kết thúc",
      });
    }

    res.status(500).json({
      message: "Không thể cập nhật trạng thái chuyến đi",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const trip = await getTrip(req.params.id);

    res.json({
      trip,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "TRIP_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy chuyến đi",
      });
    }

    res.status(500).json({
      message: "Không thể lấy thông tin chuyến đi",
    });
  }
});

router.post("/:id/reviews", async (req, res) => {
  try {
    const review = await createReview({
      tripId: req.params.id,
      reviewerId: req.body.reviewerId,
      revieweeId: req.body.revieweeId,
      reviewerType: req.body.reviewerType,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json({
      message: "Đánh giá chuyến đi thành công",
      review,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "TRIP_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy chuyến đi",
      });
    }

    if (error.message === "TRIP_NOT_COMPLETED") {
      return res.status(400).json({
        message: "Chỉ có thể đánh giá chuyến đi đã hoàn thành",
      });
    }

    if (error.message === "REVIEW_ALREADY_EXISTS") {
      return res.status(400).json({
        message: "Người dùng đã đánh giá chuyến đi này",
      });
    }

    res.status(500).json({
      message: "Không thể tạo đánh giá",
    });
  }
});

router.get("/history/:userType/:userId", async (req, res) => {
  try {
    const { userType, userId } = req.params;

    if (!["customer", "driver"].includes(userType)) {
      return res.status(400).json({
        message: "Loại người dùng không hợp lệ",
      });
    }

    const trips = await getTripHistory(userId, userType);

    res.json({
      trips,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy lịch sử chuyến đi",
    });
  }
});

module.exports = router;
