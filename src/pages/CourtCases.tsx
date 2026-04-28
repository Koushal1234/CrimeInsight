import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { type CourtCase } from "@/lib/mockData";
import { useCrimeInsight } from "@/lib/crimeInsightStore";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/hooks/use-toast";

function getHearingReminder(date: string) {
  if (!date) return "";

  const today = new Date();
  const hearing = new Date(date);
  const diff = Math.ceil(
    (hearing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diff === 1 ? "Tomorrow" : "";
}

const CourtCases = () => {
  const { courtCases, crimes, addCourtCase, updateCourtCase, removeCourtCase } = useCrimeInsight();
  const { hasRole } = useAuth();
  const canManageCourtCases = hasRole("Admin", "Officer", "Investigator");
  const canDeleteCourtCases = hasRole("Admin", "Officer");
  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState<CourtCase | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    crimeLinked: "",
    courtName: "",
    judgeName: "",
    hearingDate: "",
    verdict: "Pending" as CourtCase["verdict"],
  });

  return (
    <div>
      <PageHeader title="Judicial Tracking" subtitle="Monitor court proceedings and verdicts" />

      {canManageCourtCases && (
        <div className="flex justify-end mb-4">
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
            className="rounded-lg uppercase tracking-wider text-xs"
          >
            {showForm ? "Cancel" : "Add Court Case"}
          </Button>
        </div>
      )}

      {showForm && canManageCourtCases && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            try {
              const payload = {
                crimeLinked: form.crimeLinked,
                courtName: form.courtName,
                judgeName: form.judgeName,
                hearingDate: form.hearingDate,
                verdict: form.verdict,
              };

              if (editMode && editingId) {
                await updateCourtCase(editingId, payload);
              } else {
                await addCourtCase(payload);
              }

              setForm({
                crimeLinked: "",
                courtName: "",
                judgeName: "",
                hearingDate: "",
                verdict: "Pending",
              });
              setFormError("");
              setEditMode(false);
              setEditingId(null);
              setShowForm(false);
            } catch (error) {
              setFormError(
                error instanceof Error ? error.message : "Unable to save court case"
              );
            }
          }}
          className="glass rounded-xl p-6 mb-6 animate-scale-in"
        >
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            {editMode ? "Edit Court Case" : "Register Court Case"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={form.crimeLinked}
              onChange={(e) => setForm({ ...form, crimeLinked: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none"
              required
            >
              <option value="">Select Crime ID</option>
              {crimes.map((crime) => (
                <option key={crime.id} value={crime.id}>
                  {crime.id} — {crime.type}
                </option>
              ))}
            </select>

            <input
              placeholder="Court Name"
              value={form.courtName}
              onChange={(e) => setForm({ ...form, courtName: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none"
              required
            />

            <input
              placeholder="Judge Name"
              value={form.judgeName}
              onChange={(e) => setForm({ ...form, judgeName: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none"
              required
            />

            <input
              type="date"
              value={form.hearingDate}
              onChange={(e) => setForm({ ...form, hearingDate: e.target.value })}
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none"
              required
            />

            <select
              value={form.verdict}
              onChange={(e) =>
                setForm({ ...form, verdict: e.target.value as CourtCase["verdict"] })
              }
              className="bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="Pending">Pending</option>
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
            {editMode ? "Update Case" : "Create Case"}
          </Button>
        </form>
      )}

      <div className="glass rounded-xl overflow-hidden animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {["Case Number", "Crime Linked", "Court", "Judge", "Hearing Date", "Reminder", "Verdict", "View"].map((header) => (
                <th key={header} className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courtCases.map((courtCase) => (
              <tr key={courtCase.id} className="border-b border-border/30 hover:bg-primary/[0.03] transition-colors">
                <td className="p-4 font-mono text-xs text-foreground">{courtCase.caseNumber}</td>
                <td className="p-4 font-mono text-xs">
                  <button
                    onClick={() => setSelectedCase(courtCase)}
                    className="text-primary hover:underline"
                  >
                    {courtCase.crimeLinked}
                  </button>
                </td>
                <td className="p-4 text-foreground">{courtCase.courtName}</td>
                <td className="p-4 text-foreground">{courtCase.judgeName}</td>
                <td className="p-4 text-muted-foreground">{courtCase.hearingDate}</td>
                <td className="p-4 text-xs font-semibold">
                  {getHearingReminder(courtCase.hearingDate) === "Tomorrow" && (
                    <span className="text-yellow-400">Tomorrow</span>
                  )}
                </td>
                <td className="p-4"><StatusBadge status={courtCase.verdict} /></td>
                <td className="p-4">
                  <button
                    onClick={() => setSelectedCase(courtCase)}
                    className="text-xs px-3 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/10 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCase && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--card))] border border-border rounded-xl w-[460px] p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Case Details</h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Case Number:</span>
                <div className="font-mono">{selectedCase.caseNumber}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Crime Linked:</span>
                <div className="text-primary font-medium">{selectedCase.crimeLinked}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Court Name:</span>
                <div>{selectedCase.courtName}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Judge:</span>
                <div>{selectedCase.judgeName}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Hearing Date:</span>
                <div>{selectedCase.hearingDate}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Verdict:</span>
                <div className="mt-1">
                  <StatusBadge status={selectedCase.verdict} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary/40"
                >
                  Close
                </button>
                {canDeleteCourtCases && (
                  <Button
                    variant="destructive"
                    className="rounded-lg"
                    onClick={async () => {
                      if (
                        !selectedCase ||
                        !window.confirm(`Delete court case ${selectedCase.caseNumber}?`)
                      ) {
                        return;
                      }

                      try {
                        await removeCourtCase(selectedCase.id);
                        setSelectedCase(null);
                        toast({
                          title: "Court case deleted",
                          description: `Case ${selectedCase.caseNumber} has been removed.`,
                        });
                      } catch (error) {
                        toast({
                          title: "Unable to delete court case",
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
                {canManageCourtCases && (
                  <Button
                    onClick={() => {
                      if (!selectedCase) {
                        return;
                      }

                      setForm({
                        crimeLinked: selectedCase.crimeLinked,
                        courtName: selectedCase.courtName,
                        judgeName: selectedCase.judgeName,
                        hearingDate: selectedCase.hearingDate,
                        verdict: selectedCase.verdict,
                      });
                      setEditMode(true);
                      setEditingId(selectedCase.id);
                      setShowForm(true);
                      setSelectedCase(null);
                    }}
                    className="rounded-lg"
                  >
                    Edit Case
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

export default CourtCases;
