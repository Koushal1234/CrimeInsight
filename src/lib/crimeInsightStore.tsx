import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type CourtCase,
  type Crime,
  type CrimeRecord,
  type Criminal,
  type PatrolUnit,
  type PoliceStation,
  type Victim,
} from "@/lib/mockData";
import {
  type CourtCaseApiRecord,
  type CrimeApiRecord,
  type CrimeRecordApiRecord,
  type CriminalApiRecord,
  type LocationApiRecord,
  type PatrolApiRecord,
  type PoliceStationApiRecord,
  type VictimApiRecord,
  createCourtCase,
  createCrime,
  createCrimeRecord,
  createCriminal,
  createPatrol,
  createPoliceStation,
  createVictim,
  dbShiftToUiShift,
  deleteCourtCaseRecord,
  deleteCrime,
  deleteCriminalRecord,
  deletePatrolRecord,
  deletePoliceStationRecord,
  deleteVictimRecord,
  fetchCourtCases,
  fetchCrimeRecords,
  fetchCrimes,
  fetchCriminals,
  fetchLocations,
  fetchPatrols,
  fetchPoliceStations,
  fetchVictims,
  parseEntityId,
  uiShiftToDbShift,
  updateCrime,
  updateCourtCaseRecord,
  updateCrimeRecord,
  updateCriminalRecord,
  updatePatrolRecord,
  updatePoliceStationRecord,
  updateVictimRecord,
} from "@/lib/crimeInsightApi";

function mapLocationDisplay(areaName: string, city: string) {
  return `${areaName}, ${city}`;
}

function stringifyId(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

function toDateOnly(value: string | null | undefined) {
  return value ? String(value).slice(0, 10) : "";
}

export interface LocationOption {
  id: number;
  areaName: string;
  city: string;
  riskStatus: "Low" | "Medium" | "High";
  crimeFrequency: number;
  displayName: string;
}

interface CrimeInsightState {
  criminals: Criminal[];
  crimes: Crime[];
  crimeRecords: CrimeRecord[];
  victims: Victim[];
  courtCases: CourtCase[];
  patrolUnits: PatrolUnit[];
  policeStations: PoliceStation[];
  dispatchAssignments: Record<string, string>;
  locations: LocationOption[];
  isLoading: boolean;
  loadError: string | null;
}

interface CrimeInput {
  type: string;
  date: string;
  severity: Crime["severity"];
  location: string;
  status?: Crime["status"];
}

interface CriminalInput {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  riskLevel: Criminal["riskLevel"];
}

interface VictimInput {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact: string;
  associatedCrime: string;
}

interface CourtCaseInput {
  crimeLinked: string;
  courtName: string;
  judgeName: string;
  hearingDate: string;
  verdict?: CourtCase["verdict"];
}

interface PatrolInput {
  unitName: string;
  officerInCharge: string;
  shiftTime: string;
  status: PatrolUnit["status"];
  assignedLocation: string;
}

interface PoliceStationInput {
  stationName: string;
  city: string;
  state: string;
  pincode: string;
  contact: string;
  address: string;
  operationalStatus: PoliceStation["operationalStatus"];
  locationReference: string;
}

interface CrimeInsightContextValue extends CrimeInsightState {
  addCrime: (input: CrimeInput) => Promise<void>;
  updateCrime: (id: string, input: CrimeInput) => Promise<void>;
  removeCrime: (id: string) => Promise<void>;
  addCriminal: (input: CriminalInput) => Promise<void>;
  updateCriminal: (id: string, updates: CriminalInput) => Promise<void>;
  removeCriminal: (id: string) => Promise<void>;
  addCrimeRecordLink: (
    criminalId: string,
    crimeId: string,
    arrestStatus: CrimeRecord["arrestStatus"]
  ) => Promise<void>;
  updateCrimeRecordArrestStatus: (
    id: string,
    arrestStatus: CrimeRecord["arrestStatus"]
  ) => Promise<void>;
  addVictim: (input: VictimInput) => Promise<void>;
  updateVictim: (id: string, input: VictimInput) => Promise<void>;
  removeVictim: (id: string) => Promise<void>;
  addCourtCase: (input: CourtCaseInput) => Promise<void>;
  updateCourtCase: (id: string, input: CourtCaseInput) => Promise<void>;
  removeCourtCase: (id: string) => Promise<void>;
  addPatrol: (input: PatrolInput) => Promise<void>;
  updatePatrol: (id: string, updates: Partial<PatrolUnit>) => Promise<void>;
  assignPatrolDispatch: (patrolId: string, crimeId: string) => Promise<void>;
  removePatrol: (id: string) => Promise<void>;
  addPoliceStation: (input: PoliceStationInput) => Promise<void>;
  updatePoliceStation: (id: string, input: PoliceStationInput) => Promise<void>;
  removePoliceStation: (id: string) => Promise<void>;
  reloadData: () => Promise<void>;
}

const initialState: CrimeInsightState = {
  criminals: [],
  crimes: [],
  crimeRecords: [],
  victims: [],
  courtCases: [],
  patrolUnits: [],
  policeStations: [],
  dispatchAssignments: {},
  locations: [],
  isLoading: true,
  loadError: null,
};

const CrimeInsightContext = createContext<CrimeInsightContextValue | null>(null);

export function CrimeInsightProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CrimeInsightState>(initialState);

  const resolveLocation = useCallback(
    (reference: string) => {
      const trimmed = reference.trim();
      return state.locations.find(
        (location) =>
          location.displayName === trimmed ||
          location.areaName === trimmed ||
          String(location.id) === trimmed
      );
    },
    [state.locations]
  );

  const reloadData = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, loadError: null }));

    try {
      const [
        rawLocations,
        rawCrimes,
        rawCrimeRecords,
        rawCriminals,
        rawVictims,
        rawCourtCases,
        rawPatrols,
        rawPoliceStations,
      ] = await Promise.all([
        fetchLocations(),
        fetchCrimes(),
        fetchCrimeRecords(),
        fetchCriminals(),
        fetchVictims(),
        fetchCourtCases(),
        fetchPatrols(),
        fetchPoliceStations(),
      ]);

      const locations: LocationOption[] = rawLocations.map((location: LocationApiRecord) => ({
        id: location.location_id,
        areaName: location.area_name,
        city: location.city,
        riskStatus: location.risk_status,
        crimeFrequency: location.crime_frequency,
        displayName: mapLocationDisplay(location.area_name, location.city),
      }));

      const crimes: Crime[] = rawCrimes.map((crime: CrimeApiRecord) => ({
        id: stringifyId(crime.crime_id),
        type: crime.crime_type,
        date: toDateOnly(crime.crime_date),
        severity: crime.severity_level,
        location: mapLocationDisplay(crime.area_name, crime.city),
        status: crime.status,
      }));

      const crimeRecords: CrimeRecord[] = rawCrimeRecords.map((record: CrimeRecordApiRecord) => ({
        id: stringifyId(record.record_id),
        criminalId: stringifyId(record.criminal_id),
        crimeId: stringifyId(record.crime_id),
        arrestStatus: record.arrest_status,
      }));

      const criminals: Criminal[] = rawCriminals.map((criminal: CriminalApiRecord) => ({
        id: stringifyId(criminal.criminal_id),
        firstName: criminal.first_name,
        lastName: criminal.last_name,
        dob: toDateOnly(criminal.date_of_birth),
        gender: criminal.gender,
        address: criminal.street ?? "",
        city: criminal.city,
        state: criminal.state,
        pincode: criminal.pincode,
        riskLevel: criminal.risk_level,
        status: criminal.status,
      }));

      const victims: Victim[] = rawVictims.map((victim: VictimApiRecord) => ({
        id: stringifyId(victim.victim_id),
        firstName: victim.first_name,
        lastName: victim.last_name,
        name: `${victim.first_name} ${victim.last_name}`,
        dob: toDateOnly(victim.date_of_birth),
        contact: victim.contact_number,
        associatedCrime: stringifyId(victim.associated_crime_id),
        gender: victim.gender,
        address: victim.street ?? "",
        city: victim.city,
        state: victim.state,
        pincode: victim.pincode,
      }));

      const courtCases: CourtCase[] = rawCourtCases.map((courtCase: CourtCaseApiRecord) => ({
        id: stringifyId(courtCase.case_no),
        caseNumber: stringifyId(courtCase.case_no),
        crimeLinked: stringifyId(courtCase.crime_id),
        courtName: courtCase.court_name,
        judgeName: courtCase.judge_name,
        hearingDate: toDateOnly(courtCase.hearing_date),
        verdict: courtCase.verdict,
      }));

      const patrolUnits: PatrolUnit[] = rawPatrols.map((patrol: PatrolApiRecord) => ({
        id: stringifyId(patrol.patrol_id),
        unitName: patrol.patrol_unit_name,
        officerInCharge: patrol.officer_in_charge,
        shiftTime: dbShiftToUiShift(patrol.shift_time),
        status:
          patrol.patrol_status === "Inactive" ? "Off Duty" : patrol.patrol_status,
        assignedLocation: mapLocationDisplay(patrol.area_name, patrol.city),
        activeCrimeId: stringifyId(patrol.active_crime_id),
      }));

      const dispatchAssignments = rawPatrols.reduce<Record<string, string>>((acc, patrol) => {
        if (patrol.active_crime_id != null) {
          acc[stringifyId(patrol.patrol_id)] = stringifyId(patrol.active_crime_id);
        }

        return acc;
      }, {});

      const policeStations: PoliceStation[] = rawPoliceStations.map((station: PoliceStationApiRecord) => {
        const locationDisplay = mapLocationDisplay(station.area_name, station.city);

        return {
          id: stringifyId(station.station_id),
          stationName: station.station_name,
          contact: station.contact_number,
          locationId: stringifyId(station.location_id),
          operationalStatus: station.operational_status,
          address: station.street,
          city: station.city,
          state: station.state,
          pincode: station.pincode,
          assignedPatrolUnits: patrolUnits
            .filter((unit) => unit.assignedLocation === locationDisplay)
            .map((unit) => unit.unitName),
          totalCrimes: rawCrimes.filter(
            (crime: CrimeApiRecord) => crime.location_id === station.location_id
          ).length,
          riskLevel: station.risk_status,
        };
      });

      setState((current) => ({
        ...current,
        criminals,
        crimes,
        crimeRecords,
        victims,
        courtCases,
        patrolUnits,
        policeStations,
        dispatchAssignments,
        locations,
        isLoading: false,
        loadError: null,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        loadError:
          error instanceof Error ? error.message : "Unable to load application data",
      }));
    }
  }, []);

  useEffect(() => {
    void reloadData();
  }, [reloadData]);

  const value: CrimeInsightContextValue = {
    ...state,
    addCrime: async (input) => {
      const location = resolveLocation(input.location);
      if (!location) {
        throw new Error("Select a valid location");
      }

      await createCrime({
        crime_type: input.type,
        crime_date: input.date,
        severity_level: input.severity,
        description: input.type,
        location_id: location.id,
        status: input.status ?? "Open",
      });

      await reloadData();
    },
    updateCrime: async (id, input) => {
      const location = resolveLocation(input.location);
      if (!location) {
        throw new Error("Select a valid location");
      }

      await updateCrime(parseEntityId(id), {
        crime_type: input.type,
        crime_date: input.date,
        severity_level: input.severity,
        description: input.type,
        location_id: location.id,
        status: input.status ?? "Open",
      });

      await reloadData();
    },
    removeCrime: async (id) => {
      await deleteCrime(parseEntityId(id));
      await reloadData();
    },
    addCriminal: async (input) => {
      await createCriminal({
        first_name: input.firstName,
        last_name: input.lastName,
        date_of_birth: input.dob,
        gender: input.gender === "Prefer Not To Say" ? "Other" : input.gender,
        street: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        risk_level: input.riskLevel,
      });

      await reloadData();
    },
    removeCriminal: async (id) => {
      await deleteCriminalRecord(parseEntityId(id));
      await reloadData();
    },
    updateCriminal: async (id, updates) => {
      await updateCriminalRecord(parseEntityId(id), {
        first_name: updates.firstName,
        last_name: updates.lastName,
        date_of_birth: updates.dob,
        gender: updates.gender === "Prefer Not To Say" ? "Other" : updates.gender,
        street: updates.address,
        city: updates.city,
        state: updates.state,
        pincode: updates.pincode,
        risk_level: updates.riskLevel,
      });

      await reloadData();
    },
    addCrimeRecordLink: async (criminalId, crimeId, arrestStatus) => {
      await createCrimeRecord({
        criminal_id: parseEntityId(criminalId),
        crime_id: parseEntityId(crimeId),
        arrest_status: arrestStatus,
      });

      await reloadData();
    },
    updateCrimeRecordArrestStatus: async (id, arrestStatus) => {
      await updateCrimeRecord(parseEntityId(id), {
        arrest_status: arrestStatus,
      });

      await reloadData();
    },
    addVictim: async (input) => {
      await createVictim({
        first_name: input.firstName,
        last_name: input.lastName,
        date_of_birth: input.dob,
        gender: input.gender === "Prefer Not To Say" ? "Other" : input.gender,
        street: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        contact_number: input.contact,
        associated_crime_id: input.associatedCrime
          ? parseEntityId(input.associatedCrime)
          : null,
      });

      await reloadData();
    },
    updateVictim: async (id, input) => {
      await updateVictimRecord(parseEntityId(id), {
        first_name: input.firstName,
        last_name: input.lastName,
        date_of_birth: input.dob,
        gender: input.gender === "Prefer Not To Say" ? "Other" : input.gender,
        street: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        contact_number: input.contact,
        associated_crime_id: input.associatedCrime
          ? parseEntityId(input.associatedCrime)
          : null,
      });

      await reloadData();
    },
    removeVictim: async (id) => {
      await deleteVictimRecord(parseEntityId(id));
      await reloadData();
    },
    addCourtCase: async (input) => {
      await createCourtCase({
        crime_id: parseEntityId(input.crimeLinked),
        court_name: input.courtName,
        hearing_date: input.hearingDate,
        judge_name: input.judgeName,
        verdict: input.verdict ?? "Pending",
      });

      await reloadData();
    },
    updateCourtCase: async (id, input) => {
      await updateCourtCaseRecord(parseEntityId(id), {
        crime_id: parseEntityId(input.crimeLinked),
        court_name: input.courtName,
        hearing_date: input.hearingDate,
        judge_name: input.judgeName,
        verdict: input.verdict ?? "Pending",
      });

      await reloadData();
    },
    removeCourtCase: async (id) => {
      await deleteCourtCaseRecord(parseEntityId(id));
      await reloadData();
    },
    addPatrol: async (input) => {
      const location = resolveLocation(input.assignedLocation);
      if (!location) {
        throw new Error("Select a valid location");
      }

      await createPatrol({
        patrol_unit_name: input.unitName,
        officer_in_charge: input.officerInCharge,
        shift_time: uiShiftToDbShift(input.shiftTime),
        patrol_status: input.status === "Off Duty" ? "Inactive" : input.status,
        location_id: location.id,
      });

      await reloadData();
    },
    updatePatrol: async (id, updates) => {
      const payload: Record<string, unknown> = {};

      if (updates.assignedLocation) {
        const location = resolveLocation(updates.assignedLocation);
        if (!location) {
          throw new Error("Select a valid location");
        }
        payload.location_id = location.id;
      }

      if (updates.status) {
        payload.patrol_status =
          updates.status === "Off Duty" ? "Inactive" : updates.status;
      }

      if (updates.shiftTime) {
        payload.shift_time = uiShiftToDbShift(updates.shiftTime);
      }

      if (updates.officerInCharge) {
        payload.officer_in_charge = updates.officerInCharge;
      }

      if (updates.unitName) {
        payload.patrol_unit_name = updates.unitName;
      }

      await updatePatrolRecord(parseEntityId(id), payload);
      await reloadData();
    },
    assignPatrolDispatch: async (patrolId, crimeId) => {
      await updatePatrolRecord(parseEntityId(patrolId), {
        active_crime_id: crimeId ? parseEntityId(crimeId) : null,
      });
      await reloadData();
    },
    removePatrol: async (id) => {
      await deletePatrolRecord(parseEntityId(id));
      await reloadData();
    },
    addPoliceStation: async (input) => {
      const location = resolveLocation(input.locationReference);
      if (!location) {
        throw new Error("Select a valid location");
      }

      await createPoliceStation({
        station_name: input.stationName,
        contact_number: input.contact,
        street: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        location_id: location.id,
        operational_status: input.operationalStatus,
      });

      await reloadData();
    },
    updatePoliceStation: async (id, input) => {
      const location = resolveLocation(input.locationReference);
      if (!location) {
        throw new Error("Select a valid location");
      }

      await updatePoliceStationRecord(parseEntityId(id), {
        station_name: input.stationName,
        contact_number: input.contact,
        street: input.address,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        location_id: location.id,
        operational_status: input.operationalStatus,
      });

      await reloadData();
    },
    removePoliceStation: async (id) => {
      await deletePoliceStationRecord(parseEntityId(id));
      await reloadData();
    },
    reloadData,
  };

  return (
    <CrimeInsightContext.Provider value={value}>
      {children}
    </CrimeInsightContext.Provider>
  );
}

export function useCrimeInsight() {
  const context = useContext(CrimeInsightContext);

  if (!context) {
    throw new Error("useCrimeInsight must be used within CrimeInsightProvider");
  }

  return context;
}
