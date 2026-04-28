const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");
const { handleRouteError } = require("../validation");

const router = express.Router();

router.use(requireAuth);

router.get("/summary", async (_req, res) => {
  try {
    const dbp = db.promise();

    const [severityRows] = await dbp.query(`
      SELECT severity_level AS name, COUNT(*) AS value
      FROM CRIME
      GROUP BY severity_level
    `);

    const [locationRows] = await dbp.query(`
      SELECT
        CONCAT(area_name, ', ', city) AS name,
        COUNT(c.crime_id) AS count
      FROM LOCATION l
      LEFT JOIN CRIME c ON c.location_id = l.location_id
      GROUP BY l.location_id, l.area_name, l.city
      HAVING COUNT(c.crime_id) > 0
      ORDER BY count DESC, name ASC
    `);

    const [riskRows] = await dbp.query(`
      SELECT risk_level AS name, COUNT(*) AS value
      FROM CRIMINAL
      GROUP BY risk_level
    `);

    const [arrestRows] = await dbp.query(`
      SELECT
        derived_status AS name,
        COUNT(*) AS value
      FROM (
        SELECT
          c.criminal_id,
          CASE
            WHEN MAX(CASE WHEN cr.arrest_status = 'Arrested' THEN 1 ELSE 0 END) = 1 THEN 'Arrested'
            WHEN MAX(CASE WHEN cr.arrest_status = 'Released' THEN 1 ELSE 0 END) = 1 THEN 'Released'
            ELSE 'Active'
          END AS derived_status
        FROM CRIMINAL c
        LEFT JOIN CRIME_RECORD cr ON cr.criminal_id = c.criminal_id
        GROUP BY c.criminal_id
      ) AS derived
      GROUP BY derived_status
    `);

    return res.json({
      severityData: severityRows,
      locationData: locationRows,
      riskData: riskRows,
      arrestData: arrestRows,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
