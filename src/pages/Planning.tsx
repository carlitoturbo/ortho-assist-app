import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Phone, Mail, X, Check, CalendarClock, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, isAfter, startOfToday, parse } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DayCalendarView } from "@/components/DayCalendarView";

interface CalendarAppointment {
  time: string;
  duration: string;
  patientName: string;
  treatment: string;
  status: "current" | "confirmed" | "pending";
  date: string; // Store date as yyyy-MM-dd for easy comparison
}

interface AppointmentRequest {
  id: number;
  patient: string;
  phone: string;
  email: string;
  treatment: string;
  requestedDate: string;
  requestedTime: string;
  duration: string;
  notes?: string;
  status: string;
  appointmentDate: Date;
}

interface ExpandedState {
  [key: number]: boolean;
}

const Planning = () => {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [allAppointments, setAllAppointments] = useState<CalendarAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState<Date>();

  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const [proposeDialogOpen, setProposeDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [proposedDate, setProposedDate] = useState<Date>();
  const [proposedTime, setProposedTime] = useState<string>("");
  const [proposalNotes, setProposalNotes] = useState<string>("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Fetch all appointments for calendar context
      const { data: allData, error: allError } = await supabase
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
        .gte("appointment_date", format(startOfToday(), "yyyy-MM-dd"))
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (allError) throw allError;

      // Format all appointments for calendar view
      const calendarAppts: CalendarAppointment[] = allData.map((apt: any) => ({
        time: apt.appointment_time.substring(0, 5),
        duration: `${apt.duration_minutes} min`,
        patientName: `${apt.patients.first_name} ${apt.patients.last_name}`,
        treatment: apt.treatment,
        status: apt.status as "confirmed" | "pending",
        date: apt.appointment_date, // Store as yyyy-MM-dd
      }));

      setAllAppointments(calendarAppts);

      // Filter pending requests
      const pendingData = allData.filter((apt: any) => apt.status === "pending");
      const formattedRequests: AppointmentRequest[] = pendingData.map((apt: any) => {
        const appointmentDate = new Date(apt.appointment_date);
        return {
          id: apt.id,
          patient: `${apt.patients.first_name} ${apt.patients.last_name}`,
          phone: apt.patients.phone || "N/A",
          email: apt.patients.mail || "N/A",
          treatment: apt.treatment,
          requestedDate: format(appointmentDate, "dd/MM/yyyy"),
          requestedTime: apt.appointment_time.substring(0, 5),
          duration: `${apt.duration_minutes} min`,
          notes: apt.notes,
          status: apt.status,
          appointmentDate,
        };
      });

      setRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const getAppointmentsForDate = (dateStr: string, excludePatient: string): CalendarAppointment[] => {
    // Parse the date string (dd/MM/yyyy format) and convert to yyyy-MM-dd
    const [day, month, year] = dateStr.split('/');
    const targetDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Filter allAppointments to match the date and exclude the current patient
    return allAppointments.filter(apt => {
      return apt.date === targetDate && apt.patientName !== excludePatient;
    });
  };

  const handleAccept = async (id: number) => {
    console.log("Planning: accept clicked", { id });
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status: "confirmed" })
        .eq("id", id)
        .select("id,status");

      if (error) {
        console.error("Error accepting appointment:", error);
        toast.error("Failed to accept appointment. Do you have permission?");
        return;
      }

      if (!data || data.length === 0) {
        console.warn("No rows updated for appointment", { id });
        toast.error("No appointment updated. Please check permissions and try again.");
        return;
      }

      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Appointment accepted and added to schedule!");
    } catch (error) {
      console.error("Unexpected error accepting appointment:", error);
      toast.error("Failed to accept appointment");
    }
  };

  const handleDecline = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status: "declined" })
        .eq("id", id)
        .select("id,status");

      if (error) {
        console.error("Error declining appointment:", error);
        toast.error("Failed to decline appointment");
        return;
      }

      if (!data || data.length === 0) {
        console.warn("No rows updated for appointment", { id });
        toast.error("No appointment updated. Please try again.");
        return;
      }

      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.error("Appointment request declined");
    } catch (error) {
      console.error("Unexpected error declining appointment:", error);
      toast.error("Failed to decline appointment");
    }
  };

  const handleProposeTime = (request: AppointmentRequest) => {
    setSelectedRequest(request);
    setProposeDialogOpen(true);
  };

  const submitProposal = () => {
    if (!proposedDate || !proposedTime) {
      toast.error("Please select both date and time");
      return;
    }
    
    setRequests(requests.filter((r) => r.id !== selectedRequest?.id));
    toast.success("Alternative time proposed to patient");
    setProposeDialogOpen(false);
    setProposedDate(undefined);
    setProposedTime("");
    setProposalNotes("");
    setSelectedRequest(null);
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.patient.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !filterDate || format(request.appointmentDate, "yyyy-MM-dd") === format(filterDate, "yyyy-MM-dd");
    return matchesSearch && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointment Planning</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage incoming appointment requests from patients.
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {filteredRequests.length} Pending
        </Badge>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-shrink-0 px-1">
        <div className="relative flex-1">
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
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal whitespace-nowrap",
                !filterDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filterDate ? format(filterDate, "dd/MM/yyyy") : "Filter by date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={setFilterDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
            {filterDate && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setFilterDate(undefined)}
                >
                  Clear Filter
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarClock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {requests.length === 0 ? "No pending requests" : "No matching appointments"}
            </h3>
            <p className="text-muted-foreground">
              {requests.length === 0 
                ? "All appointment requests have been processed" 
                : searchQuery 
                ? "Try adjusting your search criteria"
                : "No appointments match the selected date"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-auto flex-1 space-y-2 pr-2">
          {filteredRequests.map((request) => {
            const isExpanded = expandedRows[request.id];
            
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Compact Row */}
                  <div className="flex items-center gap-4 p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleRow(request.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="font-semibold text-foreground">{request.patient}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{request.requestedDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{request.requestedTime}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>{request.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleAccept(request.id)}
                            className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Accept</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleProposeTime(request)}
                            className="h-9 w-9 hover:bg-muted"
                          >
                            <CalendarClock className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Propose Time</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDecline(request.id)}
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Decline</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Patient Details</p>
                            <div className="space-y-3 bg-background border border-border rounded-lg p-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Treatment</p>
                                <p className="text-sm text-foreground font-medium">{request.treatment}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Contact</p>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span>{request.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    <span>{request.email}</span>
                                  </div>
                                </div>
                              </div>
                              {request.notes && (
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Patient Notes</p>
                                  <p className="text-sm text-foreground">{request.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <DayCalendarView
                            date={request.requestedDate}
                            time={request.requestedTime}
                            duration={request.duration}
                            patientName={request.patient}
                            treatment={request.treatment}
                            otherAppointments={getAppointmentsForDate(request.requestedDate, request.patient)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={proposeDialogOpen} onOpenChange={setProposeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Propose Alternative Time</DialogTitle>
            <DialogDescription>
              Suggest a different date and time for {selectedRequest?.patient}'s appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Proposed Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !proposedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {proposedDate ? format(proposedDate, "dd/MM/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={proposedDate}
                    onSelect={setProposedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Proposed Time</Label>
              <Select value={proposedTime} onValueChange={setProposedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="09:30">09:30</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="10:30">10:30</SelectItem>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="11:30">11:30</SelectItem>
                  <SelectItem value="14:00">14:00</SelectItem>
                  <SelectItem value="14:30">14:30</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                  <SelectItem value="15:30">15:30</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                  <SelectItem value="16:30">16:30</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={proposalNotes}
                onChange={(e) => setProposalNotes(e.target.value)}
                placeholder="Add any notes for the patient..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProposeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitProposal}>Send Proposal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
};

export default Planning;
