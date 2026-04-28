const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 60 * 60 * 8;
const PASSWORD_PREFIX = "scrypt";
const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error("AUTH_SECRET is required");
}

function base64urlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${PASSWORD_PREFIX}$${salt}$${derivedKey}`;
}

function isHashedPassword(value) {
  return typeof value === "string" && value.startsWith(`${PASSWORD_PREFIX}$`);
}

function verifyPassword(password, storedValue) {
  if (!isHashedPassword(storedValue)) {
    return password === storedValue;
  }

  const [, salt, expectedHash] = storedValue.split("$");
  const actualHash = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (actualHash.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualHash, expectedBuffer);
}

function signAuthToken(officer) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    officerId: officer.officer_id,
    username: officer.username,
    role: officer.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", authSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyAuthToken(token) {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", authSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return null;
    }

    const payload = JSON.parse(base64urlDecode(encodedPayload));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function migrateOfficerPasswords(db) {
  const dbp = db.promise();
  const [rows] = await dbp.query(
    "SELECT officer_id, password FROM OFFICER"
  );

  for (const row of rows) {
    if (isHashedPassword(row.password)) {
      continue;
    }

    const passwordHash = hashPassword(row.password);
    await dbp.query("UPDATE OFFICER SET password = ? WHERE officer_id = ?", [
      passwordHash,
      row.officer_id,
    ]);
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  req.user = payload;
  return next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    return next();
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  signAuthToken,
  verifyAuthToken,
  migrateOfficerPasswords,
  requireAuth,
  requireRoles,
};
