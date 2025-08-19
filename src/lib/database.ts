import { createClient } from '@supabase/supabase-js';

const databaseUrl = import.meta.env.VITE_DATA_URL || '';
const databaseKey = import.meta.env.VITE_DATA_KEY || '';

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

  const { data, error } = await dataClient
    .from('637_close_activities_calls')
    .select('*')
    .eq('setter', setterEmail)
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', endOfDay.toISOString());

  if (error) {
    console.error('Error fetching call metrics:', error);
    return {
      totalDials: 0,
      totalTalkTimeSeconds: 0,
      totalTalkTimeMinutes: 0,
      dialGoalProgress: 0,
      talkTimeGoalProgress: 0,
      overallGoalProgress: 0
    };
  }

  const totalDials = data?.length || 0;
  const totalTalkTimeSeconds = data?.reduce((sum, call) => sum + (call.call_duration || 0), 0) || 0;
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
    calls: data || []
  };
}