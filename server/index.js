const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const { migrateOfficerPasswords } = require("./auth");
const { bootstrapDatabase } = require("./bootstrap");

const crimesRoute = require("./routes/crimes");
const crimeRecordsRoute = require("./routes/crimeRecords");
const criminalsRoute = require("./routes/criminals");
const victimsRoute = require("./routes/victims");
const courtCasesRoute = require("./routes/courtCases");
const patrolRoute = require("./routes/patrol");
const policeStationsRoute = require("./routes/policeStations");
const officersRoute = require("./routes/officers");
const locationsRoute = require("./routes/locations");
const reportsRoute = require("./routes/reports");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/crimes", crimesRoute);
app.use("/api/crime-records", crimeRecordsRoute);
app.use("/api/criminals", criminalsRoute);
app.use("/api/victims", victimsRoute);
app.use("/api/court-cases", courtCasesRoute);
app.use("/api/patrol", patrolRoute);
app.use("/api/police-stations", policeStationsRoute);
app.use("/api/officers", officersRoute);
app.use("/api/locations", locationsRoute);
app.use("/api/reports", reportsRoute);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await bootstrapDatabase(db, migrateOfficerPasswords);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to bootstrap server:", error);
    process.exit(1);
  }
}

void startServer();
