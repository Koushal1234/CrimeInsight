import { useEffect, useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { type Crime } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Plus, X, MapPin, Users, UserCheck, Scale, AlertTriangle, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCrimeInsight } from "@/lib/crimeInsightStore";
import { useAuth } from "@/lib/authContext";

const Crimes = () => {
  const {
    crimes,
    criminals,
    victims,
    courtCases,
    crimeRecords,
    locations,
    addCrime,
    updateCrime,
    removeCrime,
  } = useCrimeInsight();
  const { hasRole } = useAuth();
  const canManageCrimes = hasRole("Admin", "Officer", "Investigator");
  const canDeleteCrimes = hasRole("Admin", "Officer");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Crime | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    type: "",
    date: undefined as Date | undefined,
    severity: "Low" as Crime["severity"],
    location: "",
    status: "Open" as Crime["status"],
  });
  const [dateError, setDateError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const filtered = crimes.filter((c) =>
    `${c.type} ${c.location} ${c.id}`.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({
      type: "",
      date: undefined,
      severity: "Low",
      location: "",
      status: "Open",
    });
    setDateError("");
    setCalendarOpen(false);
    setEditMode(false);
    setEditingId(null);
  };

  useEffect(() => {
    if (!selected) {
      return;
    }

    const latestCrime = crimes.find((crime) => crime.id === selected.id);
    if (latestCrime) {
      setSelected(latestCrime);
    }
  }, [crimes, selected]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) {
      setDateError("Crime date is required");
      return;
    }
    if (form.date > new Date()) {
      setDateError("Crime date cannot be in the future");
      return;
    }
    setDateError("");
    const dateStr = format(form.date, "yyyy-MM-dd");
    try {
      const payload = {
        type: form.type.trim(),
        date: dateStr,
        severity: form.severity,
        location: form.location.trim(),
        status: form.status,
      };

      if (editMode && editingId) {
        await updateCrime(editingId, payload);
      } else {
        await addCrime(payload);
      }

      setShowForm(false);
      resetForm();
      toast({
        title: editMode ? "Crime updated" : "Crime record filed",
        description: editMode
          ? `${form.type} has been updated.`
          : `${form.type} has been registered.`,
      });
    } catch (error) {
      setDateError(error instanceof Error ? error.message : "Unable to save crime");
    }
  };

  const getLinkedCriminals = (crimeId: string) =>
    crimeRecords.filter((record) => record.crimeId === crimeId).length;
  const getLinkedCriminalIds = (crimeId: string) =>
    crimeRecords
      .filter((record) => record.crimeId === crimeId)
      .map((record) => record.criminalId);
  const getLinkedCriminalIdDisplay = (crimeId: string) => {
    const linkedIds = getLinkedCriminalIds(crimeId);
    return linkedIds.length > 0 ? linkedIds.join(", ") : "None";
  };
  const getLinkedCriminalDetails = (crimeId: string) => {
    const linkedIds = getLinkedCriminalIds(crimeId);
    if (linkedIds.length === 0) {
      return "No linked criminals";
    }

    return linkedIds
      .map((criminalId) => {
        const criminal = criminals.find((entry) => entry.id === criminalId);
        if (!criminal) {
          return criminalId;
        }

        return `${criminalId} (${criminal.firstName} ${criminal.lastName})`;
      })
      .join(", ");
  };
  const getLinkedVictims = (crimeId: string) => victims.filter((v) => v.associatedCrime === crimeId).length;
  const getLinkedCases = (crimeId: string) => courtCases.filter((c) => c.crimeLinked === crimeId);

  return (
    <div>
      <PageHeader title="Crime Records" subtitle="Track and manage reported crimes" />

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
            placeholder="Search crimes..." />
        </div>
        {canManageCrimes && (
          <Button
            onClick={() => {
              if (showForm) {
                resetForm();
                setShowForm(false);
                return;
              }

              resetForm();
              setShowForm(true);
            }}
            size="sm"
            className="rounded-lg uppercase tracking-wider text-xs h-10 px-4"
          >
            {showForm ? <X className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
            {showForm ? "Cancel" : "Add Crime"}
          </Button>
        )}
      </div>

      {showForm && canManageCrimes && (
        <form onSubmit={handleAdd} className="glass rounded-xl p-6 mb-6 animate-scale-in">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Report New Crime</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Crime Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-transparent border-b border-border px-1 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground" required />
            <div className="flex flex-col">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-secondary/60 border-border rounded-lg h-10",
                      !form.date && "text-muted-foreground"
                    )}
                  >
                    {form.date ? format(form.date, "dd/MM/yyyy") : <span>DD/MM/YYYY</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-lg" align="start">
                  <Calendar
                    mode="single"
                    selected={form.date}
                    onSelect={(d) => {
                      setForm({ ...form, date: d });
                      setDateError("");
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto bg-[hsl(var(--card))] text-foreground rounded-lg")}
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
              {dateError && <p className="text-xs text-destructive mt-1.5">{dateError}</p>}
            </div>
            <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as Crime["severity"] })}>
              <SelectTrigger className="bg-secondary/60 border-border rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low Severity</SelectItem>
                <SelectItem value="Medium">Medium Severity</SelectItem>
                <SelectItem value="High">High Severity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.location} onValueChange={(value) => setForm({ ...form, location: value })}>
              <SelectTrigger className="bg-secondary/60 border-border rounded-lg">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.displayName}>
                    {location.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm({ ...form, status: value as Crime["status"] })
              }
            >
              <SelectTrigger className="bg-secondary/60 border-border rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Under Investigation">
                  Under Investigation
                </SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" className="mt-5 rounded-lg uppercase tracking-wider text-xs">
            {editMode ? "Update Crime" : "File Report"}
          </Button>
        </form>
      )}

      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {["Crime ID", "Type", "Date", "Severity", "Location", "Criminal IDs", "Status"].map(h => (
                <th key={h} className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border/30 hover:bg-primary/[0.03] transition-colors">
                <td className="p-4 font-mono text-xs text-muted-foreground">{c.id}</td>
                <td className="p-4">
                  <button
                    onClick={() => setSelected(c)}
                    className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left underline-offset-4 hover:underline"
                  >
                    {c.type}
                  </button>
                </td>
                <td className="p-4 text-muted-foreground">{c.date}</td>
                <td className="p-4"><RiskBadge level={c.severity} /></td>
                <td className="p-4 text-muted-foreground">{c.location}</td>
                <td className="p-4 font-mono text-xs text-muted-foreground max-w-[220px]">
                  {getLinkedCriminalIdDisplay(c.id)}
                </td>
                <td className="p-4"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-[40vw] min-w-[360px] max-w-[560px] bg-[hsl(var(--card))] border-l border-[hsl(var(--glass-border))]/50 p-0 overflow-y-auto">
          {selected && (() => {
            const linkedCases = getLinkedCases(selected.id);
            return (
              <div className="flex flex-col h-full">
                {/* Top: Crime Identity */}
                <div className="p-6 pb-4 border-b border-border/30">
                  <div className="flex items-start gap-5">
                    <div className={`h-16 w-16 rounded-xl flex items-center justify-center shrink-0 ${
                      selected.severity === "High" ? "bg-destructive/15 shadow-[0_0_20px_hsl(var(--destructive)/0.3)]" :
                      selected.severity === "Medium" ? "bg-[hsl(45_100%_50%/0.15)]" : "bg-[hsl(142_76%_36%/0.15)]"
                    }`}>
                      <AlertTriangle className={`h-7 w-7 ${
                        selected.severity === "High" ? "text-destructive" :
                        selected.severity === "Medium" ? "text-[hsl(45,100%,50%)]" : "text-[hsl(142,76%,36%)]"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <SheetHeader className="text-left space-y-1 p-0">
                        <SheetTitle className="text-2xl font-extrabold text-foreground tracking-tight">
                          {selected.type}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="flex items-center gap-2.5 mt-2">
                        <RiskBadge level={selected.severity} />
                        <StatusBadge status={selected.status} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-2">{selected.id}</p>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="p-6 border-b border-border/30">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Location Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Location" value={selected.location} className="col-span-2" />
                    <InfoField label="Date Reported" value={selected.date} />
                    <InfoField label="Status" value={selected.status} />
                  </div>
                </div>

                {/* Investigation Section */}
                <div className="p-6 border-b border-border/30">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Investigation Overview</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <InvestigationCard icon={Users} label="Linked Criminals" value={String(getLinkedCriminals(selected.id))} />
                    <InvestigationCard icon={UserCheck} label="Linked Victims" value={String(getLinkedVictims(selected.id))} />
                    <InvestigationCard icon={Scale} label="Court Cases" value={linkedCases.length > 0 ? linkedCases.map(c => c.verdict).join(", ") : "None"} />
                    <InvestigationCard icon={MapPin} label="Area Risk" value={selected.severity} />
                    <InfoField
                      label="Criminal IDs"
                      value={getLinkedCriminalDetails(selected.id)}
                      className="col-span-2"
                    />
                  </div>
                </div>

                {/* Severity Bar */}
                <div className="p-6 border-b border-border/30">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-3">Severity Indicator</h4>
                  <div className="w-full h-2 rounded-full bg-secondary/60 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      selected.severity === "High" ? "w-full bg-destructive" :
                      selected.severity === "Medium" ? "w-2/3 bg-[hsl(45,100%,50%)]" : "w-1/3 bg-[hsl(142,76%,36%)]"
                    }`} />
                  </div>
                </div>

                <div className="p-6 mt-auto">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-lg"
                      onClick={() => setSelected(null)}
                    >
                      Close
                    </Button>
                    {canDeleteCrimes && (
                      <Button
                        variant="destructive"
                        className="rounded-lg"
                        onClick={async () => {
                          if (!window.confirm(`Delete crime ${selected.id}?`)) {
                            return;
                          }

                          try {
                            await removeCrime(selected.id);
                            setSelected(null);
                            toast({
                              title: "Crime deleted",
                              description: `${selected.type} has been removed.`,
                            });
                          } catch (error) {
                            toast({
                              title: "Unable to delete crime",
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
                    {canManageCrimes && (
                      <Button
                        className="flex-1 rounded-lg"
                        onClick={() => {
                          setForm({
                            type: selected.type,
                            date: selected.date ? new Date(selected.date) : undefined,
                            severity: selected.severity,
                            location: selected.location,
                            status: selected.status,
                          });
                          setDateError("");
                          setEditMode(true);
                          setEditingId(selected.id);
                          setShowForm(true);
                          setSelected(null);
                        }}
                      >
                        Edit Crime
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
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

export default Crimes;
