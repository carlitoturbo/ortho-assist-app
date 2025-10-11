import { Calendar, Clock, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (
            first_name,
            last_name
          )
        `)
        .gte("appointment_date", today)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })
        .limit(3);

      if (error) throw error;

      const formatted = data?.map((apt: any) => ({
        id: apt.id,
        time: apt.appointment_time.substring(0, 5),
        patient: `${apt.patients.first_name} ${apt.patients.last_name}`,
        treatment: apt.treatment,
        status: apt.status,
      })) || [];

      setUpcomingAppointments(formatted);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: "Today's Appointments", value: "8", icon: Calendar, color: "text-primary" },
    { label: "Pending Confirmations", value: "3", icon: Clock, color: "text-accent" },
    { label: "Total Patients", value: "247", icon: Users, color: "text-muted-foreground" },
    { label: "This Month", value: "+15%", icon: TrendingUp, color: "text-green-600" },
  ];

  return (
    <div className="h-full overflow-auto space-y-6">
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
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : upcomingAppointments.length === 0 ? (
            <p className="text-muted-foreground">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between border-l-4 border-primary bg-muted/30 p-4 rounded-r-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate("/appointments", { state: { highlightId: apt.id } })}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
