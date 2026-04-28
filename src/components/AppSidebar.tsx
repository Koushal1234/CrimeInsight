import {
  LayoutDashboard,
  Users,
  FileWarning,
  UserCheck,
  Scale,
  Shield,
  Building2,
  BarChart3,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { CrimeInsightLogo } from "@/components/CrimeInsightLogo";
import { useAuth } from "@/lib/authContext";
import type { OfficerRole } from "@/lib/authStorage";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems: Array<{
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles?: OfficerRole[];
}> = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Criminals", url: "/criminals", icon: Users },
  { title: "Crime Records", url: "/crimes", icon: FileWarning },
  { title: "Victims", url: "/victims", icon: UserCheck },
  { title: "Court Cases", url: "/court-cases", icon: Scale },
  { title: "Patrol Units", url: "/patrol", icon: Shield, roles: ["Admin", "Officer"] },
  { title: "Police Stations", url: "/police-stations", icon: Building2, roles: ["Admin", "Officer"] },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, hasRole } = useAuth();
  const visibleMenuItems = menuItems.filter(
    (item) => !item.roles || hasRole(...item.roles)
  );

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="p-4 border-b border-sidebar-border">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="w-full text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Go to dashboard"
        >
          <CrimeInsightLogo collapsed={collapsed} size="md" />
        </button>
      </div>

      <SidebarContent className="py-3 px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        end
                        className={`group relative rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-accent text-sidebar-foreground hover:text-foreground"
                        }`}
                        activeClassName="bg-primary/10 text-primary font-semibold"
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                        )}
                        <item.icon className="mr-3 h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="w-full flex items-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all duration-200 px-2 py-2"
              >
                <LogOut className="mr-3 h-4 w-4 shrink-0" />
                {!collapsed && <span className="text-sm">Logout</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}
