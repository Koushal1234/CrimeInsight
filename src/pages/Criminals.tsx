import { useEffect, useState } from "react";
import { format, differenceInYears } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/RiskBadge";
import { type Criminal } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Plus, X, CalendarIcon, Shield, FileText, Scale, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCrimeInsight } from "@/lib/crimeInsightStore";
import { useAuth } from "@/lib/authContext";

function calculateAge(dob: string): number {
  return differenceInYears(new Date(), new Date(dob));
}

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

const criminalFormFields: Array<{
  ph: string;
  key: "firstName" | "lastName" | "city" | "state" | "pincode" | "address";
}> = [
  { ph: "First Name", key: "firstName" },
  { ph: "Last Name", key: "lastName" },
  { ph: "City", key: "city" },
  { ph: "State", key: "state" },
  { ph: "Pincode", key: "pincode" },
  { ph: "Address", key: "address" },
];

const Criminals = () => {
  const {
    criminals,
    crimes,
    crimeRecords,
    courtCases,
    addCriminal,
    updateCriminal,
    removeCriminal,
    addCrimeRecordLink,
    updateCrimeRecordArrestStatus,
  } = useCrimeInsight();
  const { hasRole } = useAuth();
  const canManageCriminals = hasRole("Admin", "Officer", "Investigator");
  const canDeleteCriminals = hasRole("Admin", "Officer");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCriminal, setSelectedCriminal] = useState<Criminal | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "" as string,
    gender: "Male",
    address: "",
    city: "",
    state: "",
    pincode: "",
    riskLevel: "Low" as Criminal["riskLevel"],
  });
  const [dobDate, setDobDate] = useState<Date | undefined>(undefined);
  const [dobError, setDobError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [formError, setFormError] = useState("");
  const [dobOpen, setDobOpen] = useState(false);
  const [linkCrimeId, setLinkCrimeId] = useState("");
  const [linkArrestStatus, setLinkArrestStatus] =
    useState<"Arrested" | "Under Investigation" | "Released">(
      "Under Investigation"
    );

  const age = dobDate ? differenceInYears(new Date(), dobDate) : null;

  const filtered = criminals.filter(
    (c) => `${c.firstName} ${c.lastName} ${c.city} ${c.id}`.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!selectedCriminal) {
      return;
    }

    const latestCriminal = criminals.find(
      (criminal) => criminal.id === selectedCriminal.id
    );

    if (latestCriminal) {
      setSelectedCriminal(latestCriminal);
    }
  }, [criminals, selectedCriminal]);

  useEffect(() => {
    if (!selectedCriminal) {
      setLinkCrimeId("");
      setLinkArrestStatus("Under Investigation");
      return;
    }

    const linkedCrimeIds = new Set(
      crimeRecords
        .filter((record) => record.criminalId === selectedCriminal.id)
        .map((record) => record.crimeId)
    );

    const firstAvailableCrime = crimes.find((crime) => !linkedCrimeIds.has(crime.id));

    setLinkCrimeId(firstAvailableCrime?.id ?? "");
    setLinkArrestStatus("Under Investigation");
  }, [crimeRecords, crimes, selectedCriminal]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setDobError("");
    setPincodeError("");
    setFormError("");

    if (!dobDate) {
      setDobError("Date of birth is required");
      return;
    }

    if (dobDate > new Date()) {
      setDobError("Date of birth cannot be in the future");
      return;
    }

    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 18);
    if (dobDate > minAge) {
      setDobError("Criminal must be at least 18 years old");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setPincodeError("Pincode must be exactly 6 digits");
      return;
    }

    // Generate next ID safely
    const criminalData = {
      ...form,
      dob: format(dobDate, "yyyy-MM-dd"),
    };

    try {
      if (editMode && editingId) {
        await updateCriminal(editingId, criminalData);
        setSelectedCriminal((prev) =>
          prev ? { ...prev, ...criminalData } : prev
        );
      } else {
        await addCriminal(criminalData);
      }

      setShowForm(false);
      setForm({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        address: "",
        city: "",
        state: "",
        pincode: "",
        riskLevel: "Low",
      });
      setDobDate(undefined);
      setDobError("");
      setPincodeError("");
      setFormError("");

      setEditMode(false);
      setEditingId(null);

      toast({
        title: editMode ? "Criminal Updated" : "Criminal Added",
        description: `${form.firstName} ${form.lastName} saved successfully.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save criminal";

      if (message.includes("Pincode")) {
        setPincodeError(message);
      } else if (
        message.includes("Date of birth") ||
        message.includes("age")
      ) {
        setDobError(message);
      } else {
        setFormError(message);
      }
    }
  };

  return (
    <div>
      <PageHeader title="Criminal Records" subtitle="Manage and track criminal profiles" />

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
            placeholder="Search criminals..."
          />
        </div>
        {canManageCriminals && (
          <Button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditMode(false);
                setEditingId(null);
                return;
              }

              setShowForm(true);
            }}
            size="sm"
            className="rounded-lg uppercase tracking-wider text-xs h-10 px-4"
          >
            {showForm ? <X className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
            {showForm ? "Cancel" : "Add Criminal"}
          </Button>
        )}
      </div>

      {showForm && canManageCriminals && (
        <form onSubmit={handleAdd} className="glass rounded-xl p-6 mb-6 animate-scale-in">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            {editMode ? "Edit Criminal Record" : "Add New Criminal"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criminalFormFields.map(({ ph, key }) => (
              key === "pincode" ? (
                <div key={key} className="flex flex-col">
                  <input
                    placeholder={ph}
                    value={form[key]}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setForm({ ...form, [key]: nextValue });
                      if (!nextValue || /^\d{6}$/.test(nextValue.trim())) {
                        setPincodeError("");
                      }
                    }}
                    className="bg-transparent border-b border-border px-1 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    required
                  />
                  {pincodeError && (
                    <p className="text-xs text-destructive mt-1.5">{pincodeError}</p>
                  )}
                </div>
              ) : (
                <input
                  key={key}
                  placeholder={ph}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="bg-transparent border-b border-border px-1 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  required={key !== "address"}
                />
              )
            ))}
            <div className="flex flex-col">
              <Popover open={dobOpen} onOpenChange={setDobOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-secondary/60 border-border rounded-lg h-10 px-3"
                  >
                    {dobDate ? format(dobDate, "dd/MM/yyyy") : <span>Select Date of Birth</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl">
                  <Calendar
                    mode="single"
                    selected={dobDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setDobDate(date);
                      setDobError("");
                      setForm({ ...form, dob: format(date, "yyyy-MM-dd") });
                      setDobOpen(false);
                    }}
                    captionLayout="dropdown"
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                    className="bg-[hsl(var(--card))] rounded-xl"
                    classNames={{
                      caption: "flex justify-center pt-1 relative items-center gap-2 text-foreground",
                      caption_label: "text-sm font-semibold text-foreground",
                      nav_button: "h-7 w-7 bg-transparent hover:bg-primary/20 text-primary border border-border rounded-md",
                      dropdown: "bg-[hsl(var(--card))] text-foreground border border-border rounded-md px-2 py-1 appearance-none hover:bg-primary/10 focus:bg-primary/10",
                      dropdown_month: "bg-[hsl(var(--card))] text-foreground border border-border rounded-md appearance-none px-2 py-1 hover:bg-primary/10 focus:bg-primary/10",
                      dropdown_year: "bg-[hsl(var(--card))] text-foreground border border-border rounded-md appearance-none px-2 py-1 hover:bg-primary/10 focus:bg-primary/10",
                      table: "w-full border-collapse",
                      head_cell: "text-muted-foreground text-xs",
                      cell: "text-center text-sm p-0 relative",
                      day: "h-9 w-9 p-0 font-normal text-foreground hover:bg-primary/20 rounded-md",
                      day_selected: "bg-primary text-white hover:bg-primary",
                      day_today: "border border-primary",
                    }}
                  />
                </PopoverContent>
              </Popover>
              {dobError && <p className="text-xs text-destructive mt-1.5">{dobError}</p>}
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Age"
                value={age !== null ? `${age} Years` : ""}
                readOnly
                className="bg-secondary/40 border border-border rounded-lg h-10 px-3 text-sm text-foreground opacity-80 cursor-not-allowed"
              />
            </div>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger className="bg-secondary/60 border-border rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer Not To Say">Prefer Not To Say</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.riskLevel} onValueChange={(v) => setForm({ ...form, riskLevel: v as Criminal["riskLevel"] })}>
              <SelectTrigger className="bg-secondary/60 border-border rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
              </SelectContent>
            </Select>

          </div>
          {formError && <p className="text-xs text-destructive mt-3">{formError}</p>}
          {age !== null && (
            <div className="mt-4 p-4 rounded-lg border border-primary/40 bg-primary/10">
              <p className="text-xs uppercase tracking-wider mb-1 text-primary/70">Calculated Age</p>
              <p className="text-2xl font-bold text-primary">
                {age} Years
              </p>
            </div>
          )}
          <Button type="submit" size="sm" className="mt-5 rounded-lg uppercase tracking-wider text-xs">
            {editMode ? "Update Record" : "Submit Record"}
          </Button>
        </form>
      )}

      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {["ID", "Name", "Age", "Case Status", "City"].map(h => (
                <th key={h} className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border/30 hover:bg-primary/[0.03] transition-colors">
                <td className="p-4 font-mono text-xs text-muted-foreground">{c.id}</td>
                <td className="p-4 pl-8">
                  <button
                    onClick={() => setSelectedCriminal(c)}
                    className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left underline-offset-4 hover:underline"
                  >
                    {c.firstName} {c.lastName}
                  </button>
                </td>
                <td className="p-4 text-muted-foreground">
                  {c.dob ? `${calculateAge(c.dob)} Years` : "—"}
                </td>
                <td className="p-4">
                  <StatusBadge
                    status={c.status}
                  />
                </td>
                <td className="p-4 text-muted-foreground">{c.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-in Profile Panel */}
      <Sheet open={!!selectedCriminal} onOpenChange={(open) => !open && setSelectedCriminal(null)}>
        <SheetContent side="right" className="w-[40vw] min-w-[360px] max-w-[560px] bg-[hsl(var(--card))] border-l border-[hsl(var(--glass-border))]/50 p-0 overflow-y-auto">
          {selectedCriminal && (
            <div className="flex flex-col h-full">
              {/* Top: Avatar + Identity */}
              <div className="p-6 pb-4 border-b border-border/30">
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--background))] flex items-center justify-center border-2 border-[hsl(var(--primary))]/40 shadow-[0_0_20px_hsl(var(--primary)/0.2)] shrink-0">
                    <span className="text-2xl font-bold text-primary-foreground tracking-wider">
                      {getInitials(selectedCriminal.firstName, selectedCriminal.lastName)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetHeader className="text-left space-y-1 p-0">
                      <SheetTitle className="text-2xl font-extrabold text-foreground tracking-tight">
                        {selectedCriminal.firstName} {selectedCriminal.lastName}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex items-center gap-2.5 mt-2">
                      <StatusBadge
                        status={selectedCriminal.status}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-2">{selectedCriminal.id}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="p-6 border-b border-border/30">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoField
                    label="Date of Birth"
                    value={selectedCriminal.dob ? format(new Date(selectedCriminal.dob), "PPP") : "—"}
                  />
                  <InfoField
                    label="Age"
                    value={selectedCriminal.dob ? `${calculateAge(selectedCriminal.dob)} Years` : "—"}
                  />
                  <InfoField label="Gender" value={selectedCriminal.gender} />
                  <InfoField label="City" value={selectedCriminal.city} />
                  <InfoField label="State" value={selectedCriminal.state} />
                  <InfoField label="Pincode" value={selectedCriminal.pincode} />
                  <InfoField label="Address" value={selectedCriminal.address || "—"} className="col-span-2" />
                </div>
              </div>

              {/* Investigation Overview */}
              <div className="p-6 border-b border-border/30">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Investigation Overview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <InvestigationCard
                    icon={FileText}
                    label="Linked Crimes"
                    value={
                      crimeRecords.filter(r => r.criminalId === selectedCriminal.id).length.toString()
                    }
                  />
                  <InvestigationCard
                    icon={Shield}
                    label="Case Status"
                    value={selectedCriminal.status}
                  />
                  <InvestigationCard
                    icon={Scale}
                    label="Court Cases"
                    value={courtCases
                      .filter((courtCase) =>
                        crimeRecords.some(
                          (record) =>
                            record.criminalId === selectedCriminal.id &&
                            record.crimeId === courtCase.crimeLinked
                        )
                      )
                      .length.toString()}
                  />
                </div>
              </div>

              {/* Linked Crime Details */}
              <div className="p-6 border-b border-border/30">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">
                  Crime Details
                </h4>

                {crimeRecords.filter(r => r.criminalId === selectedCriminal.id).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No crimes linked.</p>
                ) : (
                  <div className="space-y-3">
                    {crimeRecords
                      .filter(r => r.criminalId === selectedCriminal.id)
                      .map(record => {
                        const crime = crimes.find(c => c.id === record.crimeId);
                        if (!crime) return null;

                        return (
                          <div key={record.id} className="rounded-lg border border-border/40 p-3 bg-secondary/40">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold">{crime.type}</span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  crime.severity === "High"
                                    ? "bg-red-500/20 text-red-400"
                                    : crime.severity === "Medium"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-green-500/20 text-green-400"
                                }`}
                              >
                                {crime.severity}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Date: {crime.date}
                            </p>
                            <div className="mt-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                                Arrest Status
                              </p>
                              <Select
                                value={record.arrestStatus}
                                onValueChange={(value) => {
                                  if (!canManageCriminals) {
                                    return;
                                  }
                                  void updateCrimeRecordArrestStatus(
                                    record.id,
                                    value as typeof record.arrestStatus
                                  );
                                }}
                                disabled={!canManageCriminals}
                              >
                                <SelectTrigger
                                  className={cn(
                                    "h-8 rounded-md text-xs border",
                                    record.arrestStatus === "Under Investigation" &&
                                      "bg-yellow-500/10 text-yellow-400 border-yellow-500/40",
                                    record.arrestStatus === "Arrested" &&
                                      "bg-red-500/10 text-red-400 border-red-500/40",
                                    record.arrestStatus === "Released" &&
                                      "bg-green-500/10 text-green-400 border-green-500/40"
                                  )}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Under Investigation">
                                    Under Investigation
                                  </SelectItem>
                                  <SelectItem value="Arrested">
                                    Arrested
                                  </SelectItem>
                                  <SelectItem value="Released">
                                    Released
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {canManageCriminals && (
              <div className="p-6 border-b border-border/30">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">
                  Link New Crime
                </h4>
                {(() => {
                  const linkedCrimeIds = new Set(
                    crimeRecords
                      .filter((record) => record.criminalId === selectedCriminal.id)
                      .map((record) => record.crimeId)
                  );
                  const availableCrimes = crimes.filter(
                    (crime) => !linkedCrimeIds.has(crime.id)
                  );

                  if (availableCrimes.length === 0) {
                    return (
                      <p className="text-xs text-muted-foreground">
                        All available crimes are already linked to this criminal.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <Select value={linkCrimeId} onValueChange={setLinkCrimeId}>
                        <SelectTrigger className="bg-secondary/60 border-border rounded-lg">
                          <SelectValue placeholder="Select Crime" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCrimes.map((crime) => (
                            <SelectItem key={crime.id} value={crime.id}>
                              {crime.id} - {crime.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={linkArrestStatus}
                        onValueChange={(value) =>
                          setLinkArrestStatus(
                            value as "Arrested" | "Under Investigation" | "Released"
                          )
                        }
                      >
                        <SelectTrigger className="bg-secondary/60 border-border rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Under Investigation">
                            Under Investigation
                          </SelectItem>
                          <SelectItem value="Arrested">Arrested</SelectItem>
                          <SelectItem value="Released">Released</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        className="w-full rounded-lg"
                        onClick={async () => {
                          if (!selectedCriminal || !linkCrimeId) {
                            return;
                          }

                          try {
                            await addCrimeRecordLink(
                              selectedCriminal.id,
                              linkCrimeId,
                              linkArrestStatus
                            );

                            toast({
                              title: "Crime linked",
                              description: `Crime ${linkCrimeId} linked to ${selectedCriminal.firstName} ${selectedCriminal.lastName}.`,
                            });
                          } catch (error) {
                            toast({
                              title: "Unable to link crime",
                              description:
                                error instanceof Error
                                  ? error.message
                                  : "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Link Crime Record
                      </Button>
                    </div>
                  );
                })()}
              </div>
              )}

              {/* Actions */}
              <div className="p-6 mt-auto">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setSelectedCriminal(null)}>
                    Close
                  </Button>
                  {canDeleteCriminals && (
                    <Button
                      variant="destructive"
                      className="rounded-lg"
                      onClick={async () => {
                        if (
                          !selectedCriminal ||
                          !window.confirm(`Delete criminal ${selectedCriminal.id}?`)
                        ) {
                          return;
                        }

                        try {
                          await removeCriminal(selectedCriminal.id);
                          setSelectedCriminal(null);
                          toast({
                            title: "Criminal deleted",
                            description: `${selectedCriminal.firstName} ${selectedCriminal.lastName} has been removed.`,
                          });
                        } catch (error) {
                          toast({
                            title: "Unable to delete criminal",
                            description:
                              error instanceof Error ? error.message : "Try again",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                  {canManageCriminals && (
                    <Button
                      className="flex-1 rounded-lg"
                      onClick={() => {
                        if (!selectedCriminal) return;

                        setForm({
                          firstName: selectedCriminal.firstName,
                          lastName: selectedCriminal.lastName,
                          dob: selectedCriminal.dob,
                          gender: selectedCriminal.gender,
                          address: selectedCriminal.address,
                          city: selectedCriminal.city,
                          state: selectedCriminal.state,
                          pincode: selectedCriminal.pincode,
                          riskLevel: selectedCriminal.riskLevel,
                        });

                        setDobDate(
                          selectedCriminal.dob ? new Date(selectedCriminal.dob) : undefined
                        );

                        setEditMode(true);
                        setEditingId(selectedCriminal.id);
                        setShowForm(true);
                      }}
                    >
                      Edit Record
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

function InfoField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function InvestigationCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-3.5 flex items-center gap-3">
      <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default Criminals;
