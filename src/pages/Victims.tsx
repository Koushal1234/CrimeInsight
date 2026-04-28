import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { type Victim } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Search, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCrimeInsight } from "@/lib/crimeInsightStore";
import { useAuth } from "@/lib/authContext";

const Victims = () => {
  const { victims, crimes, addVictim, updateVictim, removeVictim } = useCrimeInsight();
  const { hasRole } = useAuth();
  const canManageVictims = hasRole("Admin", "Officer", "Investigator");
  const canDeleteVictims = hasRole("Admin", "Officer");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedVictim, setSelectedVictim] = useState<Victim | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Other",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contact: "",
    associatedCrime: "",
  });
  const [formError, setFormError] = useState("");

  const filtered = victims.filter((victim) =>
    `${victim.name || ""} ${victim.associatedCrime || ""} ${victim.city || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(form.contact)) {
      setFormError("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
        gender: form.gender,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        contact: form.contact,
        associatedCrime: form.associatedCrime,
      };

      if (editMode && editingId) {
        await updateVictim(editingId, payload);
      } else {
        await addVictim(payload);
      }

      setForm({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Other",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contact: "",
        associatedCrime: "",
      });
      setFormError("");
      setEditMode(false);
      setEditingId(null);
      setShowForm(false);

      toast({
        title: editMode ? "Victim record updated" : "Victim record added",
        description: `${form.firstName} ${form.lastName} has been saved.`,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save victim");
    }
  };

  const getLinkedCrime = (crimeId: string) => {
    return crimes.find((crime) => crime.id === crimeId) || null;
  };

  return (
    <div>
      <PageHeader
        title="Victim Records"
        subtitle="Track and support crime victims"
      />

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            placeholder="Search victims..."
          />
        </div>

        {canManageVictims && (
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
            {showForm ? (
              <X className="h-4 w-4 mr-1.5" />
            ) : (
              <Plus className="h-4 w-4 mr-1.5" />
            )}
            {showForm ? "Cancel" : "Add Victim"}
          </Button>
        )}
      </div>

      {showForm && canManageVictims && (
        <form
          onSubmit={handleAdd}
          className="glass rounded-xl p-6 mb-6 animate-scale-in"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            {editMode ? "Edit Victim" : "Register Victim"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            />
            <input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            />
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            />
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            />
            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={form.contact}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                if (digits.length <= 10) {
                  setForm({ ...form, contact: digits });
                  setFormError("");
                }
              }}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            />
            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full md:col-span-2 bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              required
            />
            <select
              value={form.associatedCrime}
              onChange={(e) => setForm({ ...form, associatedCrime: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary md:col-span-2"
            >
              <option value="">Select Crime ID</option>
              {crimes.map((crime) => (
                <option key={crime.id} value={crime.id}>
                  {crime.id} — {crime.type}
                </option>
              ))}
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
            {editMode ? "Update Record" : "Submit Record"}
          </Button>
        </form>
      )}

      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {["ID", "Name", "Contact", "City", "Associated Crime"].map((header) => (
                <th
                  key={header}
                  className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((victim) => (
              <tr
                key={victim.id}
                className="border-b border-border/30 hover:bg-primary/[0.03]"
              >
                <td className="p-4 font-mono text-xs text-muted-foreground">
                  {victim.id}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => setSelectedVictim(victim)}
                    className="font-semibold text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {victim.name}
                  </button>
                </td>
                <td className="p-4 text-muted-foreground">
                  {victim.contact ? `${victim.contact.slice(0, 5)} ${victim.contact.slice(5)}` : ""}
                </td>
                <td className="p-4 text-muted-foreground">{victim.city}</td>
                <td className="p-4 text-primary text-sm font-medium">
                  {getLinkedCrime(victim.associatedCrime)?.type || victim.associatedCrime || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedVictim && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--card))] border border-border rounded-xl w-[460px] p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Victim Profile</h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Victim ID:</span>
                <div className="font-mono">{selectedVictim.id}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Name:</span>
                <div className="font-medium">{selectedVictim.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Date of Birth:</span>
                <div>{selectedVictim.dob || "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <div>{selectedVictim.gender || "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>
                <div>{selectedVictim.contact}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Address:</span>
                <div>{selectedVictim.address || "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">City / State:</span>
                <div>
                  {selectedVictim.city || "—"}
                  {selectedVictim.state ? `, ${selectedVictim.state}` : ""}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Pincode:</span>
                <div>{selectedVictim.pincode || "—"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Associated Crime:</span>
                <div className="text-primary font-medium">
                  {getLinkedCrime(selectedVictim.associatedCrime)?.type ||
                    selectedVictim.associatedCrime ||
                    "—"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedVictim(null)}
                  className="rounded-lg"
                >
                  Close
                </Button>
                {canDeleteVictims && (
                  <Button
                    variant="destructive"
                    className="rounded-lg"
                    onClick={async () => {
                      if (
                        !selectedVictim ||
                        !window.confirm(`Delete victim ${selectedVictim.id}?`)
                      ) {
                        return;
                      }

                      try {
                        await removeVictim(selectedVictim.id);
                        setSelectedVictim(null);
                        toast({
                          title: "Victim deleted",
                          description: `${selectedVictim.name} has been removed.`,
                        });
                      } catch (error) {
                        toast({
                          title: "Unable to delete victim",
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
                {canManageVictims && (
                  <Button
                    onClick={() => {
                      if (!selectedVictim) {
                        return;
                      }

                      setForm({
                        firstName: selectedVictim.firstName ?? "",
                        lastName: selectedVictim.lastName ?? "",
                        dob: selectedVictim.dob ?? "",
                        gender: selectedVictim.gender ?? "Other",
                        address: selectedVictim.address ?? "",
                        city: selectedVictim.city ?? "",
                        state: selectedVictim.state ?? "",
                        pincode: selectedVictim.pincode ?? "",
                        contact: selectedVictim.contact,
                        associatedCrime: selectedVictim.associatedCrime,
                      });
                      setEditMode(true);
                      setEditingId(selectedVictim.id);
                      setShowForm(true);
                      setSelectedVictim(null);
                    }}
                    className="rounded-lg"
                  >
                    Edit Record
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Victims;
