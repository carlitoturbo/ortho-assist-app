import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, Pause, Play, Save, SkipBack, SkipForward } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  appointmentId: number;
  onRecordingComplete?: (fileUrl: string) => void;
}

export const AudioRecorder = ({ appointmentId, onRecordingComplete }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingRecording, setExistingRecording] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingRecording();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [appointmentId]);

  const checkExistingRecording = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("appointment-recordings")
        .list(`${appointmentId}/`, {
          limit: 1,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const filePath = `${appointmentId}/${data[0].name}`;
        const { data: urlData } = supabase.storage
          .from("appointment-recordings")
          .getPublicUrl(filePath);
        setExistingRecording(urlData.publicUrl);
      }
    } catch (error) {
      console.error("Error checking existing recording:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      setIsPaused(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const saveCurrentRecording = async () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const playRecording = () => {
    if (existingRecording) {
      if (!audioRef.current) {
        audioRef.current = new Audio(existingRecording);
        
        audioRef.current.addEventListener('play', () => setIsPlaying(true));
        audioRef.current.addEventListener('pause', () => setIsPlaying(false));
        audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      }
      audioRef.current.play();
      toast({
        title: "Playing recording",
        description: "Audio playback started",
      });
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 15
      );
    }
  };

  const saveRecording = async (audioBlob: Blob) => {
    setIsSaving(true);
    try {
      // Delete existing recording if any
      if (existingRecording) {
        const { data: files } = await supabase.storage
          .from("appointment-recordings")
          .list(`${appointmentId}/`);
        
        if (files && files.length > 0) {
          const filesToDelete = files.map(file => `${appointmentId}/${file.name}`);
          await supabase.storage
            .from("appointment-recordings")
            .remove(filesToDelete);
        }
      }

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

      setExistingRecording(urlData.publicUrl);

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

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (existingRecording && !isRecording) {
    return (
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <Button
            onClick={playRecording}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Play
          </Button>
        ) : (
          <>
            <Button
              onClick={pausePlayback}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button
              onClick={skipBackward}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <SkipBack className="h-4 w-4" />
              -15s
            </Button>
            <Button
              onClick={skipForward}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <SkipForward className="h-4 w-4" />
              +15s
            </Button>
          </>
        )}
      </div>
    );
  }

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
      
      {isRecording && !isPaused && (
        <>
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
          <Button
            onClick={pauseRecording}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        </>
      )}

      {isPaused && (
        <>
          <Button
            onClick={resumeRecording}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Resume
          </Button>
          <Button
            onClick={saveCurrentRecording}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </>
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
