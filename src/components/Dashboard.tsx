import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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
  XCircle,
  PhoneCall
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

interface RecentCall {
  id: string;
  prospect: string;
  phone: string;
  outcome: 'booked' | 'callback' | 'not_interested' | 'no_answer';
  time: string;
  notes: string;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [todayStats, setTodayStats] = useState({
    callsToday: 0,
    bookingsToday: 0,
    hoursWorked: 0
  });

  useEffect(() => {
    // Mock KPI data - in real app, fetch from Supabase
    setKpis([
      {
        label: 'Total Dials Today',
        value: 127,
        change: '+12%',
        trend: 'up',
        icon: <Phone className="w-6 h-6" />
      },
      {
        label: 'Calls Booked',
        value: 8,
        change: '+25%',
        trend: 'up',
        icon: <Calendar className="w-6 h-6" />
      },
      {
        label: 'Conversion Rate',
        value: '6.3%',
        change: '+1.2%',
        trend: 'up',
        icon: <TrendingUp className="w-6 h-6" />
      },
      {
        label: 'Revenue Generated',
        value: '$2,400',
        change: '+18%',
        trend: 'up',
        icon: <DollarSign className="w-6 h-6" />
      },
      {
        label: 'Talk Time',
        value: '4.2 min',
        change: '+0.8 min',
        trend: 'up',
        icon: <Clock className="w-6 h-6" />
      },
      {
        label: 'Daily Goal',
        value: '80%',
        change: '8/10',
        trend: 'up',
        icon: <Target className="w-6 h-6" />
      }
    ]);

    // Mock recent calls data
    setRecentCalls([
      {
        id: '1',
        prospect: 'John Smith',
        phone: '(555) 123-4567',
        outcome: 'booked',
        time: '2:45 PM',
        notes: 'Interested in weight loss program'
      },
      {
        id: '2',
        prospect: 'Sarah Johnson',
        phone: '(555) 987-6543',
        outcome: 'callback',
        time: '2:30 PM',
        notes: 'Requested callback tomorrow at 10 AM'
      },
      {
        id: '3',
        prospect: 'Mike Davis',
        phone: '(555) 456-7890',
        outcome: 'not_interested',
        time: '2:15 PM',
        notes: 'Not interested at this time'
      },
      {
        id: '4',
        prospect: 'Lisa Wilson',
        phone: '(555) 321-0987',
        outcome: 'booked',
        time: '2:00 PM',
        notes: 'Booked for consultation next week'
      },
      {
        id: '5',
        prospect: 'Tom Brown',
        phone: '(555) 654-3210',
        outcome: 'no_answer',
        time: '1:45 PM',
        notes: 'Left voicemail'
      }
    ]);

    setTodayStats({
      callsToday: 127,
      bookingsToday: 8,
      hoursWorked: 6.5
    });
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

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'booked':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'callback':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'not_interested':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'no_answer':
        return <PhoneCall className="w-4 h-4 text-gray-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'booked':
        return 'text-green-400 bg-green-400/10';
      case 'callback':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'not_interested':
        return 'text-red-400 bg-red-400/10';
      case 'no_answer':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

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
            Today's Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{todayStats.callsToday}</div>
              <div className="text-gray-400">Total Calls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{todayStats.bookingsToday}</div>
              <div className="text-gray-400">Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{todayStats.hoursWorked}h</div>
              <div className="text-gray-400">Hours Worked</div>
            </div>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Recent Calls
          </h2>
          <div className="space-y-3">
            {recentCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 bg-[#0C1018] rounded-lg border border-gray-600">
                <div className="flex items-center space-x-4">
                  {getOutcomeIcon(call.outcome)}
                  <div>
                    <div className="font-medium">{call.prospect}</div>
                    <div className="text-sm text-gray-400">{call.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(call.outcome)}`}>
                    {call.outcome.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{call.time}</div>
                </div>
                <div className="max-w-xs text-sm text-gray-400 truncate">
                  {call.notes}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center space-x-2 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
              <span>Start Calling</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              <Calendar className="w-5 h-5" />
              <span>View Calendar</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
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