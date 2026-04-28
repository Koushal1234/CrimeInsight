const express = require("express");
const db = require("../db");
const { requireAuth, requireRoles } = require("../auth");
const {
  handleRouteError,
  optionalInteger,
  optionalString,
  requireDate,
  requireEnum,
  requireNonEmptyString,
  requirePhone,
  requirePincode,
  requireInteger,
} = require("../validation");

const router = express.Router();

const victimSelectSql = `
  SELECT
    v.victim_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.street,
    p.city,
    p.state,
    p.pincode,
    v.contact_number,
    MIN(cv.crime_id) AS associated_crime_id
  FROM VICTIM v
  JOIN PERSON p ON v.victim_id = p.person_id
  LEFT JOIN CRIME_VICTIM cv ON v.victim_id = cv.victim_id
  GROUP BY
    v.victim_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.street,
    p.city,
    p.state,
    p.pincode,
    v.contact_number
  ORDER BY v.victim_id
`;

router.use(requireAuth);

function validateVictimPayload(body) {
  return {
    first_name: requireNonEmptyString(body.first_name, "First name", 50),
    last_name: requireNonEmptyString(body.last_name, "Last name", 50),
    date_of_birth: requireDate(body.date_of_birth, "Date of birth"),
    gender: requireEnum(body.gender, "Gender", ["Male", "Female", "Other"]),
    street: optionalString(body.street, 100),
    city: requireNonEmptyString(body.city, "City", 50),
    state: requireNonEmptyString(body.state, "State", 50),
    pincode: requirePincode(body.pincode),
    contact_number: requirePhone(body.contact_number, "Contact number"),
    associated_crime_id: optionalInteger(body.associated_crime_id, "Associated crime ID"),
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(victimSelectSql);
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
      const payload = validateVictimPayload(req.body);
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
          INSERT INTO VICTIM (victim_id, contact_number)
          VALUES (?, ?)
        `,
        [personResult.insertId, payload.contact_number]
      );

      if (payload.associated_crime_id) {
        await connection.query(
          `
            INSERT INTO CRIME_VICTIM (crime_id, victim_id)
            VALUES (?, ?)
          `,
          [payload.associated_crime_id, personResult.insertId]
        );
      }

      await connection.commit();

      return res.json({
        message: "Victim added successfully",
        victim_id: personResult.insertId,
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
  "/:victimId",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    const connection = await db.promise().getConnection();

    try {
      const victimId = requireInteger(req.params.victimId, "Victim ID");
      const payload = validateVictimPayload(req.body);
      await connection.beginTransaction();

      await connection.query(
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
          victimId,
        ]
      );

      await connection.query(
        `
          UPDATE VICTIM
          SET contact_number = ?
          WHERE victim_id = ?
        `,
        [payload.contact_number, victimId]
      );

      await connection.query("DELETE FROM CRIME_VICTIM WHERE victim_id = ?", [victimId]);

      if (payload.associated_crime_id) {
        await connection.query(
          `
            INSERT INTO CRIME_VICTIM (crime_id, victim_id)
            VALUES (?, ?)
          `,
          [payload.associated_crime_id, victimId]
        );
      }

      await connection.commit();

      return res.json({
        message: "Victim updated successfully",
        victim_id: victimId,
      });
    } catch (error) {
      await connection.rollback();
      return handleRouteError(res, error);
    } finally {
      connection.release();
    }
  }
);

router.delete("/:victimId", requireRoles("Admin", "Officer"), async (req, res) => {
  try {
    const victimId = requireInteger(req.params.victimId, "Victim ID");
    await db.promise().query("DELETE FROM PERSON WHERE person_id = ?", [victimId]);
    return res.json({
      message: "Victim deleted successfully",
      victim_id: victimId,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
