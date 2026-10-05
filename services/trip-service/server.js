require("dotenv").config();

const express = require("express");
const connectDatabase = require("./config/database");
const tripRoutes = require("./routes/trip");

const app = express();

app.use(express.json());
app.use("/trips", tripRoutes);

app.get("/health", (req, res) => {
  res.json({
    service: "trip-service",
    status: "OK",
  });
});

const PORT = process.env.PORT || 3005;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Trip Service running on port ${PORT}`);
  });
}

startServer();
