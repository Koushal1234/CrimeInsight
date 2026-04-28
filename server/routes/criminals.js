const express = require("express");
const db = require("../db");
const { requireAuth, requireRoles } = require("../auth");
const {
  handleRouteError,
  optionalString,
  requireEnum,
  requireInteger,
  requireMinimumAgeDate,
  requireNonEmptyString,
  requirePincode,
} = require("../validation");

const router = express.Router();

const criminalSelectSql = `
  SELECT
    c.criminal_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.street,
    p.city,
    p.state,
    p.pincode,
    c.risk_level,
    CASE
      WHEN MAX(CASE WHEN cr.arrest_status = 'Arrested' THEN 1 ELSE 0 END) = 1 THEN 'Arrested'
      WHEN MAX(CASE WHEN cr.arrest_status = 'Released' THEN 1 ELSE 0 END) = 1 THEN 'Released'
      ELSE 'Active'
    END AS status
  FROM CRIMINAL c
  JOIN PERSON p ON c.criminal_id = p.person_id
  LEFT JOIN CRIME_RECORD cr ON c.criminal_id = cr.criminal_id
  GROUP BY
    c.criminal_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.street,
    p.city,
    p.state,
    p.pincode,
    c.risk_level
  ORDER BY c.criminal_id
`;

router.use(requireAuth);

function validateCriminalPayload(body) {
  return {
    first_name: requireNonEmptyString(body.first_name, "First name", 50),
    last_name: requireNonEmptyString(body.last_name, "Last name", 50),
    date_of_birth: requireMinimumAgeDate(
      body.date_of_birth,
      "Date of birth",
      18,
      "Criminal must be at least 18 years old"
    ),
    gender: requireEnum(body.gender, "Gender", ["Male", "Female", "Other"]),
    street: optionalString(body.street, 100),
    city: requireNonEmptyString(body.city, "City", 50),
    state: requireNonEmptyString(body.state, "State", 50),
    pincode: requirePincode(body.pincode),
    risk_level: requireEnum(body.risk_level, "Risk level", [
      "Low",
      "Medium",
      "High",
    ]),
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(criminalSelectSql);
    return res.json(rows);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post(
  "/",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    const connection = await db.promise().getConnection();

    try {
      const payload = validateCriminalPayload(req.body);
      await connection.beginTransaction();

      const [personResult] = await connection.query(
        `
          INSERT INTO PERSON (
            first_name,
            last_name,
            date_of_birth,
            gender,
            street,
            city,
            state,
            pincode
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          payload.first_name,
          payload.last_name,
          payload.date_of_birth,
          payload.gender,
          payload.street,
          payload.city,
          payload.state,
          payload.pincode,
        ]
      );

      await connection.query(
        `
          INSERT INTO CRIMINAL (criminal_id, risk_level)
          VALUES (?, ?)
        `,
        [personResult.insertId, payload.risk_level]
      );

      await connection.commit();

      return res.json({
        message: "Criminal added successfully",
        criminal_id: personResult.insertId,
      });
    } catch (error) {
      await connection.rollback();
      return handleRouteError(res, error);
    } finally {
      connection.release();
    }
  }
);

router.put(
  "/:criminalId",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    try {
      const criminalId = requireInteger(req.params.criminalId, "Criminal ID");
      const payload = validateCriminalPayload(req.body);

      await db.promise().query(
        `
          UPDATE PERSON
          SET
            first_name = ?,
            last_name = ?,
            date_of_birth = ?,
            gender = ?,
            street = ?,
            city = ?,
            state = ?,
            pincode = ?
          WHERE person_id = ?
        `,
        [
          payload.first_name,
          payload.last_name,
          payload.date_of_birth,
          payload.gender,
          payload.street,
          payload.city,
          payload.state,
          payload.pincode,
          criminalId,
        ]
      );

      await db.promise().query(
        `
          UPDATE CRIMINAL
          SET risk_level = ?
          WHERE criminal_id = ?
        `,
        [payload.risk_level, criminalId]
      );

      return res.json({
        message: "Criminal updated successfully",
        criminal_id: criminalId,
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

router.delete("/:criminalId", requireRoles("Admin", "Officer"), async (req, res) => {
  try {
    const criminalId = requireInteger(req.params.criminalId, "Criminal ID");
    await db.promise().query("DELETE FROM PERSON WHERE person_id = ?", [criminalId]);
    return res.json({
      message: "Criminal deleted successfully",
      criminal_id: criminalId,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
