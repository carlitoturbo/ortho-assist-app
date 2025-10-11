import { useState, useRef, useEffect } from "react";
import { Search, Phone, Mail, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AppointmentsDayCalendar } from "@/components/AppointmentsDayCalendar";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow } from "date-fns";

interface AppointmentType {
  id: number;
  date: string;
  time: string;
  patient: string;
  phone: string;
  email: string;
  treatment: string;
  status: string;
  duration: string;
}

const Appointments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [highlightedId, setHighlightedId] = useState<number | null>(
    location.state?.highlightId || null
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const appointmentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointments from Supabase
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          treatment,
          status,
          duration_minutes,
          patients (
            first_name,
            last_name,
            phone,
            mail
          )
        `)
        .eq("status", "confirmed")
        .gte("appointment_date", today)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) {
        console.error("Error fetching appointments:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const formattedAppointments: AppointmentType[] = data.map((apt: any) => {
          const appointmentDate = new Date(apt.appointment_date);
          let dateDisplay = format(appointmentDate, "dd/MM/yyyy");
          
          if (isToday(appointmentDate)) {
            dateDisplay = "Today";
          } else if (isTomorrow(appointmentDate)) {
            dateDisplay = "Tomorrow";
          }

          return {
            id: apt.id,
            date: dateDisplay,
            time: apt.appointment_time.substring(0, 5), // Format HH:MM
            patient: `${apt.patients.first_name} ${apt.patients.last_name}`,
            phone: apt.patients.phone || "",
            email: apt.patients.mail || "",
            treatment: apt.treatment,
            status: apt.status,
            duration: `${apt.duration_minutes} min`,
          };
        });

        setAppointments(formattedAppointments);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, []);

  // Get unique days
  const uniqueDays = Array.from(new Set(appointments.map((apt) => apt.date)));
  const selectedDay = uniqueDays[selectedDayIndex];

  const handlePreviousDay = () => {
    setSelectedDayIndex((prev) => Math.max(0, prev - 1));
    setHighlightedId(null);
  };

  const handleNextDay = () => {
    setSelectedDayIndex((prev) => Math.min(uniqueDays.length - 1, prev + 1));
    setHighlightedId(null);
  };

  useEffect(() => {
    if (highlightedId && appointmentRefs.current[highlightedId]) {
      appointmentRefs.current[highlightedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [highlightedId]);

  // Set initial day based on highlighted appointment
  useEffect(() => {
    if (location.state?.highlightId) {
      const apt = appointments.find((a) => a.id === location.state.highlightId);
      if (apt) {
        const dayIndex = uniqueDays.indexOf(apt.date);
        if (dayIndex !== -1) {
          setSelectedDayIndex(dayIndex);
        }
      }
    }
  }, [location.state]);

  const handleAppointmentInteraction = (id: number) => {
    navigate(`/appointments/${id}`);
  };

  const dayAppointments = appointments.filter((apt) => apt.date === selectedDay);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">View and manage scheduled appointments</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-9" />
        </div>
      </div>

      {/* Day Navigation Bar */}
      <div className="flex items-center justify-between mb-4 px-4 py-3 bg-muted/30 rounded-lg border border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousDay}
          disabled={selectedDayIndex === 0}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold text-foreground">{selectedDay}</span>
          <Badge variant="secondary" className="ml-2">
            {dayAppointments.length} {dayAppointments.length === 1 ? "appointment" : "appointments"}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDay}
          disabled={selectedDayIndex === uniqueDays.length - 1}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left Side - Appointments List */}
        <div className="flex-1 overflow-auto space-y-3 pr-2 p-1">
          {dayAppointments.map((apt) => {
            const isHighlighted = highlightedId === apt.id;
            
            return (
              <Card
                key={apt.id}
                ref={(el) => (appointmentRefs.current[apt.id] = el)}
                className={cn(
                  "hover:shadow-md transition-all duration-200 cursor-pointer",
                  isHighlighted && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => handleAppointmentInteraction(apt.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{apt.patient}</h3>
                          <Badge
                            variant={apt.status === "confirmed" ? "default" : "secondary"}
                            className={
                              apt.status === "confirmed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            }
                          >
                            {apt.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium text-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {apt.date}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time</p>
                            <p className="font-medium text-foreground">{apt.time}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium text-foreground">{apt.duration}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground text-sm">Treatment</p>
                          <p className="font-medium text-foreground">{apt.treatment}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{apt.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{apt.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="whitespace-nowrap">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Side - Day Calendar View */}
        <div className="w-[500px] border-l border-border pl-6">
          <AppointmentsDayCalendar
            appointments={dayAppointments.map((apt) => ({
              id: apt.id,
              time: apt.time,
              duration: apt.duration,
              patient: apt.patient,
              treatment: apt.treatment,
              status: apt.status,
            }))}
            selectedDate={selectedDay}
            highlightedId={highlightedId}
            onAppointmentClick={handleAppointmentInteraction}
            onAppointmentHover={setHighlightedId}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default Appointments;
