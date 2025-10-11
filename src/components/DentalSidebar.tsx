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
  { title: "Upcoming Appointments", url: "/appointments", icon: Calendar },
  { title: "Appointment Planning", url: "/planning", icon: Clock },
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
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                  >
                    {({ isActive }) => (
                      <SidebarMenuButton 
                        tooltip={item.title}
                        isActive={isActive}
                        className={isActive ? "bg-muted" : ""}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
