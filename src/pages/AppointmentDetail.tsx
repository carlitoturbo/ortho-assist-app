import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Phone, Mail, ArrowLeft, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AppointmentData {
  id: number;
  appointment_date: string;
  appointment_time: string;
  treatment: string;
  status: string;
  duration_minutes: number;
  notes: string | null;
  patient?: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    mail: string | null;
  };
}

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

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

                {appointment.notes && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Notes</h3>
                    <p className="text-base text-foreground whitespace-pre-wrap">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentDetail;
