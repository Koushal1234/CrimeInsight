import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/RiskBadge";
import { type PatrolUnit } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Shield, MapPin, Clock, AlertTriangle, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCrimeInsight } from "@/lib/crimeInsightStore";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/hooks/use-toast";

const Patrol = () => {
  const {
    patrolUnits,
    crimes,
    dispatchAssignments,
    locations,
    addPatrol,
    updatePatrol,
    assignPatrolDispatch,
    removePatrol,
  } = useCrimeInsight();
  const { hasRole } = useAuth();
  const canManagePatrol = hasRole("Admin", "Officer");
  const canDeletePatrol = hasRole("Admin");
  const { toast } = useToast();
  const [selected, setSelected] = useState<PatrolUnit | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    unitName: "",
    officerInCharge: "",
    shiftTime: "",
    status: "Standby",
    assignedLocation: ""
  });
  const selectedLocation = selected
    ? locations.find((location) => location.displayName === selected.assignedLocation)
    : null;

  const handleAddPatrol = async (e: React.FormEvent) => {
    e.preventDefault();

    await addPatrol({
      unitName: form.unitName,
      officerInCharge: form.officerInCharge,
      shiftTime: form.shiftTime,
      status: form.status as PatrolUnit["status"],
      assignedLocation: form.assignedLocation,
    });

    setForm({
      unitName: "",
      officerInCharge: "",
      shiftTime: "",
      status: "Standby",
      assignedLocation: locations[0]?.displayName ?? ""
    });

    setShowForm(false);
  };

  return (
    <div>
      <PageHeader title="Patrol Monitoring" subtitle="Track active patrol units and assignments" />

      {canManagePatrol && (
        <div className="flex justify-end mb-4">
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg uppercase tracking-wider text-xs"
          >
            {showForm ? <X className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
            {showForm ? "Cancel" : "Add Patrol"}
          </Button>
        </div>
      )}

      {showForm && canManagePatrol && (
        <form
          onSubmit={handleAddPatrol}
          className="glass rounded-xl p-6 mb-6 animate-scale-in"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Register Patrol Unit
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Unit Name (Alpha‑1)"
              value={form.unitName}
              onChange={(e) => setForm({ ...form, unitName: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
              required
            />

            <input
              placeholder="Officer In Charge"
              value={form.officerInCharge}
              onChange={(e) => setForm({ ...form, officerInCharge: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
              required
            />

            <select
              value={form.shiftTime}
              onChange={(e) => setForm({ ...form, shiftTime: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              required
            >
              <option value="">Select Shift</option>
              <option value="06:00 - 14:00">Morning (06:00‑14:00)</option>
              <option value="14:00 - 22:00">Evening (14:00‑22:00)</option>
              <option value="22:00 - 06:00">Night (22:00‑06:00)</option>
            </select>
            <select
              value={form.assignedLocation}
              onChange={(e) => setForm({ ...form, assignedLocation: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              required
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.displayName}>
                  {location.displayName}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            size="sm"
            className="mt-5 rounded-lg uppercase tracking-wider text-xs"
          >
            Register Patrol
          </Button>
        </form>
      )}

      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {["Unit ID", "Officer In Charge", "Shift", "Status", "Location", "Dispatch Crime"].map(h => (
                <th key={h} className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patrolUnits.map((p) => (
              <tr
                key={p.id}
                className={cn(
                  "border-b border-border/30 hover:bg-primary/[0.03] transition-colors",
                  p.status === "Active" && "border-l-2 border-l-primary bg-primary/[0.02]"
                )}
              >
                <td className="p-4">
                  <button
                    onClick={() => setSelected(p)}
                    className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    {p.unitName}
                  </button>
                </td>
                <td className="p-4 text-foreground">{p.officerInCharge}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{p.shiftTime}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {p.status === "Active" && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    )}
                    <StatusBadge status={p.status} />
                  </div>
                </td>
                <td className="p-4">
                  <select
                    value={p.assignedLocation}
                    onChange={(e) => {
                      const newLocation = e.target.value;
                      void updatePatrol(p.id, { assignedLocation: newLocation });
                    }}
                    className="bg-secondary/40 border border-border rounded px-2 py-1 text-xs text-foreground"
                    disabled={!canManagePatrol}
                  >
                    {locations.map((location) => (
                      <option key={location.id} value={location.displayName}>
                        {location.displayName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <select
                    value={dispatchAssignments[p.id] || ""}
                    onChange={(e) => {
                      const crimeId = e.target.value;
                      void assignPatrolDispatch(p.id, crimeId);
                    }}
                    className="bg-secondary/40 border border-border rounded px-2 py-1 text-xs text-foreground"
                    disabled={!canManagePatrol}
                  >
                    <option value="">Assign Crime</option>
                    {crimes.map((crime) => (
                      <option key={crime.id} value={crime.id}>
                        {crime.id} — {crime.type}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-[40vw] min-w-[360px] max-w-[560px] bg-[hsl(var(--card))] border-l border-[hsl(var(--glass-border))]/50 p-0 overflow-y-auto">
          {selected && (
            <div className="flex flex-col h-full">
              {/* Top: Patrol Identity */}
              <div className="p-6 pb-4 border-b border-border/30">
                <div className="flex items-start gap-5">
                  <div className={`h-16 w-16 rounded-xl flex items-center justify-center shrink-0 ${
                    selected.status === "Active" ? "bg-primary/15 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" :
                    selected.status === "Standby" ? "bg-secondary/60" : "bg-muted/40"
                  }`}>
                    <Shield className={`h-7 w-7 ${
                      selected.status === "Active" ? "text-primary" :
                      selected.status === "Standby" ? "text-muted-foreground" : "text-muted-foreground/50"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetHeader className="text-left space-y-1 p-0">
                      <SheetTitle className="text-2xl font-extrabold text-foreground tracking-tight">
                        {selected.unitName}
                      </SheetTitle>
                    </SheetHeader>
                    <p className="text-sm text-muted-foreground mt-1">{selected.officerInCharge}</p>
                    <div className="flex items-center gap-2.5 mt-2">
                      <StatusBadge status={selected.status} />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-2">{selected.id}</p>
                  </div>
                </div>
              </div>

              {/* Patrol Details */}
              <div className="p-6 border-b border-border/30">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Patrol Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Officer In Charge" value={selected.officerInCharge} className="col-span-2" />
                  <InfoField label="Shift Time" value={selected.shiftTime} />
                  <InfoField label="Status" value={selected.status} />
                </div>
              </div>

              {/* Assignment Overview */}
              <div className="p-6 border-b border-border/30">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Assignment Overview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <InvestigationCard
                    icon={MapPin}
                    label="Assigned Location"
                    value={patrolUnits.find(u => u.id === selected.id)?.assignedLocation || selected.assignedLocation}
                  />
                  <InvestigationCard icon={Clock} label="Shift" value={selected.shiftTime} />
                  <InvestigationCard
                    icon={AlertTriangle}
                    label="Area Risk"
                    value={selectedLocation?.riskStatus ?? "Unknown"}
                  />
                  <InvestigationCard icon={Shield} label="Patrol Status" value={selected.status} />
                  <InvestigationCard
                    icon={AlertTriangle}
                    label="Dispatched Crime"
                    value={
                      dispatchAssignments[selected.id]
                        ? crimes.find(c => c.id === dispatchAssignments[selected.id])?.type || dispatchAssignments[selected.id]
                        : "None"
                    }
                  />
                </div>
              </div>

              <div className="p-6 mt-auto">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                  {canDeletePatrol && (
                    <Button
                      variant="destructive"
                      className="rounded-lg"
                      onClick={async () => {
                        if (!selected || !window.confirm(`Delete patrol ${selected.unitName}?`)) {
                          return;
                        }

                        try {
                          await removePatrol(selected.id);
                          setSelected(null);
                          toast({
                            title: "Patrol deleted",
                            description: `${selected.unitName} has been removed.`,
                          });
                        } catch (error) {
                          toast({
                            title: "Unable to delete patrol",
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

export default Patrol;
