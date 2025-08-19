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
  avatar: string;
  status: 'available' | 'busy' | 'offline';
}

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface CloserAvailability {
  closerId: string;
  date: string;
  slots: TimeSlot[];
}

interface Booking {
  id: string;
  closerId: string;
  date: string;
  time: string;
  prospectName: string;
  prospectPhone: string;
  notes: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [closers, setClosers] = useState<Closer[]>([]);
  const [selectedCloser, setSelectedCloser] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<CloserAvailability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    closerId: string;
    date: string;
    time: string;
  } | null>(null);
  const [bookingForm, setBookingForm] = useState({
    prospectName: '',
    prospectPhone: '',
    notes: ''
  });
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
        avatar: 'AJ',
        status: 'available'
      },
      {
        id: '2',
        name: 'Sarah Martinez',
        avatar: 'SM',
        status: 'available'
      },
      {
        id: '3',
        name: 'Mike Chen',
        avatar: 'MC',
        status: 'busy'
      },
      {
        id: '4',
        name: 'Emma Davis',
        avatar: 'ED',
        status: 'available'
      },
      {
        id: '5',
        name: 'David Wilson',
        avatar: 'DW',
        status: 'offline'
      }
    ]);

    // Set default selected closer
    setSelectedCloser('1');

    // Mock availability data
    const generateTimeSlots = () => {
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            time,
            available: Math.random() > 0.3, // 70% chance of being available
            booked: Math.random() > 0.8 // 20% chance of being booked
          });
        }
      }
      return slots;
    };

    const mockAvailability: CloserAvailability[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      closers.forEach(closer => {
        mockAvailability.push({
          closerId: closer.id,
          date: date.toISOString().split('T')[0],
          slots: generateTimeSlots()
        });
      });
    }
    setAvailability(mockAvailability);

    // Mock bookings data
    setBookings([
      {
        id: '1',
        closerId: '1',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        prospectName: 'John Smith',
        prospectPhone: '(555) 123-4567',
        notes: 'Interested in weight loss program',
        status: 'confirmed'
      },
      {
        id: '2',
        closerId: '2',
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        prospectName: 'Sarah Johnson',
        prospectPhone: '(555) 987-6543',
        notes: 'Follow up on fitness consultation',
        status: 'confirmed'
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

  const handleBookSlot = (closerId: string, date: string, time: string) => {
    setSelectedSlot({ closerId, date, time });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      closerId: selectedSlot.closerId,
      date: selectedSlot.date,
      time: selectedSlot.time,
      prospectName: bookingForm.prospectName,
      prospectPhone: bookingForm.prospectPhone,
      notes: bookingForm.notes,
      status: 'confirmed'
    };

    setBookings(prev => [...prev, newBooking]);
    
    // Update availability to mark slot as booked
    setAvailability(prev => prev.map(avail => {
      if (avail.closerId === selectedSlot.closerId && avail.date === selectedSlot.date) {
        return {
          ...avail,
          slots: avail.slots.map(slot => 
            slot.time === selectedSlot.time 
              ? { ...slot, booked: true }
              : slot
          )
        };
      }
      return avail;
    }));

    // Reset form and close modal
    setBookingForm({ prospectName: '', prospectPhone: '', notes: '' });
    setShowBookingModal(false);
    setSelectedSlot(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getCloserAvailability = (closerId: string, date: string) => {
    return availability.find(a => a.closerId === closerId && a.date === date);
  };

  const isSlotBooked = (closerId: string, date: string, time: string) => {
    return bookings.some(booking => booking.closerId === closerId && booking.date === date && booking.time === time);
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
  const selectedCloserBookings = bookings.filter(b => 
    b.closerId === selectedCloser && 
    weekDates.some(date => date.toISOString().split('T')[0] === b.date)
  );
  const weekDates = getWeekDates();

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

        {/* Closer Availability */}
        <div className="bg-[#1A1F2E] rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Closer Availability
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-medium">
                {formatDate(currentDate)} - {formatDate(new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000))}
              </span>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() + 7);
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

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

          {/* Calendar View */}
          {selectedCloserData && (
            <div className="bg-[#0C1018] rounded-lg p-4">
              <div className="mb-4">
                <h4 className="font-medium text-lg">{selectedCloserData.name}'s Schedule</h4>
                <p className="text-sm text-gray-400">Click on available time slots to book appointments</p>
              </div>
              
              {/* Week Header */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="text-sm font-medium text-gray-400 p-2">Time</div>
                {weekDates.map((date, index) => (
                  <div key={index} className="text-sm font-medium text-center p-2">
                    <div>{formatDate(date)}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {Array.from({ length: 17 }, (_, hourIndex) => {
                  const hour = hourIndex + 9; // Start from 9 AM
                  return [0, 30].map(minute => {
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    return (
                      <div key={`${hour}-${minute}`} className="grid grid-cols-8 gap-2">
                        <div className="text-sm text-gray-400 p-2 font-mono">
                          {timeString}
                        </div>
                        {weekDates.map((date, dateIndex) => {
                          const dateString = date.toISOString().split('T')[0];
                          const closerAvail = getCloserAvailability(selectedCloser, dateString);
                          const slot = closerAvail?.slots.find(s => s.time === timeString);
                          const isBooked = isSlotBooked(selectedCloser, dateString, timeString);
                          
                          return (
                            <button
                              key={dateIndex}
                              className={`p-2 rounded text-xs font-medium transition-all ${
                                isBooked || slot?.booked
                                  ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                                  : slot?.available
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                  : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                              }`}
                              disabled={!slot?.available || slot?.booked || isBooked}
                              onClick={() => {
                                if (slot?.available && !slot?.booked && !isBooked) {
                                  handleBookSlot(selectedCloser, dateString, timeString);
                                }
                              }}
                            >
                              {isBooked || slot?.booked ? 'Booked' : slot?.available ? 'Available' : 'Busy'}
                            </button>
                          );
                        })}
                      </div>
                    );
                  });
                }).flat()}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500/20 rounded"></div>
                  <span className="text-xs text-gray-400">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500/20 rounded"></div>
                  <span className="text-xs text-gray-400">Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-600/20 rounded"></div>
                  <span className="text-xs text-gray-400">Busy</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Bookings for Selected Closer */}
          {selectedCloserData && selectedCloserBookings.length > 0 && (
            <div className="mt-6 bg-[#0C1018] rounded-lg p-4">
              <h4 className="font-medium text-lg mb-3">{selectedCloserData.name}'s Upcoming Appointments</h4>
              <div className="space-y-2">
                {selectedCloserBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-[#1A1F2E] rounded-lg">
                    <div>
                      <div className="font-medium">{booking.prospectName}</div>
                      <div className="text-sm text-gray-400">{booking.prospectPhone}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{new Date(booking.date).toLocaleDateString()} at {booking.time}</div>
                      <div className="text-sm text-gray-400">{booking.notes}</div>
                    </div>
                  </div>
                ))}
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

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1F2E] rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Book Appointment</h3>
            <div className="mb-4 p-3 bg-[#0C1018] rounded-lg">
              <p className="text-sm text-gray-400">Booking with:</p>
              <p className="font-medium">{closers.find(c => c.id === selectedSlot.closerId)?.name}</p>
              <p className="text-sm text-gray-400">
                {new Date(selectedSlot.date).toLocaleDateString()} at {selectedSlot.time}
              </p>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prospect Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingForm.prospectName}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, prospectName: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0C1018] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter prospect name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={bookingForm.prospectPhone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, prospectPhone: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0C1018] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0C1018] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about the prospect..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSlot(null);
                    setBookingForm({ prospectName: '', prospectPhone: '', notes: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}