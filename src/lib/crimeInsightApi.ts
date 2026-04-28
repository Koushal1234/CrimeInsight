import {
  readStoredAuthToken,
  type AuthOfficer,
} from "@/lib/authStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";

export interface LocationApiRecord {
  location_id: number;
  area_name: string;
  city: string;
  crime_frequency: number;
  risk_status: "Low" | "Medium" | "High";
}

export interface CrimeApiRecord {
  crime_id: number;
  crime_type: string;
  crime_date: string;
  severity_level: "Low" | "Medium" | "High";
  description: string | null;
  location_id: number;
  area_name: string;
  city: string;
  risk_status: "Low" | "Medium" | "High";
  status: "Open" | "Under Investigation" | "Closed";
}

export interface CrimeRecordApiRecord {
  record_id: number;
  criminal_id: number;
  crime_id: number;
  arrest_status: "Arrested" | "Under Investigation" | "Released";
}

export interface CriminalApiRecord {
  criminal_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  street: string | null;
  city: string;
  state: string;
  pincode: string;
  risk_level: "Low" | "Medium" | "High";
  status: "Active" | "Arrested" | "Released";
}

export interface VictimApiRecord {
  victim_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  street: string | null;
  city: string;
  state: string;
  pincode: string;
  contact_number: string;
  associated_crime_id: number | null;
}

export interface CourtCaseApiRecord {
  case_no: number;
  crime_id: number;
  court_name: string;
  hearing_date: string;
  judge_name: string;
  verdict: "Pending" | "Closed";
  created_at: string;
}

export interface PatrolApiRecord {
  patrol_id: number;
  patrol_unit_name: string;
  officer_in_charge: string;
  shift_time: string;
  patrol_status: "Active" | "Inactive" | "Standby";
  location_id: number;
  area_name: string;
  city: string;
  dispatch_id: number | null;
  active_crime_id: number | null;
  assigned_by_officer_id: number | null;
  assigned_at: string | null;
}

export interface PoliceStationApiRecord {
  station_id: number;
  station_name: string;
  contact_number: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  location_id: number;
  operational_status: "Operational" | "Under Maintenance" | "Closed";
  area_name: string;
  risk_status: "Low" | "Medium" | "High";
}

export interface ReportsSummaryApiRecord {
  severityData: Array<{ name: "High" | "Medium" | "Low"; value: number }>;
  locationData: Array<{ name: string; count: number }>;
  riskData: Array<{ name: "High" | "Medium" | "Low"; value: number }>;
  arrestData: Array<{ name: "Active" | "Arrested" | "Released"; value: number }>;
}

async function request<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options ?? {};
  const token = skipAuth ? null : readStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T | { error?: string; message?: string }) : null;

  if (!response.ok) {
    const errorData = data as { error?: string; message?: string } | null;
    throw new Error(errorData?.error || errorData?.message || "Request failed");
  }

  return data as T;
}

export function parseEntityId(value: string) {
  const digits = value.match(/\d+/g)?.join("");
  return digits ? Number(digits) : Number.NaN;
}

export function dbShiftToUiShift(value: string) {
  switch (value) {
    case "Morning":
      return "06:00 - 14:00";
    case "Evening":
      return "14:00 - 22:00";
    case "Night":
      return "22:00 - 06:00";
    default:
      return value;
  }
}

export function uiShiftToDbShift(value: string) {
  if (value.includes("06:00") || value === "Morning") {
    return "Morning";
  }
  if (value.includes("14:00") || value === "Evening") {
    return "Evening";
  }
  return "Night";
}

export async function fetchLocations() {
  return request<LocationApiRecord[]>("/api/locations");
}

export async function loginOfficer(payload: { username: string; password: string }) {
  return request<{ message: string; token: string; officer: AuthOfficer }>(
    "/api/officers/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }
  );
}

export async function fetchCurrentOfficer() {
  return request<{ officer: AuthOfficer }>("/api/officers/me");
}

export async function fetchReportsSummary() {
  return request<ReportsSummaryApiRecord>("/api/reports/summary");
}

export async function fetchCrimes() {
  return request<CrimeApiRecord[]>("/api/crimes");
}

export async function createCrime(payload: {
  crime_type: string;
  crime_date: string;
  severity_level: string;
  description?: string;
  location_id: number;
  status?: string;
}) {
  return request("/api/crimes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCrime(
  crimeId: number,
  payload: {
    crime_type: string;
    crime_date: string;
    severity_level: string;
    description?: string;
    location_id: number;
    status?: string;
  }
) {
  return request<{ message: string; crime_id: number }>(`/api/crimes/${crimeId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCrime(crimeId: number) {
  return request<{ message: string; crime_id: number }>(`/api/crimes/${crimeId}`, {
    method: "DELETE",
  });
}

export async function fetchCrimeRecords() {
  return request<CrimeRecordApiRecord[]>("/api/crime-records");
}

export async function createCrimeRecord(payload: {
  criminal_id: number;
  crime_id: number;
  arrest_status: "Arrested" | "Under Investigation" | "Released";
}) {
  return request<{ message: string; record_id: number }>("/api/crime-records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCrimeRecord(recordId: number, payload: { arrest_status: string }) {
  return request(`/api/crime-records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchCriminals() {
  return request<CriminalApiRecord[]>("/api/criminals");
}

export async function createCriminal(payload: Record<string, unknown>) {
  return request("/api/criminals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCriminalRecord(
  criminalId: number,
  payload: Record<string, unknown>
) {
  return request(`/api/criminals/${criminalId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCriminalRecord(criminalId: number) {
  return request<{ message: string; criminal_id: number }>(`/api/criminals/${criminalId}`, {
    method: "DELETE",
  });
}

export async function fetchVictims() {
  return request<VictimApiRecord[]>("/api/victims");
}

export async function createVictim(payload: Record<string, unknown>) {
  return request("/api/victims", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateVictimRecord(
  victimId: number,
  payload: Record<string, unknown>
) {
  return request(`/api/victims/${victimId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteVictimRecord(victimId: number) {
  return request<{ message: string; victim_id: number }>(`/api/victims/${victimId}`, {
    method: "DELETE",
  });
}

export async function fetchCourtCases() {
  return request<CourtCaseApiRecord[]>("/api/court-cases");
}

export async function createCourtCase(payload: Record<string, unknown>) {
  return request("/api/court-cases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCourtCaseRecord(
  caseNo: number,
  payload: Record<string, unknown>
) {
  return request(`/api/court-cases/${caseNo}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCourtCaseRecord(caseNo: number) {
  return request<{ message: string; case_no: number }>(`/api/court-cases/${caseNo}`, {
    method: "DELETE",
  });
}

export async function fetchPatrols() {
  return request<PatrolApiRecord[]>("/api/patrol");
}

export async function createPatrol(payload: Record<string, unknown>) {
  return request("/api/patrol", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePatrolRecord(
  patrolId: number,
  payload: Record<string, unknown>
) {
  return request(`/api/patrol/${patrolId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePatrolRecord(patrolId: number) {
  return request<{ message: string; patrol_id: number }>(`/api/patrol/${patrolId}`, {
    method: "DELETE",
  });
}

export async function fetchPoliceStations() {
  return request<PoliceStationApiRecord[]>("/api/police-stations");
}

export async function createPoliceStation(payload: Record<string, unknown>) {
  return request("/api/police-stations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePoliceStationRecord(
  stationId: number,
  payload: Record<string, unknown>
) {
  return request(`/api/police-stations/${stationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePoliceStationRecord(stationId: number) {
  return request<{ message: string; station_id: number }>(
    `/api/police-stations/${stationId}`,
    {
      method: "DELETE",
    }
  );
}
