import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { useCrimeInsight } from "@/lib/crimeInsightStore";

function getOfficerInitials(username: string) {
  const segments = username.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (segments.length >= 2) {
    return `${segments[0][0]}${segments[1][0]}`.toUpperCase();
  }

  return username.slice(0, 2).toUpperCase();
}

export function AppLayout() {
  const { officer } = useAuth();
  const { isLoading, loadError, reloadData } = useCrimeInsight();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-5 glass">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="glow-dot" />
                <span className="text-xs text-muted-foreground">System Active</span>
              </div>
              <div className="h-px w-4 bg-border rotate-90" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {officer?.role ?? "Officer"} Console
              </span>
              <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {officer ? getOfficerInitials(officer.username) : "--"}
                </span>
              </div>
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            {loadError && (
              <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-destructive">Data sync failed</p>
                    <p className="text-muted-foreground">{loadError}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      void reloadData();
                    }}
                    disabled={isLoading}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
