export interface Criminal {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  riskLevel: "Low" | "Medium" | "High";
  status: "Active" | "Arrested" | "Released";
}

export interface Crime {
  id: string;
  type: string;
  date: string;
  severity: "Low" | "Medium" | "High";
  location: string;
  status: "Open" | "Under Investigation" | "Closed";
}

export interface CrimeRecord {
  id: string;
  criminalId: string;
  crimeId: string;
  arrestStatus: "Arrested" | "Under Investigation" | "Released";
}

export interface Victim {
  id: string;
  name: string;
  contact: string;
  associatedCrime: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  age?: number;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface CourtCase {
  id: string;
  caseNumber: string;
  crimeLinked: string;
  courtName: string;
  judgeName: string;
  hearingDate: string;
  verdict: "Pending" | "Closed";
}

export interface PatrolUnit {
  id: string;
  unitName: string;
  officerInCharge: string;
  shiftTime: string;
  status: "Active" | "Standby" | "Off Duty";
  assignedLocation: string;
  activeCrimeId?: string;
}

export const criminals: Criminal[] = [
  { id: "CR-001", firstName: "Marcus", lastName: "Vega", dob: "1985-03-12", gender: "Male", address: "42 Harbor St", city: "Metro City", riskLevel: "High", status: "Active" },
  { id: "CR-002", firstName: "Elena", lastName: "Torres", dob: "1990-07-22", gender: "Female", address: "88 Oak Lane", city: "Riverside", riskLevel: "Medium", status: "Active" },
  { id: "CR-003", firstName: "James", lastName: "Holden", dob: "1978-11-05", gender: "Male", address: "15 Pine Ave", city: "Lakewood", riskLevel: "Low", status: "Released" },
  { id: "CR-004", firstName: "Dmitri", lastName: "Volkov", dob: "1982-01-30", gender: "Male", address: "7 Central Blvd", city: "Metro City", riskLevel: "High", status: "Arrested" },
  { id: "CR-005", firstName: "Sophia", lastName: "Chen", dob: "1995-09-18", gender: "Female", address: "201 Elm Rd", city: "Oakville", riskLevel: "Medium", status: "Active" },
];

export const crimes: Crime[] = [
  { id: "CM-001", type: "Armed Robbery", date: "2025-12-15", severity: "High", location: "Metro City Downtown", status: "Under Investigation" },
  { id: "CM-002", type: "Fraud", date: "2025-11-20", severity: "Medium", location: "Riverside Financial District", status: "Open" },
  { id: "CM-003", type: "Vandalism", date: "2026-01-08", severity: "Low", location: "Lakewood Park", status: "Closed" },
  { id: "CM-004", type: "Drug Trafficking", date: "2026-01-25", severity: "High", location: "Metro City Harbor", status: "Under Investigation" },
  { id: "CM-005", type: "Assault", date: "2026-02-10", severity: "Medium", location: "Oakville Station", status: "Open" },
];

export const crimeRecords: CrimeRecord[] = [
  { id: "CRR-001", criminalId: "CR-001", crimeId: "CM-001", arrestStatus: "Under Investigation" },
  { id: "CRR-002", criminalId: "CR-001", crimeId: "CM-004", arrestStatus: "Under Investigation" },
  { id: "CRR-003", criminalId: "CR-002", crimeId: "CM-002", arrestStatus: "Released" },
  { id: "CRR-004", criminalId: "CR-004", crimeId: "CM-001", arrestStatus: "Arrested" },
  { id: "CRR-005", criminalId: "CR-005", crimeId: "CM-005", arrestStatus: "Released" },
];

export const victims: Victim[] = [
  { id: "V-001", name: "Sarah Mitchell", contact: "+1-555-0142", associatedCrime: "CM-001", age: 34, gender: "Female" },
  { id: "V-002", name: "Robert Kim", contact: "+1-555-0198", associatedCrime: "CM-002", age: 45, gender: "Male" },
  { id: "V-003", name: "Linda Graves", contact: "+1-555-0267", associatedCrime: "CM-005", age: 28, gender: "Female" },
];

export const courtCases: CourtCase[] = [
  { id: "CC-001", caseNumber: "CASE-2025-4401", crimeLinked: "CM-001", judgeName: "Hon. Patricia Wells", hearingDate: "2026-03-15", verdict: "Pending" },
  { id: "CC-002", caseNumber: "CASE-2025-4402", crimeLinked: "CM-003", judgeName: "Hon. Michael Torres", hearingDate: "2026-02-28", verdict: "Closed" },
  { id: "CC-003", caseNumber: "CASE-2026-4501", crimeLinked: "CM-004", judgeName: "Hon. Rebecca Shaw", hearingDate: "2026-04-10", verdict: "Pending" },
];

export const patrolUnits: PatrolUnit[] = [
  { id: "PU-001", unitName: "Alpha-7", officerInCharge: "Sgt. David Park", shiftTime: "06:00 - 14:00", status: "Active", assignedLocation: "Metro City Downtown" },
  { id: "PU-002", unitName: "Bravo-3", officerInCharge: "Lt. Maria Santos", shiftTime: "14:00 - 22:00", status: "Active", assignedLocation: "Riverside" },
  { id: "PU-003", unitName: "Charlie-9", officerInCharge: "Cpl. Alex Turner", shiftTime: "22:00 - 06:00", status: "Standby", assignedLocation: "Lakewood" },
  { id: "PU-004", unitName: "Delta-1", officerInCharge: "Sgt. Rachel Nguyen", shiftTime: "06:00 - 14:00", status: "Off Duty", assignedLocation: "Oakville" },
];

export interface PoliceStation {
  id: string;
  stationName: string;
  contact: string;
  locationId: string;
  operationalStatus: "Operational" | "Under Maintenance" | "Closed";
  address: string;
  city: string;
  state: string;
  pincode: string;
  assignedPatrolUnits: string[];
  totalCrimes: number;
  riskLevel: "Low" | "Medium" | "High";
}

export const policeStations: PoliceStation[] = [
  { id: "PS-001", stationName: "Metro Central Precinct", contact: "+1-555-1000", locationId: "LOC-001", operationalStatus: "Operational", address: "100 Justice Blvd", city: "Metro City", assignedPatrolUnits: ["Alpha-7"], totalCrimes: 42, riskLevel: "High" },
  { id: "PS-002", stationName: "Riverside District Station", contact: "+1-555-2000", locationId: "LOC-002", operationalStatus: "Operational", address: "55 River Ave", city: "Riverside", assignedPatrolUnits: ["Bravo-3"], totalCrimes: 18, riskLevel: "Medium" },
  { id: "PS-003", stationName: "Lakewood Outpost", contact: "+1-555-3000", locationId: "LOC-003", operationalStatus: "Under Maintenance", address: "12 Lake Dr", city: "Lakewood", assignedPatrolUnits: ["Charlie-9"], totalCrimes: 7, riskLevel: "Low" },
  { id: "PS-004", stationName: "Oakville Sub-Station", contact: "+1-555-4000", locationId: "LOC-004", operationalStatus: "Operational", address: "88 Oak Crest Rd", city: "Oakville", assignedPatrolUnits: ["Delta-1"], totalCrimes: 12, riskLevel: "Medium" },
];
