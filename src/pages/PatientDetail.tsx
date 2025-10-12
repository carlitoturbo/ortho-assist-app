import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, Clock, Loader2, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Patient {
  id: number;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  mail: string | null;
  birth_date: string | null;
  ensurance_number: string | null;
}

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  treatment: string;
  status: string;
  duration_minutes: number;
}

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [treatmentFilter, setTreatmentFilter] = useState("all");

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;

      try {
        // Fetch patient details
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("*")
          .eq("id", Number(id))
          .maybeSingle();

        if (patientError) throw patientError;
        setPatient(patientData);

        // Fetch patient appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", Number(id))
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false });

        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData || []);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  // Calculate unique treatments
  const uniqueTreatments = Array.from(new Set(appointments.map(apt => apt.treatment)));

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.treatment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesTreatment = treatmentFilter === "all" || appointment.treatment === treatmentFilter;
    return matchesSearch && matchesStatus && matchesTreatment;
  });

  // Count active filters
  const activeFiltersCount = [
    statusFilter !== "all",
    treatmentFilter !== "all",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setStatusFilter("all");
    setTreatmentFilter("all");
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground mb-4">The patient you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/patients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/patients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {patient.first_name && patient.last_name
                ? `${patient.first_name} ${patient.last_name}`
                : "Unknown Patient"}
            </h1>
            <p className="text-muted-foreground mt-1">Patient details and appointments</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Patient Information</h2>
            <div className="grid grid-cols-3 gap-x-12 gap-y-6">
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-base font-semibold text-foreground">
                  {patient.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-base font-semibold text-foreground break-all">
                  {patient.mail || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Birth Date</p>
                <p className="text-base font-semibold text-foreground">
                  {patient.birth_date
                    ? format(new Date(patient.birth_date), "MMMM d, yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Insurance Number</p>
                <p className="text-base font-semibold text-foreground">
                  {patient.ensurance_number || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Appointments</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by treatment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Treatment</label>
                        <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Treatments</SelectItem>
                            {uniqueTreatments.map((treatment) => (
                              <SelectItem key={treatment} value={treatment}>
                                {treatment}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          onClick={handleClearFilters}
                          className="w-full"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No appointments found for this patient</p>
            ) : filteredAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No appointments match your filters</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/patients/${id}/appointments/${appointment.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {format(new Date(appointment.appointment_date), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          {appointment.appointment_time.substring(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell>{appointment.treatment}</TableCell>
                      <TableCell>{appointment.duration_minutes} min</TableCell>
                      <TableCell>
                        <Badge
                          variant={appointment.status === "confirmed" ? "default" : "secondary"}
                          className={
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : appointment.status === "declined"
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDetail;
