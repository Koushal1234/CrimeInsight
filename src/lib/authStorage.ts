export type OfficerRole = "Admin" | "Officer" | "Investigator";

export interface AuthOfficer {
  officer_id: number;
  username: string;
  role: OfficerRole;
}

const AUTH_TOKEN_KEY = "crimeinsight-auth-token";
const AUTH_OFFICER_KEY = "crimeinsight-auth-officer";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readStoredAuthToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function readStoredOfficer() {
  if (!canUseStorage()) {
    return null;
  }

  const stored = window.localStorage.getItem(AUTH_OFFICER_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthOfficer;
  } catch {
    return null;
  }
}

export function persistAuthSession(token: string, officer: AuthOfficer) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_OFFICER_KEY, JSON.stringify(officer));
}

export function clearStoredAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_OFFICER_KEY);
}
