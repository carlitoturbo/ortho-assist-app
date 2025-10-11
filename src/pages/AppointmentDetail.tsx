import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Phone, Mail, ArrowLeft, Clock } from "lucide-react";

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, fetch by ID
  const appointments = [
    {
      id: 1,
      date: "Today",
      time: "14:00",
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
      time: "15:30",
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
      time: "09:00",
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
      time: "11:00",
      patient: "Robert Brown",
      phone: "(555) 567-8901",
      email: "robert.b@email.com",
      treatment: "Root Canal",
      status: "confirmed",
      duration: "90 min",
    },
  ];

  const appointment = appointments.find((apt) => apt.id === Number(id));

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Executive Summary</h3>
                  <Card className="bg-muted/30">
                    <CardContent className="p-6">
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
                    </CardContent>
                  </Card>
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
