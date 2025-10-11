import { LayoutDashboard, Calendar, Clock, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Appointment Planning", url: "/planning", icon: Calendar },
  { title: "Upcoming Appointments", url: "/appointments", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function DentalSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r flex flex-col">
      <SidebarContent className="pt-16 pb-8">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) => {
                        // Check if current path starts with the nav item url (for nested routes)
                        const currentPath = window.location.pathname;
                        const isActiveOrParent = isActive || 
                          (item.url !== "/" && currentPath.startsWith(item.url));
                        
                        return isActiveOrParent
                          ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
                          : "hover:bg-sidebar-accent/50";
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
