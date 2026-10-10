const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured");
    return res.status(500).json({
      message: "Authentication is not configured",
    });
  }

  const authorization = req.get("authorization");
  const token = authorization && authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (error) {
    return res.status(401).json({
      message: error.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token",
    });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    return next();
  };
}

authMiddleware.requireRoles = requireRoles;

module.exports = authMiddleware;
