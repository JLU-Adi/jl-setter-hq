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
                <p className="text-sm text-gray-400">View availability and schedule appointments</p>
              </div>
              
              {/* Google Calendar Iframe */}
              <div className="w-full h-96 bg-white rounded-lg overflow-hidden">
                <iframe
                  src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(selectedCloserData.email)}&ctz=America%2FNew_York&mode=WEEK&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&bgcolor=%23ffffff`}
                  style={{ border: 0 }}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  title={`${selectedCloserData.name}'s Calendar`}
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