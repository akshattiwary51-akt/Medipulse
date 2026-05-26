import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientManager from './components/PatientManager';
import DoctorManager from './components/DoctorManager';
import AppointmentManager from './components/AppointmentManager';
import { Activity, LayoutDashboard, Users, UserPlus, Calendar, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export interface AdminUser {
  id: number;
  username: string;
  name: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'doctors' | 'appointments'>('dashboard');
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: 'Checking...' });

  // Initial authentication check
  useEffect(() => {
    const savedUser = localStorage.getItem('medipulse_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('medipulse_user');
      }
    }
  }, []);

  // Check database connectivity
  const checkDatabase = async () => {
    try {
      const response = await fetch('http://localhost:5000/');
      if (response.ok) {
        setDbStatus({ connected: true, message: 'Backend connected to Local Database' });
      } else {
        setDbStatus({ connected: false, message: 'Backend online, but DB check failed. Running on safe local fallback.' });
      }
    } catch (error) {
      setDbStatus({ 
        connected: false, 
        message: 'Backend server offline. Running in premium Local Fallback Mode (ideal for rapid demo).' 
      });
    }
  };

  useEffect(() => {
    checkDatabase();
    const interval = setInterval(checkDatabase, 15000); // check connection every 15s
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (adminUser: AdminUser) => {
    setUser(adminUser);
    localStorage.setItem('medipulse_user', JSON.stringify(adminUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('medipulse_user');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-75" />
        
        <div className="flex-grow flex items-center justify-center">
          <Login onLogin={handleLogin} apiBaseUrl={API_BASE_URL} />
        </div>

        {/* Footer info for college demo */}
        <div className="mt-8 text-center text-xs text-slate-500 relative z-10">
          <p className="font-semibold text-slate-400">MediPulse DBMS College Mini-Project</p>
          <p className="mt-1">Powered by React + Tailwind + Flask + MySQL</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar - Dark theme for premium contrast */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col z-20 shadow-xl border-r border-slate-800">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 animate-pulse">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-white font-display">MediPulse</h1>
            <p className="text-[10px] text-indigo-400 tracking-widest uppercase font-bold">Analytics Hub</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all-300 ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all-300 ${
              activeTab === 'patients'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
            }`}
          >
            <Users size={18} />
            Patient Records
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all-300 ${
              activeTab === 'doctors'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
            }`}
          >
            <UserPlus size={18} />
            Doctor Staff
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all-300 ${
              activeTab === 'appointments'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
            }`}
          >
            <Calendar size={18} />
            Appointments
          </button>
        </nav>

        {/* User profile & logout bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-sm border border-indigo-500/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all-300 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-display capitalize">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'patients' ? 'Patient Management' : activeTab === 'doctors' ? 'Doctor Management' : 'Appointment Scheduler'}
            </h2>
          </div>

          {/* Database Connection Alert Bar */}
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${
              dbStatus.connected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}>
              {dbStatus.connected ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span className="truncate max-w-xs">{dbStatus.message}</span>
            </div>

            <div className="text-slate-500 text-xs font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-grow p-8 overflow-y-auto bg-slate-50 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && <Dashboard apiBaseUrl={API_BASE_URL} isConnected={dbStatus.connected} />}
            {activeTab === 'patients' && <PatientManager apiBaseUrl={API_BASE_URL} isConnected={dbStatus.connected} />}
            {activeTab === 'doctors' && <DoctorManager apiBaseUrl={API_BASE_URL} isConnected={dbStatus.connected} />}
            {activeTab === 'appointments' && <AppointmentManager apiBaseUrl={API_BASE_URL} isConnected={dbStatus.connected} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
