import { supabase } from "@/integrations/supabase/client";

export const seedDemoAudio = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('seed-demo-audio');
    
    if (error) {
      console.error('Error seeding demo audio:', error);
      return false;
    }
    
    console.log('Demo audio seeded successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to seed demo audio:', error);
    return false;
  }
};

// Auto-run on import (one-time seeding)
seedDemoAudio();
