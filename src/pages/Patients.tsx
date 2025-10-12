import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

interface Patient {
  id: number;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  mail: string | null;
  birth_date: string | null;
}

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .order("last_name", { ascending: true });

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.toLowerCase();
    const phone = patient.phone?.toLowerCase() || "";
    const email = patient.mail?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || phone.includes(search) || email.includes(search);
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground mt-1">View and manage patient records</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search patients by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {searchTerm ? "No patients found matching your search" : "No patients found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <TableCell className="font-medium">
                        {patient.first_name && patient.last_name
                          ? `${patient.first_name} ${patient.last_name}`
                          : "Unknown"}
                      </TableCell>
                      <TableCell>{patient.phone || "N/A"}</TableCell>
                      <TableCell>{patient.mail || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Patients;
