import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { type PoliceStation } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Building2, MapPin, Shield, AlertTriangle, Phone, Plus, X } from "lucide-react";
import { useCrimeInsight } from "@/lib/crimeInsightStore";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/hooks/use-toast";

const PoliceStations = () => {
  const {
    policeStations,
    patrolUnits,
    crimes,
    locations,
    addPoliceStation,
    updatePoliceStation,
    removePoliceStation,
  } = useCrimeInsight();
  const { hasRole } = useAuth();
  const canManageStations = hasRole("Admin", "Officer");
  const canDeleteStations = hasRole("Admin");
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PoliceStation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    stationName: "",
    city: "",
    state: "",
    pincode: "",
    contact: "",
    address: "",
    operationalStatus: "Operational",
    locationReference: "",
  });

  const filtered = policeStations.filter((station) =>
    `${station.stationName} ${station.city} ${station.id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(form.contact)) {
      setFormError("Contact number must be exactly 10 digits");
      return;
    }

    try {
      const payload = {
        stationName: form.stationName,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        contact: form.contact,
        address: form.address,
        operationalStatus: form.operationalStatus as PoliceStation["operationalStatus"],
        locationReference: form.locationReference,
      };

      if (editMode && editingId) {
        await updatePoliceStation(editingId, payload);
      } else {
        await addPoliceStation(payload);
      }

      setForm({
        stationName: "",
        city: "",
        state: "",
        pincode: "",
        contact: "",
        address: "",
        operationalStatus: "Operational",
        locationReference: "",
      });
      setFormError("");
      setEditMode(false);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save police station"
      );
    }
  };

  return (
    <div>
      <PageHeader title="Police Stations" subtitle="Manage and monitor station operations" />

      {canManageStations && (
        <div className="flex justify-end mb-4">
          <Button
            size="sm"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditMode(false);
                setEditingId(null);
                return;
              }

              setShowForm(true);
            }}
            className="rounded-lg uppercase tracking-wider text-xs"
          >
            {showForm ? <X className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
            {showForm ? "Cancel" : "Add Station"}
          </Button>
        </div>
      )}

      {showForm && canManageStations && (
        <form
          onSubmit={handleAddStation}
          className="glass rounded-xl p-6 mb-6 animate-scale-in"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            {editMode ? "Edit Police Station" : "Register Police Station"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Station Name"
              value={form.stationName}
              onChange={(e) => setForm({ ...form, stationName: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
              required
            />
            <select
              value={form.locationReference}
              onChange={(e) => {
                const location = locations.find(
                  (item) => item.displayName === e.target.value
                );
                setForm({
                  ...form,
                  locationReference: e.target.value,
                  city: location?.city ?? form.city,
                });
              }}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.displayName}>
                  {location.displayName}
                </option>
              ))}
            </select>
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              type="tel"
              placeholder="Contact Number"
              value={form.contact}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                if (digits.length <= 10) {
                  setForm({ ...form, contact: digits });
                  setFormError("");
                }
              }}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm md:col-span-2"
              required
            />
            <select
              value={form.operationalStatus}
              onChange={(e) => setForm({ ...form, operationalStatus: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="Operational">Operational</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {formError && (
            <p className="text-xs text-red-400 mt-3">{formError}</p>
          )}

          <Button
            type="submit"
            size="sm"
            className="mt-5 rounded-lg uppercase tracking-wider text-xs"
          >
            {editMode ? "Update Station" : "Register Station"}
          </Button>
        </form>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
            placeholder="Search stations..."
          />
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {["ID", "Station Name", "City", "Contact", "Status"].map((header) => (
                <th key={header} className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((station) => (
              <tr key={station.id} className="border-b border-border/30 hover:bg-primary/[0.03] transition-colors">
                <td className="p-4 font-mono text-xs text-muted-foreground">{station.id}</td>
                <td className="p-4">
                  <button
                    onClick={() => setSelected(station)}
                    className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left underline-offset-4 hover:underline"
                  >
                    {station.stationName}
                  </button>
                </td>
                <td className="p-4 text-muted-foreground">{station.city}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">{station.contact}</td>
                <td className="p-4"><StatusBadge status={station.operationalStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-[40vw] min-w-[360px] max-w-[560px] bg-[hsl(var(--card))] border-l border-[hsl(var(--glass-border))]/50 p-0 overflow-y-auto">
          {selected && (
            <div className="flex flex-col h-full">
              <div className="p-6 pb-4 border-b border-border/30">
                <div className="flex items-start gap-5">
                  <div className="h-16 w-16 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetHeader className="text-left space-y-1 p-0">
                      <SheetTitle className="text-2xl font-extrabold text-foreground tracking-tight">
                        {selected.stationName}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex items-center gap-2.5 mt-2">
                      <StatusBadge status={selected.operationalStatus} />
                      <RiskBadge level={selected.riskLevel} />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-2">{selected.locationId}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-border/30">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Station Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Contact" value={selected.contact} />
                  <InfoField label="City" value={selected.city} />
                  <InfoField label="State" value={selected.state} />
                  <InfoField label="Pincode" value={selected.pincode} />
                  <InfoField label="Address" value={selected.address} className="col-span-2" />
                </div>
              </div>

              <div className="p-6 border-b border-border/30">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Operations Overview</h4>
                <div className="grid grid-cols-2 gap-3">
                  <InvestigationCard
                    icon={Shield}
                    label="Patrol Units"
                    value={
                      patrolUnits
                        .filter((unit) =>
                          unit.assignedLocation.toLowerCase().includes(selected.city.toLowerCase())
                        )
                        .map((unit) => unit.unitName)
                        .join(", ") || "None"
                    }
                  />
                  <InvestigationCard
                    icon={AlertTriangle}
                    label="Total Crimes"
                    value={String(
                      crimes.filter((crime) =>
                        crime.location.toLowerCase().includes(selected.city.toLowerCase())
                      ).length
                    )}
                  />
                  <InvestigationCard icon={MapPin} label="Area Risk" value={selected.riskLevel} />
                  <InvestigationCard icon={Phone} label="Contact" value={selected.contact} />
                </div>
              </div>

              <div className="p-6 mt-auto">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                  {canDeleteStations && (
                    <Button
                      variant="destructive"
                      className="rounded-lg"
                      onClick={async () => {
                        if (!selected || !window.confirm(`Delete station ${selected.stationName}?`)) {
                          return;
                        }

                        try {
                          await removePoliceStation(selected.id);
                          setSelected(null);
                          toast({
                            title: "Police station deleted",
                            description: `${selected.stationName} has been removed.`,
                          });
                        } catch (error) {
                          toast({
                            title: "Unable to delete police station",
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
                  {canManageStations && (
                    <Button
                      className="flex-1 rounded-lg"
                      onClick={() => {
                        if (!selected) {
                          return;
                        }

                        const matchingLocation = locations.find(
                          (location) => String(location.id) === selected.locationId
                        );

                        setForm({
                          stationName: selected.stationName,
                          city: selected.city,
                          state: selected.state,
                          pincode: selected.pincode,
                          contact: selected.contact,
                          address: selected.address,
                          operationalStatus: selected.operationalStatus,
                          locationReference:
                            matchingLocation?.displayName ?? selected.locationId,
                        });
                        setEditMode(true);
                        setEditingId(selected.id);
                        setShowForm(true);
                        setSelected(null);
                      }}
                    >
                      Edit Station
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

export default PoliceStations;
