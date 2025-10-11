import { useState, useRef, useEffect } from "react";
import { Search, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AppointmentsDayCalendar } from "@/components/AppointmentsDayCalendar";

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
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("Today");
  const appointmentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const appointments: AppointmentType[] = [
    {
      id: 1,
      date: "Today",
      time: "2:00 PM",
      patient: "Emily Davis",
      phone: "(555) 234-5678",
      email: "emily.d@email.com",
      treatment: "Checkup",
      status: "pending",
      duration: "30 min",
    },
    {
      id: 2,
      date: "Today",
      time: "3:30 PM",
      patient: "James Wilson",
      phone: "(555) 345-6789",
      email: "james.w@email.com",
      treatment: "Filling",
      status: "confirmed",
      duration: "45 min",
    },
    {
      id: 3,
      date: "Today",
      time: "9:00 AM",
      patient: "Sarah Johnson",
      phone: "(555) 111-2222",
      email: "sarah.j@email.com",
      treatment: "Cleaning",
      status: "confirmed",
      duration: "60 min",
    },
    {
      id: 4,
      date: "Today",
      time: "11:00 AM",
      patient: "Robert Brown",
      phone: "(555) 567-8901",
      email: "robert.b@email.com",
      treatment: "Root Canal",
      status: "confirmed",
      duration: "90 min",
    },
    {
      id: 5,
      date: "Tomorrow",
      time: "10:30 AM",
      patient: "Maria Garcia",
      phone: "(555) 678-9012",
      email: "maria.g@email.com",
      treatment: "Crown Fitting",
      status: "pending",
      duration: "60 min",
    },
    {
      id: 6,
      date: "Tomorrow",
      time: "2:00 PM",
      patient: "David Lee",
      phone: "(555) 789-0123",
      email: "david.l@email.com",
      treatment: "Extraction",
      status: "confirmed",
      duration: "45 min",
    },
  ];

  useEffect(() => {
    if (highlightedId && appointmentRefs.current[highlightedId]) {
      appointmentRefs.current[highlightedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [highlightedId]);

  const handleAppointmentInteraction = (id: number) => {
    const apt = appointments.find((a) => a.id === id);
    if (apt) {
      setSelectedDate(apt.date);
      setHighlightedId(id);
    }
  };

  const todayAppointments = appointments.filter((apt) => apt.date === selectedDate);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">View and manage scheduled appointments</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-9" />
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left Side - Appointments List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 p-1">
          {appointments.map((apt) => {
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
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
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

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{apt.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{apt.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
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
            appointments={todayAppointments.map((apt) => ({
              id: apt.id,
              time: apt.time,
              duration: apt.duration,
              patient: apt.patient,
              treatment: apt.treatment,
              status: apt.status,
            }))}
            selectedDate={selectedDate}
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
