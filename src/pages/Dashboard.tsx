import {
  FileWarning,
  Search,
  AlertTriangle,
  Scale,
  MapPin,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { RiskBadge, StatusBadge } from "@/components/RiskBadge";
import { useCrimeInsight } from "@/lib/crimeInsightStore";

const Dashboard = () => {
  const { criminals, crimes, courtCases, patrolUnits } = useCrimeInsight();
  const highRiskCount = criminals.filter((c) => c.riskLevel === "High").length;
  const activePending = courtCases.filter((c) => c.verdict === "Pending").length;
  const activePatrols = patrolUnits.filter((p) => p.status === "Active").length;
  const watchLocations = new Set(crimes.map((c) => c.location)).size;
  const statCards: Array<{
    title: string;
    value: number;
    icon: LucideIcon;
    accent?: "default" | "danger" | "warning" | "success";
  }> = [
    { title: "Total Crimes", value: crimes.length, icon: FileWarning, accent: "danger" },
    { title: "High Risk", value: highRiskCount, icon: AlertTriangle, accent: "danger" },
    { title: "Active Cases", value: crimes.filter(c => c.status !== "Closed").length, icon: Search },
    { title: "Open Court Cases", value: activePending, icon: Scale, accent: "warning" },
    { title: "Active Patrols", value: activePatrols, icon: Shield, accent: "success" },
    { title: "Watch Locations", value: watchLocations, icon: MapPin, accent: "warning" }
  ];

  // Hearings happening tomorrow
  const tomorrowHearings = courtCases.filter((c) => {
    if (!c.hearingDate) return false;

    const today = new Date();
    const hearing = new Date(c.hearingDate);

    const diff = Math.ceil(
      (hearing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diff === 1;
  });

  return (
    <div>
      <PageHeader title="Investigation Control Dashboard" subtitle="Real-time operational overview and threat analysis" />

      <div className="grid auto-rows-fr grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              accent={stat.accent}
            />
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Crimes */}
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5">
            Recent Crime Activity
          </h3>
          <div className="space-y-3">
            {crimes.slice(0, 4).map((crime, i) => (
              <div key={crime.id} className="flex items-center justify-between p-3.5 bg-secondary/40 rounded-lg border border-border/50 hover:border-primary/20 transition-all duration-200 hover:bg-secondary/60" style={{ animationDelay: `${i * 100}ms` }}>
                <div>
                  <p className="text-sm font-semibold text-foreground">{crime.type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{crime.location} · {crime.date}</p>
                </div>
                <RiskBadge level={crime.severity} />
              </div>
            ))}
          </div>
        </div>

        {/* High Risk Criminals */}
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5">
            High Priority Subjects
          </h3>
          <div className="space-y-3">
            {criminals
              .filter(c => c.riskLevel === "High" || c.riskLevel === "Medium")
              .sort((a, b) => {
                const aNum = parseInt(a.id.replace(/[^0-9]/g, ""));
                const bNum = parseInt(b.id.replace(/[^0-9]/g, ""));
                return aNum - bNum;
              })
              .map((crim, i) => (
              <div
                key={crim.id}
                className="flex items-start gap-3 p-3.5 bg-secondary/40 rounded-lg border border-border/50 hover:border-primary/20 transition-all duration-200 hover:bg-secondary/60"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {crim.firstName[0]}{crim.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-5 break-words">
                      {crim.firstName} {crim.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">{crim.city}</p>
                  </div>
                </div>
                <div className="ml-auto flex max-w-[48%] shrink-0 flex-wrap justify-end gap-2">
                  <RiskBadge level={crim.riskLevel} className="shrink-0" />
                  <StatusBadge status={crim.status} className="shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hearing Reminders */}
        <div className="glass rounded-xl p-6 animate-fade-in">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5">
            Court Hearing Alerts
          </h3>

          {tomorrowHearings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hearings scheduled for tomorrow.</p>
          ) : (
            <div className="space-y-3">
              {tomorrowHearings.map((c, i) => (
                <div
                  key={c.caseNumber}
                  className="flex items-center justify-between p-3.5 bg-secondary/40 rounded-lg border border-border/50 hover:border-primary/20 transition-all duration-200 hover:bg-secondary/60"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {c.caseNumber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hearing Tomorrow · Judge {c.judgeName}
                    </p>
                  </div>

                  <span className="text-yellow-400 text-xs font-semibold">
                    Tomorrow
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
