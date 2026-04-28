import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  fetchReportsSummary,
  type ReportsSummaryApiRecord,
} from "@/lib/crimeInsightApi";

const RISK_COLORS = {
  High: "hsl(0, 72%, 51%)",
  Medium: "hsl(38, 92%, 50%)",
  Low: "hsl(160, 84%, 39%)",
};

const STATUS_COLORS = ["hsl(210, 100%, 56%)", "hsl(0, 72%, 51%)", "hsl(160, 84%, 39%)"];

const STATUS_COLOR_MAP: Record<string, string> = {
  Active: "hsl(210, 100%, 56%)",
  Arrested: "hsl(0, 72%, 51%)",
  Released: "hsl(160, 84%, 39%)",
};

const tooltipStyle = {
  backgroundColor: "hsl(220, 30%, 10%)",
  border: "1px solid hsl(220, 15%, 16%)",
  borderRadius: "8px",
  color: "hsl(210, 20%, 92%)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const initialSummary: ReportsSummaryApiRecord = {
  severityData: [],
  locationData: [],
  riskData: [],
  arrestData: [],
};

const Reports = () => {
  const [summary, setSummary] = useState<ReportsSummaryApiRecord>(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetchReportsSummary();
        if (cancelled) {
          return;
        }
        setSummary(response);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setLoadError(
          error instanceof Error ? error.message : "Unable to load analytics"
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Crime Analytics"
          subtitle="Statistical overview and intelligence reports"
        />
        <div className="glass rounded-xl p-6 text-sm text-muted-foreground">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <PageHeader
          title="Crime Analytics"
          subtitle="Statistical overview and intelligence reports"
        />
        <div className="glass rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-destructive">Analytics unavailable</p>
            <p className="text-sm text-muted-foreground">{loadError}</p>
          </div>
          <Button onClick={() => window.location.reload()} size="sm">
            Reload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Crime Analytics"
        subtitle="Statistical overview and intelligence reports"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            title: "Crimes by Severity",
            chart: (
              <PieChart margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
                <Pie
                  data={summary.severityData}
                  cx="40%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(222, 47%, 6%)"
                  paddingAngle={2}
                  label={({ name, value, x, y }) => (
                    <text
                      x={x}
                      y={y}
                      fill={RISK_COLORS[name as keyof typeof RISK_COLORS]}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={14}
                      fontWeight="600"
                    >
                      {`${name}: ${value}`}
                    </text>
                  )}
                  labelLine={true}
                >
                  {summary.severityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  separator=": "
                  formatter={(value, name) => [
                    <span style={{ color: "hsl(210, 20%, 92%)" }}>{value}</span>,
                    <span
                      style={{
                        color: RISK_COLORS[name as keyof typeof RISK_COLORS],
                      }}
                    >
                      {name}
                    </span>,
                  ]}
                />
              </PieChart>
            ),
          },
          {
            title: "Crime Distribution by Area",
            chart: (
              <BarChart data={summary.locationData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 15%, 14%)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(210, 100%, 56%)"
                  radius={[6, 6, 0, 0]}
                  activeBar={false}
                >
                  <LabelList
                    dataKey="count"
                    position="top"
                    fill="hsl(210, 20%, 92%)"
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            ),
          },
          {
            title: "Arrest Status Overview",
            chart: (
              <PieChart margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
                <Pie
                  data={summary.arrestData}
                  cx="35%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(222, 47%, 6%)"
                  label={({ name, value, x, y }) => {
                    const offsetX = name === "Released" ? 12 : 0;
                    return (
                      <text
                        x={(x as number) + offsetX}
                        y={y}
                        fill={STATUS_COLOR_MAP[name as keyof typeof STATUS_COLOR_MAP]}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={14}
                        fontWeight="600"
                      >
                        {`${name}: ${value}`}
                      </text>
                    );
                  }}
                >
                  {summary.arrestData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  separator=": "
                  formatter={(value, name) => [
                    <span style={{ color: "hsl(210, 20%, 92%)" }}>{value}</span>,
                    <span
                      style={{
                        color:
                          STATUS_COLOR_MAP[name as keyof typeof STATUS_COLOR_MAP],
                      }}
                    >
                      {name}
                    </span>,
                  ]}
                />
                <Legend
                  wrapperStyle={{ color: "hsl(210, 20%, 92%)" }}
                />
              </PieChart>
            ),
          },
          {
            title: "Risk Level Distribution",
            chart: (
              <BarChart data={summary.riskData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 15%, 14%)"
                />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }}
                  width={60}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "transparent" }}
                  separator=": "
                  formatter={(value, name) => [
                    <span style={{ color: "hsl(210, 20%, 92%)" }}>{value}</span>,
                    <span
                      style={{
                        color: RISK_COLORS[name as keyof typeof RISK_COLORS],
                      }}
                    >
                      {name}
                    </span>,
                  ]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    fill="hsl(210, 20%, 92%)"
                    fontSize={11}
                  />
                  {summary.riskData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]}
                    />
                  ))}
                </Bar>
              </BarChart>
            ),
          },
        ].map(({ title, chart }) => (
          <div key={title} className="glass rounded-xl p-6 animate-fade-in">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-5">
              {title}
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              {chart}
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
