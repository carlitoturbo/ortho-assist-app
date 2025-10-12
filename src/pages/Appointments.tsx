import { useState, useRef, useEffect } from "react";
import { Search, Phone, Mail, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppointmentsDayCalendar } from "@/components/AppointmentsDayCalendar";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow, addDays, subDays } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const appointmentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [treatmentFilter, setTreatmentFilter] = useState<string>("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (
            first_name,
            last_name,
            phone,
            mail
          )
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;

      const formattedAppointments: AppointmentType[] = data.map((apt: any) => {
        return {
          id: apt.id,
          date: apt.appointment_date,
          time: apt.appointment_time.substring(0, 5), // Format HH:MM
          patient: `${apt.patients.first_name} ${apt.patients.last_name}`,
          phone: apt.patients.phone || "N/A",
          email: apt.patients.mail || "N/A",
          treatment: apt.treatment,
          status: apt.status,
          duration: `${apt.duration_minutes} min`,
        };
      });

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
    setHighlightedId(null);
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
    setHighlightedId(null);
  };

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, dd MMMM yyyy");
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  
  // Get unique treatments for filter
  const uniqueTreatments = Array.from(new Set(appointments.map(apt => apt.treatment))).sort();
  
  // Apply all filters
  const dayAppointments = appointments
    .filter((apt) => apt.date === selectedDateStr)
    .filter((apt) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          apt.patient.toLowerCase().includes(query) ||
          apt.treatment.toLowerCase().includes(query) ||
          apt.phone.toLowerCase().includes(query) ||
          apt.email.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((apt) => {
      // Status filter
      if (statusFilter === "all") return true;
      return apt.status === statusFilter;
    })
    .filter((apt) => {
      // Treatment filter
      if (treatmentFilter === "all") return true;
      return apt.treatment === treatmentFilter;
    });

  useEffect(() => {
    if (highlightedId && appointmentRefs.current[highlightedId]) {
      appointmentRefs.current[highlightedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [highlightedId]);

  // Set initial date based on highlighted appointment
  useEffect(() => {
    if (appointments.length === 0 || !location.state?.highlightId) return;

    const apt = appointments.find((a) => a.id === location.state.highlightId);
    if (apt) {
      setSelectedDate(new Date(apt.date));
    }
  }, [appointments, location.state]);

  const handleAppointmentInteraction = (id: number) => {
    navigate(`/appointments/${id}`);
  };

  if (isLoading) {
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
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search patients..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {(statusFilter !== "all" || treatmentFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {[statusFilter !== "all", treatmentFilter !== "all"].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background" align="end">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Treatment</label>
                  <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">All Treatments</SelectItem>
                      {uniqueTreatments.map((treatment) => (
                        <SelectItem key={treatment} value={treatment}>
                          {treatment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(statusFilter !== "all" || treatmentFilter !== "all") && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStatusFilter("all");
                      setTreatmentFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Day Navigation Bar */}
      <div className="flex items-center justify-between mb-4 px-4 py-3 bg-muted/30 rounded-lg border border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousDay}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateDisplay(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setHighlightedId(null);
                  }
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Badge variant="secondary">
            {dayAppointments.length} {dayAppointments.length === 1 ? "appointment" : "appointments"}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDay}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left Side - Appointments List */}
        <div className="flex-1 overflow-auto space-y-3 pr-2 p-1">
          {dayAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No appointments scheduled for this day</p>
              </CardContent>
            </Card>
          ) : (
            dayAppointments.map((apt) => {
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
                    <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{apt.patient}</h3>
                          <Badge
                            variant={apt.status === "confirmed" ? "default" : "secondary"}
                            className={
                              apt.status === "confirmed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : apt.status === "declined"
                                ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
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
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(apt.date), "dd/MM/yyyy")}
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
                  </div>
                </CardContent>
              </Card>
            );
          })
          )}
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
            selectedDate={getDateDisplay(selectedDate)}
            highlightedId={highlightedId}
            onAppointmentClick={handleAppointmentInteraction}
            onAppointmentHover={setHighlightedId}
          />
        </div>
      </div>
    </div>
  );
};

export default Appointments;
