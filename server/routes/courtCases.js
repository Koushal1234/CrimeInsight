const express = require("express");
const db = require("../db");
const { requireAuth, requireRoles } = require("../auth");
const {
  handleRouteError,
  requireDate,
  requireEnum,
  requireInteger,
  requireNonEmptyString,
} = require("../validation");

const router = express.Router();

router.use(requireAuth);

function validateCourtCasePayload(body) {
  return {
    crime_id: requireInteger(body.crime_id, "Crime ID"),
    court_name: requireNonEmptyString(body.court_name, "Court name", 80),
    hearing_date: requireDate(body.hearing_date, "Hearing date"),
    judge_name: requireNonEmptyString(body.judge_name, "Judge name", 80),
    verdict: requireEnum(body.verdict, "Verdict", ["Pending", "Closed"]),
  };
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
        SELECT
          case_no,
          crime_id,
          court_name,
          hearing_date,
          judge_name,
          verdict,
          created_at
        FROM COURT_CASE
        ORDER BY case_no
      `
    );

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
      const payload = validateCourtCasePayload(req.body);

      const [result] = await db.promise().query(
        `
          INSERT INTO COURT_CASE (
            crime_id,
            court_name,
            hearing_date,
            judge_name,
            verdict
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          payload.crime_id,
          payload.court_name,
          payload.hearing_date,
          payload.judge_name,
          payload.verdict,
        ]
      );

      return res.json({
        message: "Court case added successfully",
        case_no: result.insertId,
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

router.put(
  "/:caseNo",
  requireRoles("Admin", "Officer", "Investigator"),
  async (req, res) => {
    try {
      const caseNo = requireInteger(req.params.caseNo, "Case number");
      const payload = validateCourtCasePayload(req.body);

      await db.promise().query(
        `
          UPDATE COURT_CASE
          SET
            crime_id = ?,
            court_name = ?,
            hearing_date = ?,
            judge_name = ?,
            verdict = ?
          WHERE case_no = ?
        `,
        [
          payload.crime_id,
          payload.court_name,
          payload.hearing_date,
          payload.judge_name,
          payload.verdict,
          caseNo,
        ]
      );

      return res.json({
        message: "Court case updated successfully",
        case_no: caseNo,
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

router.delete("/:caseNo", requireRoles("Admin", "Officer"), async (req, res) => {
  try {
    const caseNo = requireInteger(req.params.caseNo, "Case number");
    await db.promise().query("DELETE FROM COURT_CASE WHERE case_no = ?", [caseNo]);
    return res.json({
      message: "Court case deleted successfully",
      case_no: caseNo,
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;
