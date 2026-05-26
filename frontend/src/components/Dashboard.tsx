import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, Activity, ArrowUpRight, TrendingUp, HeartPulse } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

interface DashboardProps {
  apiBaseUrl: string;
  isConnected: boolean;
}

// Fallback Mock Data in case backend is offline
const MOCK_PATIENTS = [
  { id: 1, name: 'John Doe', age: 45, gender: 'Male', blood_group: 'A+', phone: '9876543210', address: '123 Baker St' },
  { id: 2, name: 'Jane Smith', age: 34, gender: 'Female', blood_group: 'O-', phone: '9876543211', address: '456 Elm St' },
  { id: 3, name: 'Robert Johnson', age: 62, gender: 'Male', blood_group: 'B+', phone: '9876543212', address: '789 Oak Ave' },
  { id: 4, name: 'Emily Davis', age: 28, gender: 'Female', blood_group: 'AB+', phone: '9876543213', address: '101 Pine Rd' },
  { id: 5, name: 'Michael Wilson', age: 50, gender: 'Male', blood_group: 'O+', phone: '9876543214', address: '202 Maple Ln' }
];

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Connor', specialization: 'Cardiology', department: 'Cardiology', phone: '8765432101' },
  { id: 2, name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine', department: 'Internal Medicine', phone: '8765432102' },
  { id: 3, name: 'Dr. Meredith Grey', specialization: 'General Surgery', department: 'Surgery', phone: '8765432103' },
  { id: 4, name: 'Dr. Stephen Strange', specialization: 'Neurosurgery', department: 'Neurology', phone: '8765432104' }
];

const MOCK_APPOINTMENTS = [
  { id: 1, patient_name: 'John Doe', doctor_name: 'Dr. Sarah Connor', date: '2026-05-27', time: '10:00', status: 'Scheduled' },
  { id: 2, patient_name: 'Jane Smith', doctor_name: 'Dr. Gregory House', date: '2026-05-26', time: '11:30', status: 'Completed' },
  { id: 3, patient_name: 'Robert Johnson', doctor_name: 'Dr. Meredith Grey', date: '2026-05-28', time: '14:00', status: 'Scheduled' },
  { id: 4, patient_name: 'Emily Davis', doctor_name: 'Dr. Stephen Strange', date: '2026-05-25', time: '09:15', status: 'Completed' },
  { id: 5, patient_name: 'Michael Wilson', doctor_name: 'Dr. Sarah Connor', date: '2026-05-29', time: '15:30', status: 'Scheduled' }
];

const Dashboard: React.FC<DashboardProps> = ({ apiBaseUrl, isConnected }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    patients: [] as any[],
    doctors: [] as any[],
    appointments: [] as any[],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!isConnected) {
        // Run mock fallback
        setData({
          patients: MOCK_PATIENTS,
          doctors: MOCK_DOCTORS,
          appointments: MOCK_APPOINTMENTS
        });
        setLoading(false);
        return;
      }

      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/patients`).then(res => res.json()),
          fetch(`${apiBaseUrl}/doctors`).then(res => res.json()),
          fetch(`${apiBaseUrl}/appointments`).then(res => res.json()),
        ]);

        setData({
          patients: Array.isArray(patientsRes) ? patientsRes : MOCK_PATIENTS,
          doctors: Array.isArray(doctorsRes) ? doctorsRes : MOCK_DOCTORS,
          appointments: Array.isArray(appointmentsRes) ? appointmentsRes : MOCK_APPOINTMENTS,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        // Failover gracefully
        setData({
          patients: MOCK_PATIENTS,
          doctors: MOCK_DOCTORS,
          appointments: MOCK_APPOINTMENTS
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiBaseUrl, isConnected]);

  // Calculations for charts
  const bloodGroups = data.patients.reduce((acc: any, patient: any) => {
    const bg = patient.blood_group || 'Unk';
    acc[bg] = (acc[bg] || 0) + 1;
    return acc;
  }, {});

  const bloodGroupChartData = Object.keys(bloodGroups).map(bg => ({
    name: bg,
    Count: bloodGroups[bg],
  })).sort((a, b) => b.Count - a.Count);

  const genderStats = data.patients.reduce((acc: any, patient: any) => {
    const g = patient.gender || 'Other';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const genderChartData = Object.keys(genderStats).map(g => ({
    name: g,
    value: genderStats[g],
  }));

  const appointmentStatus = data.appointments.reduce((acc: any, app: any) => {
    const s = app.status || 'Scheduled';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.keys(appointmentStatus).map(s => ({
    name: s,
    value: appointmentStatus[s],
  }));

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <HeartPulse size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Operational Real-time Analytics</h3>
            <p className="text-slate-500 text-sm">Aggregated health, staffing, and appointment analytics overview.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
          <TrendingUp size={16} className="text-indigo-600" />
          <span className="text-xs font-semibold text-slate-600">Dynamic UI Sync Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI: Total Patients */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Total Patients</p>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              {loading ? '...' : data.patients.length}
            </h3>
            <div className="flex items-center text-emerald-600 text-xs font-semibold gap-1">
              <span className="bg-emerald-50 px-1.5 py-0.5 rounded-lg flex items-center">Active Database</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all-300">
            <Users size={28} />
          </div>
        </div>

        {/* KPI: Total Doctors */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Medical Staff</p>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              {loading ? '...' : data.doctors.length}
            </h3>
            <div className="flex items-center text-emerald-600 text-xs font-semibold gap-1">
              <span className="bg-emerald-50 px-1.5 py-0.5 rounded-lg flex items-center">Registered Staff</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all-300">
            <UserPlus size={28} />
          </div>
        </div>

        {/* KPI: Total Appointments */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Appointments</p>
            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              {loading ? '...' : data.appointments.length}
            </h3>
            <div className="flex items-center text-emerald-600 text-xs font-semibold gap-1">
              <span className="bg-emerald-50 px-1.5 py-0.5 rounded-lg flex items-center">Booked Visits</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-rose-600 group-hover:text-white transition-all-300">
            <Calendar size={28} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Patient Blood Groups */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-96 lg:col-span-2">
          <h4 className="text-lg font-bold text-slate-800 mb-2 flex items-center justify-between">
            <span>Patients by Blood Group</span>
            <span className="text-xs text-slate-500 font-normal">Count breakdown</span>
          </h4>
          <p className="text-xs text-slate-400 mb-6">Visual representation of patient blood types in hospital records.</p>
          <div className="flex-grow w-full">
            {bloodGroupChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bloodGroupChartData}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="Count" fill="url(#colorBar)" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No patient data available.
              </div>
            )}
          </div>
        </div>

        {/* Chart: Gender Pie Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-96">
          <h4 className="text-lg font-bold text-slate-800 mb-2">Patient Gender Split</h4>
          <p className="text-xs text-slate-400 mb-6">Patient demographic distribution details.</p>
          <div className="flex-grow w-full flex flex-col justify-center items-center">
            {genderChartData.length > 0 ? (
              <>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {genderChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend list */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
                  {genderChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-semibold">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No gender statistics available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Part 2 & Appointment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table: Recent Appointment Log */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col lg:col-span-2 min-h-80">
          <h4 className="text-lg font-bold text-slate-800 mb-1 flex items-center justify-between">
            <span>Recent Appointment Logs</span>
            <span className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1 rounded-xl font-medium">Real-time DB Sync</span>
          </h4>
          <p className="text-xs text-slate-400 mb-5">Quick log of recent patient consults scheduled across departments.</p>

          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-2 font-bold">Patient</th>
                  <th className="py-3 px-2 font-bold">Doctor</th>
                  <th className="py-3 px-2 font-bold">Date & Time</th>
                  <th className="py-3 px-2 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {data.appointments.slice(0, 5).map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-2 font-semibold text-slate-800">{app.patient_name}</td>
                    <td className="py-3.5 px-2 text-slate-600 font-medium">{app.doctor_name}</td>
                    <td className="py-3.5 px-2 text-slate-500 font-medium">
                      {app.date} @ <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">{app.time}</span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wide uppercase ${
                        app.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : app.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.appointments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                      No appointments scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-full min-h-80">
          <h4 className="text-lg font-bold text-slate-800 mb-2">Appointment Status Ratio</h4>
          <p className="text-xs text-slate-400 mb-6">Percentage breakdown of completed vs scheduled visits.</p>
          <div className="flex-grow flex flex-col justify-center items-center">
            {statusChartData.length > 0 ? (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
                  {statusChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No appointment logs to process.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
