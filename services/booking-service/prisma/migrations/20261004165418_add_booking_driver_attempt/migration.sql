-- CreateTable
CREATE TABLE "booking_driver_attempt" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "driver_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_driver_attempt_pkey" PRIMARY KEY ("id")
);
