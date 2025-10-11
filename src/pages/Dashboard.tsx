import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const todayAppointments = [
    { time: "09:00", patient: "Sarah Johnson", treatment: "Cleaning", status: "confirmed" },
    { time: "10:30", patient: "Michael Chen", treatment: "Root Canal", status: "confirmed" },
    { time: "14:00", patient: "Emily Davis", treatment: "Checkup", status: "pending" },
    { time: "15:30", patient: "James Wilson", treatment: "Filling", status: "confirmed" },
  ];

  const stats = [
    { label: "Today's Appointments", value: "8", icon: Calendar, color: "text-primary" },
    { label: "Pending Confirmations", value: "3", icon: Clock, color: "text-accent" },
    { label: "Total Patients", value: "247", icon: Users, color: "text-muted-foreground" },
    { label: "This Month", value: "+15%", icon: TrendingUp, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your overview for today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.map((apt, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-l-4 border-primary bg-muted/30 p-4 rounded-r-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-primary min-w-[80px]">{apt.time}</div>
                  <div>
                    <div className="font-medium text-foreground">{apt.patient}</div>
                    <div className="text-sm text-muted-foreground">{apt.treatment}</div>
                  </div>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    apt.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {apt.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
