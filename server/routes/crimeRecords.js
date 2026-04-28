const express = require("express");
const db = require("../db");
const { requireAuth, requireRoles } = require("../auth");
const {
  handleRouteError,
  requireEnum,
  requireInteger,
} = require("../validation");

const router = express.Router();

router.use(requireAuth);

function validateArrestStatus(value) {
  return requireEnum(value, "Arrest status", [
    "Arrested",
    "Under Investigation",
    "Released",
  ]);
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        record_id,
        criminal_id,
        crime_id,
        arrest_status
      FROM CRIME_RECORD
      ORDER BY record_id
    `);

    return res.json(rows);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post(
  "/",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    try {
      const criminalId = requireInteger(req.body.criminal_id, "Criminal ID");
      const crimeId = requireInteger(req.body.crime_id, "Crime ID");
      const arrestStatus = validateArrestStatus(req.body.arrest_status);

      const [existingRows] = await db.promise().query(
        `
          SELECT record_id
          FROM CRIME_RECORD
          WHERE criminal_id = ? AND crime_id = ?
          LIMIT 1
        `,
        [criminalId, crimeId]
      );

      if (existingRows.length > 0) {
        return res.status(409).json({
          message: "This criminal is already linked to the selected crime",
        });
      }

      const [result] = await db.promise().query(
        `
          INSERT INTO CRIME_RECORD (criminal_id, crime_id, arrest_status)
          VALUES (?, ?, ?)
        `,
        [criminalId, crimeId, arrestStatus]
      );

      return res.json({
        message: "Crime record created successfully",
        record_id: result.insertId,
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

router.put(
  "/:recordId",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    try {
      const recordId = requireInteger(req.params.recordId, "Record ID");
      const arrestStatus = validateArrestStatus(req.body.arrest_status);

      await db.promise().query(
        `
          UPDATE CRIME_RECORD
          SET arrest_status = ?
          WHERE record_id = ?
        `,
        [arrestStatus, recordId]
      );

      return res.json({
        message: "Crime record updated successfully",
        record_id: recordId,
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

router.delete(
  "/:recordId",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    try {
      const recordId = requireInteger(req.params.recordId, "Record ID");
      await db.promise().query("DELETE FROM CRIME_RECORD WHERE record_id = ?", [
        recordId,
      ]);
      return res.json({
        message: "Crime record deleted successfully",
        record_id: recordId,
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

module.exports = router;
