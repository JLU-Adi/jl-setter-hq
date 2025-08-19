import { createClient } from '@supabase/supabase-js';

const databaseUrl = import.meta.env.VITE_DATA_URL || '';
const databaseKey = import.meta.env.VITE_DATA_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bmd5c25zeWxwb3Z6a25hb2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzY1NDgsImV4cCI6MjA2NzQxMjU0OH0.PSbc4pqm81K6mbjOjH2nKjRE_Qr1OW9o0_EHfgfG9Dg';

export const dataClient = createClient(databaseUrl, databaseKey);

export interface CallActivity {
  id: string;
  setter: string;
  call_duration: number; // in seconds
  created_at: string;
}

export async function getTodayCallMetrics(setterEmail: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Debug: Get all data without filters
  const { data: allData, error: allError } = await dataClient
    .from('637_close_activities_calls')
    .select('*')
    .limit(50); // Limit to first 50 records

  if (allError) {
    console.error('Error fetching all data:', allError);
  } else {
    console.log('All database records (first 50):', allData);
  }

  const { data, error } = await dataClient
    .from('637_close_activities_calls')
    .select('*')
    .eq('setter', setterEmail)
    .gte('dt', startOfDay.toISOString())
    .lt('dt', endOfDay.toISOString());

  if (error) {
    console.error('Error fetching call metrics:', error);
    return {
      totalDials: 0,
      totalTalkTimeSeconds: 0,
      totalTalkTimeMinutes: 0,
      totalTalkTimeHours: 0,
      dialGoalProgress: 0,
      talkTimeGoalProgress: 0,
      overallGoalProgress: 0,
      calls: allData || [] // Return all data for debugging
    };
  }

  const totalDials = data?.length || 0;
  const totalTalkTimeSeconds = data?.reduce((sum, call) => sum + (call.duration || 0), 0) || 0;
  const totalTalkTimeMinutes = totalTalkTimeSeconds / 60;
  const totalTalkTimeHours = totalTalkTimeMinutes / 60;

  // Goals: 150 dials OR 3 hours of talk time
  const dialGoal = 150;
  const talkTimeGoalHours = 3;

  const dialGoalProgress = Math.min((totalDials / dialGoal) * 100, 100);
  const talkTimeGoalProgress = Math.min((totalTalkTimeHours / talkTimeGoalHours) * 100, 100);
  const overallGoalProgress = Math.max(dialGoalProgress, talkTimeGoalProgress);

  return {
    totalDials,
    totalTalkTimeSeconds,
    totalTalkTimeMinutes,
    totalTalkTimeHours,
    dialGoalProgress,
    talkTimeGoalProgress,
    overallGoalProgress,
    calls: data || [],
    allData: allData || [] // Include all data for debugging
  };
}