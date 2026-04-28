class ValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ValidationError";
    this.status = status;
  }
}

function handleRouteError(res, error) {
  if (error instanceof ValidationError) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: error.message || "Internal server error" });
}

function requireNonEmptyString(value, field, maxLength = 255) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${field} is required`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${field} must be at most ${maxLength} characters`);
  }

  return trimmed;
}

function optionalString(value, maxLength = 255) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError("Invalid string value");
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ValidationError(`Value must be at most ${maxLength} characters`);
  }

  return trimmed;
}

function requireEnum(value, field, values) {
  if (!values.includes(value)) {
    throw new ValidationError(`${field} must be one of: ${values.join(", ")}`);
  }

  return value;
}

function requireInteger(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${field} must be a positive integer`);
  }

  return parsed;
}

function optionalInteger(value, field) {
  if (value == null || value === "") {
    return null;
  }

  return requireInteger(value, field);
}

function requireDate(value, field) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError(`${field} must be in YYYY-MM-DD format`);
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${field} is invalid`);
  }

  return value;
}

function requireMinimumAgeDate(value, field, minimumAge, message) {
  const normalized = requireDate(value, field);
  const date = new Date(`${normalized}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }

  if (age < minimumAge) {
    throw new ValidationError(
      message || `${field} must represent an age of at least ${minimumAge} years`
    );
  }

  return normalized;
}

function requirePhone(value, field) {
  const normalized = requireNonEmptyString(value, field, 15).replace(/\D/g, "");
  if (normalized.length < 10 || normalized.length > 15) {
    throw new ValidationError(`${field} must contain 10 to 15 digits`);
  }

  return normalized;
}

function requirePincode(value, field = "Pincode") {
  const normalized = requireNonEmptyString(value, field, 6);

  if (!/^\d{6}$/.test(normalized)) {
    throw new ValidationError(`${field} must be exactly 6 digits`);
  }

  return normalized;
}

module.exports = {
  ValidationError,
  handleRouteError,
  requireNonEmptyString,
  optionalString,
  requireEnum,
  requireInteger,
  optionalInteger,
  requireDate,
  requireMinimumAgeDate,
  requirePhone,
  requirePincode,
};
