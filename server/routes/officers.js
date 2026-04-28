const express = require("express");
const db = require("../db");
const {
  requireAuth,
  requireRoles,
  signAuthToken,
  verifyPassword,
} = require("../auth");
const {
  handleRouteError,
  requireNonEmptyString,
} = require("../validation");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const username = requireNonEmptyString(req.body.username, "Username", 50);
    const password = requireNonEmptyString(req.body.password, "Password", 255);

    const [rows] = await db.promise().query(
      `
        SELECT officer_id, username, password, role
        FROM OFFICER
        WHERE username = ?
        LIMIT 1
      `,
      [username]
    );

    const officer = rows[0];
    if (!officer || !verifyPassword(password, officer.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signAuthToken(officer);

    return res.json({
      message: "Login successful",
      token,
      officer: {
        officer_id: officer.officer_id,
        username: officer.username,
        role: officer.role,
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
        SELECT officer_id, username, role
        FROM OFFICER
        WHERE officer_id = ?
        LIMIT 1
      `,
      [req.user.officerId]
    );

    const officer = rows[0];
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }

    return res.json({ officer });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.get("/", requireAuth, requireRoles("Admin"), async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
        SELECT officer_id, username, role
        FROM OFFICER
        ORDER BY officer_id
      `
    );

    return res.json(rows);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
