import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  appointmentId: number;
  onRecordingComplete?: (fileUrl: string) => void;
}

export const AudioRecorder = ({ appointmentId, onRecordingComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await saveRecording(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Your audio is being recorded",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveRecording = async (audioBlob: Blob) => {
    setIsSaving(true);
    try {
      const timestamp = new Date().toISOString();
      const fileName = `appointment-${appointmentId}-${timestamp}.webm`;
      const filePath = `${appointmentId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("appointment-recordings")
        .upload(filePath, audioBlob, {
          contentType: "audio/webm",
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("appointment-recordings")
        .getPublicUrl(filePath);

      toast({
        title: "Recording saved",
        description: "Your audio has been saved successfully",
      });

      if (onRecordingComplete) {
        onRecordingComplete(urlData.publicUrl);
      }
    } catch (error) {
      console.error("Error saving recording:", error);
      toast({
        title: "Error",
        description: "Failed to save recording",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !isSaving && (
        <Button
          onClick={startRecording}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Mic className="h-4 w-4" />
          Record
        </Button>
      )}
      
      {isRecording && (
        <Button
          onClick={stopRecording}
          variant="destructive"
          size="sm"
          className="gap-2 animate-pulse"
        >
          <Square className="h-4 w-4" />
          Stop Recording
        </Button>
      )}
      
      {isSaving && (
        <Button variant="outline" size="sm" disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </Button>
      )}
    </div>
  );
};
