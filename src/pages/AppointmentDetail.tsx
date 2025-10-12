import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Phone, Mail, ArrowLeft, Clock, ChevronDown, ChevronUp, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { AudioRecorder } from "@/components/AudioRecorder";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AppointmentData {
  id: number;
  appointment_date: string;
  appointment_time: string;
  treatment: string;
  status: string;
  duration_minutes: number;
  notes: string | null;
  meeting_notes: string | null;
  patient?: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    mail: string | null;
  };
  patient_id: number;
}

interface Treatment {
  id: string;
  treatment: string;
  created_at: string;
  patient_id: number;
}

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [showAllTreatments, setShowAllTreatments] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch appointment with patient data
        const { data: appointmentData, error: appointmentError } = await supabase
          .from("appointments")
          .select(`
            *,
            patient:patients!appointments_patient_id_fkey (
              first_name,
              last_name,
              phone,
              mail
            )
          `)
          .eq("id", Number(id))
          .maybeSingle();

        if (appointmentError) throw appointmentError;
        
        if (appointmentData) {
          // Transform the nested patient object from array to single object
          const transformedData = {
            ...appointmentData,
            patient: Array.isArray(appointmentData.patient) 
              ? appointmentData.patient[0] 
              : appointmentData.patient
          };
          setAppointment(transformedData as AppointmentData);
          setMeetingNotes(appointmentData.meeting_notes || "");

          // Fetch treatments for this patient
          const { data: treatmentsData, error: treatmentsError } = await supabase
            .from("treatments")
            .select("*")
            .eq("patient_id", appointmentData.patient_id)
            .order("created_at", { ascending: false });

          if (treatmentsError) throw treatmentsError;
          if (treatmentsData) {
            setTreatments(treatmentsData);
          }
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const displayedTreatments = showAllTreatments ? treatments : treatments.slice(0, 3);

  const saveMeetingNotes = async () => {
    if (!appointment) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ meeting_notes: meetingNotes.trim() })
        .eq("id", appointment.id);

      if (error) throw error;

      toast({
        title: "Meeting notes saved",
        description: "Your notes have been saved successfully.",
      });

      // Update local state
      setAppointment({ ...appointment, meeting_notes: meetingNotes.trim() });
    } catch (error) {
      console.error("Error saving meeting notes:", error);
      toast({
        title: "Error saving notes",
        description: "Failed to save meeting notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Not Found</h2>
          <p className="text-muted-foreground mb-4">The appointment you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/appointments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-6 space-y-6">
        <div className="sticky top-0 z-10 bg-background flex items-center gap-4 py-4 border-b border-border px-6">
          <Button variant="ghost" onClick={() => navigate("/appointments")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointment Details</h1>
            <p className="text-muted-foreground mt-1">View and manage appointment information</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    {appointment.patient?.first_name && appointment.patient?.last_name
                      ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                      : "Unknown Patient"}
                  </h2>
                  <Badge
                    variant={appointment.status === "confirmed" ? "default" : "secondary"}
                    className={
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 px-3 py-1"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-base font-semibold text-foreground">
                        {format(new Date(appointment.appointment_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-base font-semibold text-foreground">
                        {appointment.appointment_time.substring(0, 5)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-base font-semibold text-foreground">
                        {appointment.patient?.phone || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-5 w-5 mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Treatment</p>
                      <p className="text-base font-semibold text-foreground">{appointment.treatment}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-base font-semibold text-foreground">
                        {appointment.duration_minutes} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-base font-semibold text-foreground break-all">
                        {appointment.patient?.mail || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <ResizablePanelGroup direction="horizontal" className="min-h-[200px]">
                    <ResizablePanel defaultSize={66.67} minSize={30}>
                      <div className="px-2 pr-10 space-y-6">
                        {appointment.notes && (
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Pre-Appointment Information</h3>
                            <p className="text-base text-foreground whitespace-pre-wrap">{appointment.notes}</p>
                          </div>
                        )}
                        
                        <div className="relative">
                          <h3 className="text-lg font-semibold text-foreground mb-4">Meeting Notes</h3>
                          <Textarea
                            value={meetingNotes}
                            onChange={(e) => setMeetingNotes(e.target.value)}
                            placeholder="Enter key points discussed during the appointment..."
                            className="min-h-[150px] resize-y w-full"
                          />
                          <div className="flex items-center justify-between mt-4">
                            <AudioRecorder appointmentId={appointment.id} />
                            <Button
                              onClick={saveMeetingNotes}
                              disabled={isSaving}
                              size="sm"
                              className="gap-2"
                            >
                              <Save className="h-4 w-4" />
                              {isSaving ? "Saving..." : "Save Notes"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={33.33} minSize={20}>
                      <div className="pl-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-foreground">Previous Treatments</h3>
                          {treatments.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllTreatments(!showAllTreatments)}
                              className="text-primary hover:text-primary"
                            >
                              {showAllTreatments ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  Show All ({treatments.length})
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        
                        {treatments.length === 0 ? (
                          <p className="text-muted-foreground text-sm">No previous treatments recorded.</p>
                        ) : (
                          <ul className="space-y-3">
                            {displayedTreatments.map((treatment) => (
                              <li key={treatment.id} className="flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-base text-foreground">{treatment.treatment}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(treatment.created_at), "MMMM d, yyyy")}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentDetail;
