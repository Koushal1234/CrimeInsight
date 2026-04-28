const express = require("express");
const db = require("../db");
const { requireAuth, requireRoles } = require("../auth");
const {
  handleRouteError,
  requireEnum,
  requireInteger,
  requireNonEmptyString,
  requirePhone,
  requirePincode,
} = require("../validation");

const router = express.Router();

router.use(requireAuth);

function validatePoliceStationPayload(body) {
  return {
    station_name: requireNonEmptyString(body.station_name, "Station name", 50),
    contact_number: requirePhone(body.contact_number, "Contact number"),
    street: requireNonEmptyString(body.street, "Street", 100),
    city: requireNonEmptyString(body.city, "City", 50),
    state: requireNonEmptyString(body.state, "State", 50),
    pincode: requirePincode(body.pincode),
    location_id: requireInteger(body.location_id, "Location ID"),
    operational_status: requireEnum(body.operational_status, "Operational status", [
      "Operational",
      "Under Maintenance",
      "Closed",
    ]),
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
        SELECT
          ps.station_id,
          ps.station_name,
          ps.contact_number,
          ps.street,
          ps.city,
          ps.state,
          ps.pincode,
          ps.location_id,
          ps.operational_status,
          l.area_name,
          l.risk_status
        FROM POLICE_STATION ps
        JOIN LOCATION l ON ps.location_id = l.location_id
        ORDER BY ps.station_id
      `
    );

    return res.json(rows);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post("/", requireRoles("Admin", "Officer"), async (req, res) => {
  try {
    const payload = validatePoliceStationPayload(req.body);

    const [result] = await db.promise().query(
      `
        INSERT INTO POLICE_STATION (
          station_name,
          contact_number,
          street,
          city,
          state,
          pincode,
          location_id,
          operational_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.station_name,
        payload.contact_number,
        payload.street,
        payload.city,
        payload.state,
        payload.pincode,
        payload.location_id,
        payload.operational_status,
      ]
    );

    return res.json({
      message: "Police station added successfully",
      station_id: result.insertId,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.put("/:stationId", requireRoles("Admin", "Officer"), async (req, res) => {
  try {
    const stationId = requireInteger(req.params.stationId, "Station ID");
    const payload = validatePoliceStationPayload(req.body);

    await db.promise().query(
      `
        UPDATE POLICE_STATION
        SET
          station_name = ?,
          contact_number = ?,
          street = ?,
          city = ?,
          state = ?,
          pincode = ?,
          location_id = ?,
          operational_status = ?
        WHERE station_id = ?
      `,
      [
        payload.station_name,
        payload.contact_number,
        payload.street,
        payload.city,
        payload.state,
        payload.pincode,
        payload.location_id,
        payload.operational_status,
        stationId,
      ]
    );

    return res.json({
      message: "Police station updated successfully",
      station_id: stationId,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.delete("/:stationId", requireRoles("Admin"), async (req, res) => {
  try {
    const stationId = requireInteger(req.params.stationId, "Station ID");
    await db.promise().query("DELETE FROM POLICE_STATION WHERE station_id = ?", [stationId]);
    return res.json({
      message: "Police station deleted successfully",
      station_id: stationId,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
