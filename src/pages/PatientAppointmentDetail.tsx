import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, FileAudio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AppointmentData {
  id: number;
  appointment_date: string;
  appointment_time: string;
  treatment: string;
  status: string;
  duration_minutes: number;
  transcription: string | null;
  patient?: {
    first_name: string | null;
    last_name: string | null;
  };
  patient_id: number;
}

const PatientAppointmentDetail = () => {
  const { patientId, appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      
      setIsLoading(true);
      
      try {
        const { data: appointmentData, error: appointmentError } = await supabase
          .from("appointments")
          .select(`
            *,
            patient:patients!appointments_patient_id_fkey (
              first_name,
              last_name
            )
          `)
          .eq("id", Number(appointmentId))
          .maybeSingle();

        if (appointmentError) throw appointmentError;
        
        if (appointmentData) {
          const transformedData = {
            ...appointmentData,
            patient: Array.isArray(appointmentData.patient) 
              ? appointmentData.patient[0] 
              : appointmentData.patient
          };
          setAppointment(transformedData as AppointmentData);

          // Check if there's a recording
          const { data: files } = await supabase.storage
            .from("appointment-recordings")
            .list(`${appointmentId}/`, { limit: 1 });
          
          if (files && files.length > 0) {
            setHasRecording(true);
            
            // Get the public URL for the audio file
            const { data: urlData } = supabase.storage
              .from("appointment-recordings")
              .getPublicUrl(`${appointmentId}/${files[0].name}`);
            
            setAudioUrl(urlData.publicUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleTranscribe = async () => {
    if (!appointment) return;
    
    setIsTranscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { appointmentId: appointment.id }
      });

      if (error) throw error;

      if (data?.transcription) {
        setAppointment({ ...appointment, transcription: data.transcription });
        toast({
          title: "Transcription complete",
          description: "Audio has been transcribed successfully",
        });
      }
    } catch (error) {
      console.error("Error transcribing:", error);
      toast({
        title: "Error",
        description: "Failed to transcribe recording",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Not Found</h2>
          <p className="text-muted-foreground mb-4">The appointment you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/patients/${patientId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patient
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-6 space-y-6">
        <div className="sticky top-0 z-10 bg-background flex items-center gap-4 py-4 border-b border-border">
          <Button variant="ghost" onClick={() => navigate(`/patients/${patientId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              {appointment.patient?.first_name && appointment.patient?.last_name
                ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                : "Unknown Patient"}
            </h1>
          </div>
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

        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Appointment Details</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-lg font-semibold text-foreground">
                  {format(new Date(appointment.appointment_date), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-lg font-semibold text-foreground">
                  {appointment.appointment_time.substring(0, 5)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold text-foreground">
                  {appointment.duration_minutes} min
                </p>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-muted-foreground">Treatment</p>
                <p className="text-lg font-semibold text-foreground">{appointment.treatment}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(appointment.transcription || hasRecording) && (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Recording Transcription</h2>
                {!appointment.transcription && hasRecording && (
                  <Button
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    size="sm"
                    className="gap-2"
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <FileAudio className="h-4 w-4" />
                        Transcribe Audio
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Audio Recording</p>
                <audio 
                  controls 
                  className={`w-full ${!audioUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {audioUrl && <source src={audioUrl} type="audio/webm" />}
                  Your browser does not support the audio element.
                </audio>
                {!audioUrl && (
                  <p className="text-xs text-muted-foreground mt-1">No recording available</p>
                )}
              </div>
              
              {appointment.transcription ? (
                <div className="prose max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">{appointment.transcription}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Click "Transcribe Audio" to generate a text transcript of the recording
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientAppointmentDetail;
