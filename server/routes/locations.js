const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { handleRouteError } = require("../validation");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        location_id,
        area_name,
        city,
        crime_frequency,
        risk_status
      FROM LOCATION
      ORDER BY location_id
    `);

    return res.json(rows);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
