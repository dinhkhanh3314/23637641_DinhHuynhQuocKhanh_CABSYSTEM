const grpc = require("@grpc/grpc-js");

function grpcErrorToHttp(error) {
  const statusMap = {
    [grpc.status.INVALID_ARGUMENT]: 400,
    [grpc.status.FAILED_PRECONDITION]: 400,
    [grpc.status.NOT_FOUND]: 404,
    [grpc.status.ALREADY_EXISTS]: 409,
    [grpc.status.PERMISSION_DENIED]: 403,
    [grpc.status.UNAUTHENTICATED]: 401,
    [grpc.status.UNAVAILABLE]: 503,
  };

  return {
    status: statusMap[error.code] || 500,
    message: error.details || error.message || "Internal server error",
  };
}

module.exports = { grpcErrorToHttp };
