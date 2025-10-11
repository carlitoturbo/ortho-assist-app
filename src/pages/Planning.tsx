import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Phone, Mail, X, Check, CalendarClock, ChevronDown, ChevronUp } from "lucide-react";
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
import { format } from "date-fns";
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
  status: "pending" | "accepted" | "declined";
}

interface ExpandedState {
  [key: number]: boolean;
}

const Planning = () => {
  const [requests, setRequests] = useState<AppointmentRequest[]>([
    {
      id: 1,
      patient: "Sarah Johnson",
      phone: "(555) 234-5678",
      email: "sarah.j@email.com",
      treatment: "Cleaning",
      requestedDate: "Mar 15, 2025",
      requestedTime: "10:00 AM",
      duration: "60 min",
      notes: "First visit, mild anxiety about dental procedures",
      status: "pending",
    },
    {
      id: 2,
      patient: "Michael Chen",
      phone: "(555) 345-6789",
      email: "michael.c@email.com",
      treatment: "Root Canal",
      requestedDate: "Mar 16, 2025",
      requestedTime: "02:00 PM",
      duration: "90 min",
      notes: "Experiencing pain in lower right molar",
      status: "pending",
    },
    {
      id: 3,
      patient: "Emily Davis",
      phone: "(555) 456-7890",
      email: "emily.d@email.com",
      treatment: "Checkup",
      requestedDate: "Mar 14, 2025",
      requestedTime: "09:00 AM",
      duration: "30 min",
      status: "pending",
    },
    {
      id: 4,
      patient: "James Wilson",
      phone: "(555) 567-8901",
      email: "james.w@email.com",
      treatment: "Filling",
      requestedDate: "Mar 17, 2025",
      requestedTime: "11:30 AM",
      duration: "45 min",
      notes: "Cavity detected during last checkup",
      status: "pending",
    },
    {
      id: 5,
      patient: "Lisa Anderson",
      phone: "(555) 678-9012",
      email: "lisa.a@email.com",
      treatment: "Whitening",
      requestedDate: "Mar 18, 2025",
      requestedTime: "03:00 PM",
      duration: "60 min",
      status: "pending",
    },
  ]);

  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});

  const [proposeDialogOpen, setProposeDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | null>(null);
  const [proposedDate, setProposedDate] = useState<Date>();
  const [proposedTime, setProposedTime] = useState<string>("");
  const [proposalNotes, setProposalNotes] = useState<string>("");

  const handleAccept = (id: number) => {
    setRequests(requests.filter((r) => r.id !== id));
    toast.success("Appointment accepted and added to schedule!");
  };

  const handleDecline = (id: number) => {
    setRequests(requests.filter((r) => r.id !== id));
    toast.error("Appointment request declined");
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

  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointment Planning</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage incoming appointment requests from patients.
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pendingRequests.length} Pending
        </Badge>
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarClock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No pending requests</h3>
            <p className="text-muted-foreground">All appointment requests have been processed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pendingRequests.map((request) => {
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
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Treatment</p>
                            <p className="text-sm text-foreground">{request.treatment}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Contact</p>
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
                        </div>

                        {request.notes && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Patient Notes</p>
                            <p className="text-sm text-foreground">{request.notes}</p>
                          </div>
                        )}
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
                    {proposedDate ? format(proposedDate, "PPP") : "Pick a date"}
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
                  <SelectItem value="09:00">09:00 AM</SelectItem>
                  <SelectItem value="09:30">09:30 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="10:30">10:30 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="11:30">11:30 AM</SelectItem>
                  <SelectItem value="14:00">02:00 PM</SelectItem>
                  <SelectItem value="14:30">02:30 PM</SelectItem>
                  <SelectItem value="15:00">03:00 PM</SelectItem>
                  <SelectItem value="15:30">03:30 PM</SelectItem>
                  <SelectItem value="16:00">04:00 PM</SelectItem>
                  <SelectItem value="16:30">04:30 PM</SelectItem>
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
