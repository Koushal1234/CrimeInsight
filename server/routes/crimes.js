const express = require("express");
const db = require("../db");
const { requireAuth, requireRoles } = require("../auth");
const {
  handleRouteError,
  optionalString,
  requireDate,
  requireEnum,
  requireInteger,
  requireNonEmptyString,
} = require("../validation");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        c.crime_id,
        c.crime_type,
        c.crime_date,
        c.severity_level,
        c.description,
        c.location_id,
        c.status,
        c.created_at,
        l.area_name,
        l.city,
        l.risk_status
      FROM CRIME c
      JOIN LOCATION l ON c.location_id = l.location_id
      ORDER BY c.crime_id
    `);

    return res.json(rows);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

function validateCrimePayload(body) {
  return {
    crime_type: requireNonEmptyString(body.crime_type, "Crime type", 50),
    crime_date: requireDate(body.crime_date, "Crime date"),
    severity_level: requireEnum(body.severity_level, "Severity level", [
      "Low",
      "Medium",
      "High",
    ]),
    description: optionalString(body.description, 1000),
    location_id: requireInteger(body.location_id, "Location"),
    status: requireEnum(body.status || "Open", "Crime status", [
      "Open",
      "Under Investigation",
      "Closed",
    ]),
  };
}

router.post(
  "/",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    try {
      const payload = validateCrimePayload(req.body);
      const [result] = await db.promise().query(
        `
          INSERT INTO CRIME (
            crime_type,
            crime_date,
            severity_level,
            description,
            location_id,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          payload.crime_type,
          payload.crime_date,
          payload.severity_level,
          payload.description,
          payload.location_id,
          payload.status,
        ]
      );

      return res.json({
        message: "Crime added successfully",
        crime_id: result.insertId,
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

router.put(
  "/:crimeId",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    try {
      const crimeId = requireInteger(req.params.crimeId, "Crime ID");
      const payload = validateCrimePayload(req.body);

      await db.promise().query(
        `
          UPDATE CRIME
          SET
            crime_type = ?,
            crime_date = ?,
            severity_level = ?,
            description = ?,
            location_id = ?,
            status = ?
          WHERE crime_id = ?
        `,
        [
          payload.crime_type,
          payload.crime_date,
          payload.severity_level,
          payload.description,
          payload.location_id,
          payload.status,
          crimeId,
        ]
      );

      return res.json({
        message: "Crime updated successfully",
        crime_id: crimeId,
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

router.delete("/:crimeId", requireRoles("Admin", "Officer"), async (req, res) => {
  try {
    const crimeId = requireInteger(req.params.crimeId, "Crime ID");
    await db.promise().query("DELETE FROM CRIME WHERE crime_id = ?", [crimeId]);
    return res.json({ message: "Crime deleted successfully", crime_id: crimeId });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
