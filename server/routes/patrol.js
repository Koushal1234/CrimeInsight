const express = require("express");
const db = require("../db");
const { requireAuth, requireRoles } = require("../auth");
const {
  handleRouteError,
  optionalInteger,
  optionalString,
  requireEnum,
  requireInteger,
  requireNonEmptyString,
} = require("../validation");

const router = express.Router();

router.use(requireAuth);

function validatePatrolPayload(body) {
  return {
    patrol_unit_name: requireNonEmptyString(body.patrol_unit_name, "Patrol unit name", 50),
    officer_in_charge: requireNonEmptyString(body.officer_in_charge, "Officer in charge", 50),
    shift_time: requireEnum(body.shift_time, "Shift time", ["Morning", "Evening", "Night"]),
    patrol_status: requireEnum(body.patrol_status, "Patrol status", [
      "Active",
      "Inactive",
      "Standby",
    ]),
    location_id: requireInteger(body.location_id, "Location ID"),
  };
}

function validatePatrolUpdatePayload(body) {
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(body, "patrol_unit_name")) {
    payload.patrol_unit_name = requireNonEmptyString(
      body.patrol_unit_name,
      "Patrol unit name",
      50
    );
  }

  if (Object.prototype.hasOwnProperty.call(body, "officer_in_charge")) {
    payload.officer_in_charge = requireNonEmptyString(
      body.officer_in_charge,
      "Officer in charge",
      50
    );
  }

  if (Object.prototype.hasOwnProperty.call(body, "shift_time")) {
    payload.shift_time = requireEnum(body.shift_time, "Shift time", [
      "Morning",
      "Evening",
      "Night",
    ]);
  }

  if (Object.prototype.hasOwnProperty.call(body, "patrol_status")) {
    payload.patrol_status = requireEnum(body.patrol_status, "Patrol status", [
      "Active",
      "Inactive",
      "Standby",
    ]);
  }

  if (Object.prototype.hasOwnProperty.call(body, "location_id")) {
    payload.location_id = requireInteger(body.location_id, "Location ID");
  }

  if (Object.prototype.hasOwnProperty.call(body, "active_crime_id")) {
    payload.active_crime_id =
      body.active_crime_id == null || body.active_crime_id === ""
        ? null
        : requireInteger(body.active_crime_id, "Active crime ID");
  }

  return payload;
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
        SELECT
          p.patrol_id,
          p.patrol_unit_name,
          p.officer_in_charge,
          p.shift_time,
          p.patrol_status,
          p.location_id,
          l.area_name,
          l.city,
          pd.dispatch_id,
          pd.crime_id AS active_crime_id,
          pd.assigned_by_officer_id,
          pd.assigned_at
        FROM PATROL p
        JOIN LOCATION l ON p.location_id = l.location_id
        LEFT JOIN PATROL_DISPATCH pd ON p.patrol_id = pd.patrol_id
        ORDER BY p.patrol_id
      `
    );

    return res.json(rows);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post("/", requireRoles("Admin", "Officer"), async (req, res) => {
  try {
    const payload = validatePatrolPayload(req.body);

    const [result] = await db.promise().query(
      `
        INSERT INTO PATROL (
          patrol_unit_name,
          officer_in_charge,
          shift_time,
          patrol_status,
          location_id
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        payload.patrol_unit_name,
        payload.officer_in_charge,
        payload.shift_time,
        payload.patrol_status,
        payload.location_id,
      ]
    );

    return res.json({
      message: "Patrol added successfully",
      patrol_id: result.insertId,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.put("/:patrolId", requireRoles("Admin", "Officer"), async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const patrolId = requireInteger(req.params.patrolId, "Patrol ID");
    const payload = validatePatrolUpdatePayload(req.body);
    await connection.beginTransaction();

    const fieldUpdates = [];
    const params = [];

    if (payload.patrol_unit_name !== undefined) {
      fieldUpdates.push("patrol_unit_name = ?");
      params.push(payload.patrol_unit_name);
    }
    if (payload.officer_in_charge !== undefined) {
      fieldUpdates.push("officer_in_charge = ?");
      params.push(payload.officer_in_charge);
    }
    if (payload.shift_time !== undefined) {
      fieldUpdates.push("shift_time = ?");
      params.push(payload.shift_time);
    }
    if (payload.patrol_status !== undefined) {
      fieldUpdates.push("patrol_status = ?");
      params.push(payload.patrol_status);
    }
    if (payload.location_id !== undefined) {
      fieldUpdates.push("location_id = ?");
      params.push(payload.location_id);
    }

    if (fieldUpdates.length > 0) {
      await connection.query(
        `
          UPDATE PATROL
          SET ${fieldUpdates.join(", ")}
          WHERE patrol_id = ?
        `,
        [...params, patrolId]
      );
    }

    if (Object.prototype.hasOwnProperty.call(payload, "active_crime_id")) {
      if (payload.active_crime_id == null) {
        await connection.query("DELETE FROM PATROL_DISPATCH WHERE patrol_id = ?", [patrolId]);
      } else {
        await connection.query(
          `
            INSERT INTO PATROL_DISPATCH (
              patrol_id,
              crime_id,
              assigned_by_officer_id
            )
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
              crime_id = VALUES(crime_id),
              assigned_by_officer_id = VALUES(assigned_by_officer_id),
              assigned_at = CURRENT_TIMESTAMP
          `,
          [patrolId, payload.active_crime_id, req.user.officerId]
        );
      }
    }

    await connection.commit();

    return res.json({
      message: "Patrol updated successfully",
      patrol_id: patrolId,
    });
  } catch (error) {
    await connection.rollback();
    return handleRouteError(res, error);
  } finally {
    connection.release();
  }
});

router.delete("/:patrolId", requireRoles("Admin"), async (req, res) => {
  try {
    const patrolId = requireInteger(req.params.patrolId, "Patrol ID");
    await db.promise().query("DELETE FROM PATROL WHERE patrol_id = ?", [patrolId]);
    return res.json({
      message: "Patrol deleted successfully",
      patrol_id: patrolId,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
