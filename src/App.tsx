import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Criminals from "./pages/Criminals";
import Crimes from "./pages/Crimes";
import Victims from "./pages/Victims";
import CourtCases from "./pages/CourtCases";
import Patrol from "./pages/Patrol";
import PoliceStations from "./pages/PoliceStations";
import Reports from "./pages/Reports";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./lib/authContext";
import { CrimeInsightProvider } from "./lib/crimeInsightStore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PublicOnlyRoute>
                  <Index />
                </PublicOnlyRoute>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <CrimeInsightProvider>
                    <AppLayout />
                  </CrimeInsightProvider>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/criminals" element={<Criminals />} />
                <Route path="/crimes" element={<Crimes />} />
                <Route path="/victims" element={<Victims />} />
                <Route path="/court-cases" element={<CourtCases />} />
                <Route path="/reports" element={<Reports />} />
                <Route element={<ProtectedRoute roles={["Admin", "Officer"]} />}>
                  <Route path="/patrol" element={<Patrol />} />
                  <Route path="/police-stations" element={<PoliceStations />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
