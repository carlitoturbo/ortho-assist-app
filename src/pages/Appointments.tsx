import { Search, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Appointments = () => {
  const upcomingAppointments = [
    {
      id: 1,
      date: "Today, 2:00 PM",
      patient: "Emily Davis",
      phone: "(555) 234-5678",
      email: "emily.d@email.com",
      treatment: "Checkup",
      status: "pending",
      duration: "30 min",
    },
    {
      id: 2,
      date: "Today, 3:30 PM",
      patient: "James Wilson",
      phone: "(555) 345-6789",
      email: "james.w@email.com",
      treatment: "Filling",
      status: "confirmed",
      duration: "45 min",
    },
    {
      id: 3,
      date: "Tomorrow, 9:00 AM",
      patient: "Lisa Anderson",
      phone: "(555) 456-7890",
      email: "lisa.a@email.com",
      treatment: "Cleaning",
      status: "confirmed",
      duration: "60 min",
    },
    {
      id: 4,
      date: "Tomorrow, 11:00 AM",
      patient: "Robert Brown",
      phone: "(555) 567-8901",
      email: "robert.b@email.com",
      treatment: "Root Canal",
      status: "confirmed",
      duration: "90 min",
    },
    {
      id: 5,
      date: "Mar 15, 10:30 AM",
      patient: "Maria Garcia",
      phone: "(555) 678-9012",
      email: "maria.g@email.com",
      treatment: "Crown Fitting",
      status: "pending",
      duration: "60 min",
    },
    {
      id: 6,
      date: "Mar 15, 2:00 PM",
      patient: "David Lee",
      phone: "(555) 789-0123",
      email: "david.l@email.com",
      treatment: "Extraction",
      status: "confirmed",
      duration: "45 min",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upcoming Appointments</h1>
          <p className="text-muted-foreground mt-1">View and manage scheduled appointments.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patients..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4">
        {upcomingAppointments.map((apt) => (
          <Card key={apt.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
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

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-medium text-foreground">{apt.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Treatment</p>
                      <p className="font-medium text-foreground">{apt.treatment}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">{apt.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{apt.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
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
        ))}
      </div>
    </div>
  );
};

export default Appointments;
