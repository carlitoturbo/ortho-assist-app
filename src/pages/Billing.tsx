import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Euro } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Billing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [treatmentFilter, setTreatmentFilter] = useState("all");

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["billing-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            ensurance_number
          )
        `)
        .eq("status", "confirmed")
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate unique treatments
  const uniqueTreatments = Array.from(
    new Set(appointments?.map((apt) => apt.treatment).filter(Boolean))
  );

  // Filter appointments
  const filteredAppointments = appointments?.filter((appointment) => {
    const matchesSearch =
      searchQuery === "" ||
      appointment.patients?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patients?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.treatment?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesTreatment = treatmentFilter === "all" || appointment.treatment === treatmentFilter;

    return matchesSearch && matchesStatus && matchesTreatment;
  }) || [];

  // Calculate summary statistics
  const totalRevenue = filteredAppointments.length * 100; // Placeholder calculation
  const pendingBilling = filteredAppointments.filter(apt => !apt.confirmation_sent).length;

  const activeFiltersCount = [
    statusFilter !== "all",
    treatmentFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter("all");
    setTreatmentFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Abrechnung</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Aus {filteredAppointments.length} Terminen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Abrechnungen</CardTitle>
            <Badge variant="outline">{pendingBilling}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBilling}</div>
            <p className="text-xs text-muted-foreground">
              Noch nicht abgerechnet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durchschnitt pro Termin</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{filteredAppointments.length > 0 ? (totalRevenue / filteredAppointments.length).toFixed(2) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Durchschnittlicher Umsatz
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suche nach Patient oder Behandlung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Status</SelectItem>
                        <SelectItem value="confirmed">Bestätigt</SelectItem>
                        <SelectItem value="pending">Ausstehend</SelectItem>
                        <SelectItem value="declined">Abgelehnt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Behandlung</label>
                    <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Behandlungen</SelectItem>
                        {uniqueTreatments.map((treatment) => (
                          <SelectItem key={treatment} value={treatment!}>
                            {treatment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Filter zurücksetzen
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Versicherungsnummer</TableHead>
                  <TableHead>Behandlung</TableHead>
                  <TableHead>Dauer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Lade Abrechnungsdaten...
                    </TableCell>
                  </TableRow>
                ) : filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {appointments?.length === 0
                        ? "Keine Abrechnungsdaten vorhanden"
                        : "Keine Ergebnisse für die aktuellen Filter"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {format(new Date(appointment.appointment_date), "dd.MM.yyyy", {
                          locale: de,
                        })}
                      </TableCell>
                      <TableCell>
                        {appointment.patients?.first_name} {appointment.patients?.last_name}
                      </TableCell>
                      <TableCell>
                        {appointment.patients?.ensurance_number || "-"}
                      </TableCell>
                      <TableCell>{appointment.treatment}</TableCell>
                      <TableCell>{appointment.duration_minutes} Min</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "confirmed"
                              ? "default"
                              : appointment.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {appointment.status === "confirmed"
                            ? "Bestätigt"
                            : appointment.status === "pending"
                            ? "Ausstehend"
                            : "Abgelehnt"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €100,00
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
