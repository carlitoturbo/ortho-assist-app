import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Phone, Mail, ArrowLeft, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isTomorrow } from "date-fns";

interface AppointmentDetail {
  id: number;
  date: string;
  time: string;
  patient: string;
  phone: string;
  email: string;
  treatment: string;
  status: string;
  duration: string;
  notes?: string;
}

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          treatment,
          status,
          duration_minutes,
          notes,
          patients (
            first_name,
            last_name,
            phone,
            mail
          )
        `)
        .eq("id", Number(id))
        .maybeSingle();

      if (error) {
        console.error("Error fetching appointment:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const appointmentDate = new Date(data.appointment_date);
        let dateDisplay = format(appointmentDate, "dd/MM/yyyy");
        
        if (isToday(appointmentDate)) {
          dateDisplay = "Today";
        } else if (isTomorrow(appointmentDate)) {
          dateDisplay = "Tomorrow";
        }

        setAppointment({
          id: data.id,
          date: dateDisplay,
          time: data.appointment_time.substring(0, 5),
          patient: `${data.patients.first_name} ${data.patients.last_name}`,
          phone: data.patients.phone || "",
          email: data.patients.mail || "",
          treatment: data.treatment,
          status: data.status,
          duration: `${data.duration_minutes} min`,
          notes: data.notes,
        });
      }
      setLoading(false);
    };

    if (id) {
      fetchAppointment();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading appointment...</p>
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
                  <h2 className="text-2xl font-bold text-foreground">{appointment.patient}</h2>
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
                      <p className="text-base font-semibold text-foreground">{appointment.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-base font-semibold text-foreground">{appointment.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-base font-semibold text-foreground">{appointment.phone}</p>
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
                      <p className="text-base font-semibold text-foreground">{appointment.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-base font-semibold text-foreground break-all">{appointment.email}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="grid grid-cols-2 gap-8 divide-x divide-border">
                    <div className="pr-8">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Executive Summary</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Reason for Visit</p>
                          <ul className="list-disc list-inside text-base text-foreground space-y-1">
                            <li>Discomfort in lower right molar area</li>
                            <li>Requesting checkup and assessment</li>
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Medical History</p>
                          <ul className="list-disc list-inside text-base text-foreground space-y-1">
                            <li>No known allergies</li>
                            <li>Root canal treatment 2 years ago</li>
                            <li>Regular checkups every 6 months</li>
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</p>
                          <ul className="list-disc list-inside text-base text-foreground space-y-1">
                            <li>Prefers morning appointments</li>
                            <li>Slight anxiety about dental procedures</li>
                            <li>Prefers detailed explanations before treatment</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="pl-8">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Patient Information</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Medical History</p>
                          <ul className="list-disc list-inside text-base text-foreground space-y-1">
                            <li>Hypertension (controlled)</li>
                            <li>Type 2 Diabetes</li>
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Current Medications</p>
                          <ul className="list-disc list-inside text-base text-foreground space-y-1">
                            <li>Ibuprofen 400mg as needed</li>
                            <li>Multivitamin daily</li>
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Allergies</p>
                          <ul className="list-disc list-inside text-base text-foreground space-y-1">
                            <li>None reported</li>
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Previous Treatments</p>
                          <ul className="list-disc list-inside text-base text-foreground space-y-1">
                            <li>Root canal (2 years ago)</li>
                            <li>Teeth whitening (1 year ago)</li>
                            <li>Wisdom teeth extraction (5 years ago)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
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
