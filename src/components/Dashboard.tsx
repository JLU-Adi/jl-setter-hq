import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';
import { AudioRecorder } from './AudioRecorder';

const mockEvents = [
	{
		id: '1',
		summary: 'Team Standup',
		start: { dateTime: '2025-08-19T09:00:00' },
		end: { dateTime: '2025-08-19T09:30:00' },
		location: 'Zoom',
	},
	{
		id: '2',
		summary: 'Design Review',
		start: { dateTime: '2025-08-19T11:00:00' },
		end: { dateTime: '2025-08-19T12:00:00' },
		location: 'Conference Room',
	},
	{
		id: '3',
		summary: 'Lunch with Sarah',
		start: { dateTime: '2025-08-19T13:00:00' },
		end: { dateTime: '2025-08-19T14:00:00' },
		location: 'Cafe Downtown',
	},
];

interface DashboardProps {
	user: any;
	onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
	const [events, setEvents] = useState<any[]>([]);

	useEffect(() => {
		setEvents(mockEvents);
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

	return (
		<div className="min-h-screen bg-[#0C1018] flex flex-col items-start">
			{/* Header */}
			<header className="w-full flex items-center px-8 py-6">
				<img
					src={logo}
					alt="Logo"
					className="w-12 h-12 bg-[#0C1018] p-2 mr-4"
				/>
				<span className="text-2xl font-bold text-white tracking-wide mr-4">
					Setter HQ
				</span>
			</header>

			{/* Main Content */}
			<main className="w-full flex justify-center">
				
				{/* <AudioRecorder /> */}
			</main>
		</div>
	);
}