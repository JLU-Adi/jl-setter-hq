import { supabase } from './supabase';

export interface CallActivity {
  id: string;
  setter: string;
  call_duration: number; // in seconds
  created_at: string;
}

export async function getTodayCallMetrics(setterEmail: string) {
  // Get today's date in Eastern timezone
  const today = new Date();
  const easternOffset = -5; // EST is UTC-5 (adjust to -4 for EDT if needed)
  const easternToday = new Date(today.getTime() + (easternOffset * 60 * 60 * 1000));
  
  // Format as YYYY-MM-DD for the database query
  const todayDateString = easternToday.toISOString().split('T')[0]; // e.g., "2025-01-19"
  const startOfDay = `${todayDateString} 00:00:00`;
  const endOfDay = `${todayDateString} 23:59:59`;

  console.log('Fetching data for setter:', setterEmail);
  console.log('Date range (Eastern):', startOfDay, 'to', endOfDay);
  console.log('Today date string:', todayDateString);

  // Log the Supabase client configuration
  console.log('Supabase client URL:', supabase.supabaseUrl);
  console.log('Supabase client key (first 20 chars):', supabase.supabaseKey?.substring(0, 20) + '...');

  // Test basic connection first
  console.log('Testing database connection...');
  
  // Try with service role key if available, otherwise use anon key
  const client = supabase;
  
  let { data: testData, error: testError } = await client
    .from('637_close_activities_calls')
    .select('*')
    .limit(10);

  if (testError) {
    console.error('Database connection test failed:', {
      message: testError.message,
      details: testError.details,
      hint: testError.hint,
      code: testError.code
    });
  } else {
    console.log('Database connection successful. Sample data:', testData);
  }

  // Get ALL data without filters for debugging
  console.log('Fetching ALL records from 637_close_activities_calls...');
  let { data: allData, error: allError } = await client
    .from('637_close_activities_calls')
    .select('*');

  if (allError) {
    console.error('Error fetching all data:', {
      message: allError.message,
      details: allError.details,
      hint: allError.hint,
      code: allError.code
    });
    allData = [];
  } else {
    console.log('ALL database records:', allData);
    console.log('Total records in table:', allData?.length || 0);
  }

  // Get all data for this user (any date) - for debugging
  console.log('Fetching user-specific records...');
  let { data: userData, error: userError } = await client
    .from('637_close_activities_calls')
    .select('*')
    .eq('setter', setterEmail);

  if (userError) {
    console.error('Error fetching user data:', {
      message: userError.message,
      details: userError.details,
      hint: userError.hint,
      code: userError.code
    });
    userData = [];
  } else {
    console.log('All data for user:', userData);
    console.log('Number of records for user:', userData?.length || 0);
  }

  // Get today's data using the correct dt field and format
  console.log('Fetching today data for user with dt field and Eastern timezone...');
  let { data: todayData, error: todayError } = await client
    .from('637_close_activities_calls')
    .select('*')
    .eq('setter', setterEmail)
    .gte('dt', startOfDay)
    .lte('dt', endOfDay);

  console.log('Today data with dt field:', todayData);
  
  if (todayError) {
    console.error('Error fetching today data:', {
      message: todayError.message,
      details: todayError.details,
      hint: todayError.hint,
      code: todayError.code
    });
  }

  // Use the query result
  if (todayData && todayData.length > 0) {
    console.log('Using dt field data');
  } else {
    console.log('No today data found');
  }

  const data = todayData || [];
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