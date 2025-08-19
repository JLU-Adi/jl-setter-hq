import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getTodayCallMetrics } from '../lib/database';
import { 
  Phone, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Target,
  Award,
  Activity,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

interface KPI {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface Closer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'available' | 'busy' | 'offline';
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [closers, setClosers] = useState<Closer[]>([]);
  const [selectedCloser, setSelectedCloser] = useState<string>('');
  const [liveMetrics, setLiveMetrics] = useState({
    totalDials: 0,
    totalTalkTimeMinutes: 0,
    totalTalkTimeHours: 0,
    dialGoalProgress: 0,
    talkTimeGoalProgress: 0,
    overallGoalProgress: 0,
    allData: []
  });
  const [debugData, setDebugData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live metrics
  const fetchLiveMetrics = async () => {
    if (!user?.email) return;
    
    try {
      const metrics = await getTodayCallMetrics(user.email);
      setLiveMetrics(metrics);
      setDebugData(metrics.allData || []);
    } catch (error) {
      console.error('Error fetching live metrics:', error);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
    setLoading(false);

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchLiveMetrics, 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Update KPIs when live metrics change
  useEffect(() => {
    const avgTalkTime = liveMetrics.totalDials > 0 
      ? (liveMetrics.totalTalkTimeMinutes / liveMetrics.totalDials).toFixed(1)
      : '0.0';

    setKpis([
      {
        label: 'Total Dials Today',
        value: liveMetrics.totalDials,
        change: `Goal: 150`,
        trend: liveMetrics.totalDials > 0 ? 'up' : 'neutral',
        icon: <Phone className="w-6 h-6" />
      },
      {
        label: 'Talk Time Today',
        value: `${liveMetrics.totalTalkTimeHours.toFixed(1)}h`,
        change: `Goal: 3h`,
        trend: liveMetrics.totalTalkTimeHours > 0 ? 'up' : 'neutral',
        icon: <Clock className="w-6 h-6" />
      },
      {
        label: 'Avg Talk Time',
        value: `${avgTalkTime} min`,
        change: 'Per call',
        trend: parseFloat(avgTalkTime) > 2 ? 'up' : 'neutral',
        icon: <TrendingUp className="w-6 h-6" />
      },
      {
        label: 'Daily Goal Progress',
        value: `${Math.round(liveMetrics.overallGoalProgress)}%`,
        change: liveMetrics.dialGoalProgress > liveMetrics.talkTimeGoalProgress 
          ? `${Math.round(liveMetrics.dialGoalProgress)}% dials` 
          : `${Math.round(liveMetrics.talkTimeGoalProgress)}% talk time`,
        trend: liveMetrics.overallGoalProgress >= 100 ? 'up' : 
               liveMetrics.overallGoalProgress >= 50 ? 'up' : 'neutral',
        icon: <Target className="w-6 h-6" />
      },
      {
        label: 'Dial Goal',
        value: `${liveMetrics.totalDials}/150`,
        change: `${Math.round(liveMetrics.dialGoalProgress)}%`,
        trend: liveMetrics.dialGoalProgress >= 100 ? 'up' : 
               liveMetrics.dialGoalProgress >= 50 ? 'up' : 'neutral',
        icon: <Phone className="w-6 h-6" />
      },
      {
        label: 'Talk Time Goal',
        value: `${liveMetrics.totalTalkTimeHours.toFixed(1)}/3h`,
        change: `${Math.round(liveMetrics.talkTimeGoalProgress)}%`,
        trend: liveMetrics.talkTimeGoalProgress >= 100 ? 'up' : 
               liveMetrics.talkTimeGoalProgress >= 50 ? 'up' : 'neutral',
        icon: <Clock className="w-6 h-6" />
      }
    ]);
  }, [liveMetrics]);

  useEffect(() => {

    // Mock closers data
    setClosers([
      {
        id: '1',
        name: 'Alex Johnson',
        email: 'adi@jacoblevinrad.com',
        avatar: 'AJ',
        status: 'available'
      },
      {
        id: '2',
        name: 'Sarah Martinez',
        email: 'adi@jacoblevinrad.com',
        avatar: 'SM',
        status: 'available'
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'adi@jacoblevinrad.com',
        avatar: 'MC',
        status: 'busy'
      },
      {
        id: '4',
        name: 'Emma Davis',
        email: 'adi@jacoblevinrad.com',
        avatar: 'ED',
        status: 'available'
      },
      {
        id: '5',
        name: 'David Wilson',
        email: 'adi@jacoblevinrad.com',
        avatar: 'DW',
        status: 'offline'
      }
    ]);

    // Set default selected closer
    setSelectedCloser('1');
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase-user');
      localStorage.removeItem('supabase-session');
      onLogout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedCloserData = closers.find(c => c.id === selectedCloser);

  return (
    <div className="min-h-screen bg-[#0C1018] text-white">
      {/* Header */}
      <header className="bg-[#1A1F2E] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Setter Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpis.map((kpi, index) => (
            <div key={index} className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  {kpi.icon}
                </div>
                <span className={`text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-green-400' : 
                  kpi.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{kpi.value}</h3>
              <p className="text-gray-400 text-sm">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Performance */}
        <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Today's Performance {loading && <span className="ml-2 text-sm text-gray-400">(Loading...)</span>}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{liveMetrics.totalDials}</div>
              <div className="text-gray-400">Total Calls</div>
              <div className="text-sm text-gray-500">Goal: 150</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{liveMetrics.totalTalkTimeHours.toFixed(1)}h</div>
              <div className="text-gray-400">Talk Time</div>
              <div className="text-sm text-gray-500">Goal: 3h</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{Math.round(liveMetrics.overallGoalProgress)}%</div>
              <div className="text-gray-400">Goal Progress</div>
              <div className="text-sm text-gray-500">
                {liveMetrics.overallGoalProgress >= 100 ? 'Goal Achieved!' : 'Keep Going!'}
              </div>
            </div>
          </div>
          
          {/* Goal Progress Bars */}
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Dial Goal Progress</span>
                <span className="text-blue-400">{liveMetrics.totalDials}/150</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(liveMetrics.dialGoalProgress, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Talk Time Goal Progress</span>
                <span className="text-green-400">{liveMetrics.totalTalkTimeHours.toFixed(1)}/3h</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(liveMetrics.talkTimeGoalProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Data Display */}
        <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Debug: Raw Database Data
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">User Email: {user?.email}</h3>
              <h3 className="text-lg font-semibold mb-2">Total Records Found: {debugData.length}</h3>
              <h3 className="text-lg font-semibold mb-2">Showing: All records (no filters)</h3>
            </div>
            
            {debugData.length > 0 ? (
              <div className="bg-[#0C1018] rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-green-400 whitespace-pre-wrap">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-[#0C1018] rounded-lg p-4">
                <p className="text-yellow-400">No data found for today. Check:</p>
                <ul className="text-sm text-gray-400 mt-2 space-y-1">
                  <li>• Email matches setter field in database</li>
                  <li>• Records exist for today's date</li>
                  <li>• Database connection is working</li>
                </ul>
              </div>
            )}
            
            <div className="bg-[#0C1018] rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2 text-blue-400">Expected Data Structure:</h4>
              <pre className="text-xs text-gray-400">
{`{
  "id": "string",
  "setter": "email@domain.com",
  "call_duration": 120,
  "dt": "2025-01-19T10:30:00Z",
  ...other fields
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Google Calendar Integration */}
        <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Closer Availability
          </h2>

          {/* Closer Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Select Closer</h3>
            <div className="flex flex-wrap gap-3">
              {closers.map((closer) => (
                <button
                  key={closer.id}
                  onClick={() => setSelectedCloser(closer.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    selectedCloser === closer.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {closer.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1A1F2E] ${getStatusColor(closer.status)}`}></div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{closer.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{closer.status}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Google Calendar Embed */}
          {selectedCloserData && (
            <div className="bg-[#0C1018] rounded-lg p-4">
              <div className="mb-4">
                <h4 className="font-medium text-lg">{selectedCloserData.name}'s Schedule</h4>
                <p className="text-sm text-gray-400">Click the button below to view availability in Google Calendar</p>
              </div>
              
              {/* Google Calendar Embed */}
              <div className="w-full overflow-hidden rounded-lg">
                <iframe 
                  src="https://calendar.google.com/calendar/embed?src=adi%40jacoblevinrad.com&ctz=America%2FToronto" 
                  style={{ border: 0 }} 
                  width="800" 
                  height="600" 
                  frameBorder="0" 
                  scrolling="no"
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
              <span>Start Calling</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
              <Calendar className="w-5 h-5" />
              <span>Book Appointment</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <Users className="w-5 h-5" />
              <span>Lead List</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors">
              <TrendingUp className="w-5 h-5" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}