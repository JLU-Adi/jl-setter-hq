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

  console.log('Fetching data for setter:', setterEmail);
  console.log('Date range:', startOfDay.toISOString(), 'to', endOfDay.toISOString());

  // Test basic connection first
  console.log('Testing database connection...');
  const { data: testData, error: testError } = await dataClient
    .from('637_close_activities_calls')
    .select('*', { count: 'exact' })
    .limit(5);

  if (testError) {
    console.error('Database connection test failed:', testError);
    return {
      totalDials: 0,
      totalTalkTimeSeconds: 0,
      totalTalkTimeMinutes: 0,
      totalTalkTimeHours: 0,
      dialGoalProgress: 0,
      talkTimeGoalProgress: 0,
      overallGoalProgress: 0,
      calls: [],
      allData: [],
      userData: [],
      error: testError.message
    };
  } else {
    console.log('Database connection successful. Sample data:', testData);
  }

  // Get all data without filters (first 50)
  console.log('Fetching all records...');
  const { data: allData, error: allError } = await dataClient
    .from('637_close_activities_calls')
    .select('*')
    .limit(50);

  if (allError) {
    console.error('Error fetching all data:', allError);
  } else {
    console.log('All database records (first 50):', allData);
  }

  // Get all data for this user (any date)
  console.log('Fetching user-specific records...');
  const { data: userData, error: userError } = await dataClient
    .from('637_close_activities_calls')
    .select('*')
    .eq('setter', setterEmail);

  if (userError) {
    console.error('Error fetching user data:', userError);
  } else {
    console.log('All data for user:', userData);
  }

  // Get today's data for the specific user
  console.log('Fetching today data for user...');
  const { data: todayData, error: todayError } = await dataClient
    .from('637_close_activities_calls')
    .select('*')
    .eq('setter', setterEmail)
    .gte('dt', startOfDay.toISOString())
    .lt('dt', endOfDay.toISOString());

  if (todayError) {
    console.error('Error fetching today call metrics:', todayError);
  } else {
    console.log('Today data for user:', todayData);
  }

  const data = todayData || [];
  
  if (todayError && userError && allError) {
    return {
      totalDials: 0,
      totalTalkTimeSeconds: 0,
      totalTalkTimeMinutes: 0,
      totalTalkTimeHours: 0,
      dialGoalProgress: 0,
      talkTimeGoalProgress: 0,
      overallGoalProgress: 0,
      calls: data,
      allData: allData || [], // Return all data for debugging
      userData: userData || [], // Return user-specific data
      error: 'Multiple query errors occurred'
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
    allData: allData || [], // Include all data for debugging
    userData: userData || [] // Include user-specific data for debugging
  };
}