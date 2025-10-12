import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId } = await req.json();
    console.log("Transcribing audio for appointment:", appointmentId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the audio file from storage
    const { data: files, error: listError } = await supabase.storage
      .from("appointment-recordings")
      .list(`${appointmentId}/`, {
        limit: 1,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError || !files || files.length === 0) {
      throw new Error('No recording found for this appointment');
    }

    const filePath = `${appointmentId}/${files[0].name}`;
    console.log("Found recording:", filePath);

    // Download the audio file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("appointment-recordings")
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error('Failed to download recording');
    }

    console.log("Downloaded file, size:", fileData.size);

    // Prepare form data for OpenAI
    const formData = new FormData();
    formData.append('file', fileData, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    console.log("Sending to OpenAI Whisper...");

    // Send to OpenAI Whisper
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const transcription = result.text;
    console.log("Transcription completed");

    // Update appointment with transcription
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ transcription })
      .eq("id", appointmentId);

    if (updateError) {
      console.error('Failed to save transcription:', updateError);
      throw new Error('Failed to save transcription');
    }

    return new Response(
      JSON.stringify({ transcription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-audio:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
