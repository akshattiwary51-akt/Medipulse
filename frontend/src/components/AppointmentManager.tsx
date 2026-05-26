import React, { useState, useEffect } from 'react';
import { Search, CalendarDays, Trash2, X, PlusCircle, AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  date: string;
  time: string;
  status: string;
}

interface AppointmentManagerProps {
  apiBaseUrl: string;
  isConnected: boolean;
}

const INITIAL_MOCK_APPOINTMENTS: Appointment[] = [
  { id: 1, patient_id: 1, patient_name: 'John Doe', doctor_id: 1, doctor_name: 'Dr. Sarah Connor', date: '2026-05-27', time: '10:00', status: 'Scheduled' },
  { id: 2, patient_id: 2, patient_name: 'Jane Smith', doctor_id: 2, doctor_name: 'Dr. Gregory House', date: '2026-05-26', time: '11:30', status: 'Completed' },
  { id: 3, patient_id: 3, patient_name: 'Robert Johnson', doctor_id: 3, doctor_name: 'Dr. Meredith Grey', date: '2026-05-28', time: '14:00', status: 'Scheduled' },
  { id: 4, patient_id: 4, patient_name: 'Emily Davis', doctor_id: 4, doctor_name: 'Dr. Stephen Strange', date: '2026-05-25', time: '09:15', status: 'Completed' },
  { id: 5, patient_id: 5, patient_name: 'Michael Wilson', doctor_id: 1, doctor_name: 'Dr. Sarah Connor', date: '2026-05-29', time: '15:30', status: 'Scheduled' }
];

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ apiBaseUrl, isConnected }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentStatus, setAppointmentStatus] = useState('Scheduled');

  // Load Lists (Appointments, Patients, Doctors)
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    if (!isConnected) {
      // Mock loading from localStorage
      const cachedPatients = localStorage.getItem('medipulse_patients');
      const cachedDoctors = localStorage.getItem('medipulse_doctors');
      const cachedAppointments = localStorage.getItem('medipulse_appointments');

      const loadedPatients = cachedPatients ? JSON.parse(cachedPatients) : [];
      const loadedDoctors = cachedDoctors ? JSON.parse(cachedDoctors) : [];
      let loadedApps = [];

      if (cachedAppointments) {
        loadedApps = JSON.parse(cachedAppointments);
      } else {
        loadedApps = INITIAL_MOCK_APPOINTMENTS;
        localStorage.setItem('medipulse_appointments', JSON.stringify(INITIAL_MOCK_APPOINTMENTS));
      }

      setPatients(loadedPatients);
      setDoctors(loadedDoctors);
      setAppointments(loadedApps);
      setLoading(false);
      return;
    }

    try {
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/appointments`),
        fetch(`${apiBaseUrl}/patients`),
        fetch(`${apiBaseUrl}/doctors`),
      ]);

      if (appointmentsRes.ok && patientsRes.ok && doctorsRes.ok) {
        const appsData = await appointmentsRes.json();
        const patientsData = await patientsRes.json();
        const doctorsData = await doctorsRes.json();

        setAppointments(appsData);
        setPatients(patientsData);
        setDoctors(doctorsData);
      } else {
        throw new Error('Database retrieval error.');
      }
    } catch (err) {
      console.error(err);
      setError('Staff connectivity offline. Loading saved system checkpoints.');
      
      const cachedPatients = localStorage.getItem('medipulse_patients');
      const cachedDoctors = localStorage.getItem('medipulse_doctors');
      const cachedAppointments = localStorage.getItem('medipulse_appointments') || JSON.stringify(INITIAL_MOCK_APPOINTMENTS);

      setPatients(cachedPatients ? JSON.parse(cachedPatients) : []);
      setDoctors(cachedDoctors ? JSON.parse(cachedDoctors) : []);
      setAppointments(JSON.parse(cachedAppointments));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [apiBaseUrl, isConnected]);

  // Open Modal
  const openBookingModal = () => {
    setError(null);
    if (patients.length === 0) {
      setError('You must add at least one patient to book an appointment!');
      return;
    }
    if (doctors.length === 0) {
      setError('You must register at least one doctor to book an appointment!');
      return;
    }
    
    // Set default selectors
    setSelectedPatientId(patients[0].id.toString());
    setSelectedDoctorId(doctors[0].id.toString());
    
    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setAppointmentDate(tomorrow.toISOString().split('T')[0]);
    setAppointmentTime('10:00');
    setAppointmentStatus('Scheduled');
    
    setShowModal(true);
  };

  const closeBookingModal = () => {
    setShowModal(false);
  };

  // Submit / Book Appointment Action
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPatientId || !selectedDoctorId || !appointmentDate || !appointmentTime) {
      setError('Please fill in all requested scheduling details.');
      return;
    }

    const patient = patients.find(p => p.id.toString() === selectedPatientId);
    const doctor = doctors.find(d => d.id.toString() === selectedDoctorId);

    if (!patient || !doctor) {
      setError('Selected patient or doctor is invalid.');
      return;
    }

    const payload = {
      patient_id: parseInt(selectedPatientId),
      doctor_id: parseInt(selectedDoctorId),
      date: appointmentDate,
      time: appointmentTime,
      status: appointmentStatus
    };

    if (!isConnected) {
      const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
      const newApp: Appointment = {
        id: newId,
        patient_id: parseInt(selectedPatientId),
        patient_name: patient.name,
        doctor_id: parseInt(selectedDoctorId),
        doctor_name: doctor.name,
        date: appointmentDate,
        time: appointmentTime,
        status: appointmentStatus
      };
      
      const updatedApps = [newApp, ...appointments];
      setAppointments(updatedApps);
      localStorage.setItem('medipulse_appointments', JSON.stringify(updatedApps));
      closeBookingModal();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        fetchAllData();
        closeBookingModal();
      } else {
        setError(resData.message || 'Error booking appointment.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection interrupted. Appointment schedule cancelled.');
    } finally {
      setLoading(false);
    }
  };

  // Delete / Cancel Appointment Action
  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled appointment?')) {
      return;
    }

    if (!isConnected) {
      const updatedApps = appointments.filter(a => a.id !== id);
      setAppointments(updatedApps);
      localStorage.setItem('medipulse_appointments', JSON.stringify(updatedApps));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/appointments/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchAllData();
      } else {
        const data = await response.json();
        setError(data.message || 'Error deleting appointment.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection interrupted. Cancellation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Filter Appointments
  const filteredAppointments = appointments.filter(a => 
    a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Utilities Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search bookings by patient, doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Schedule button */}
        <button
          onClick={openBookingModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition-all-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 shrink-0 cursor-pointer"
        >
          <CalendarDays size={18} />
          Schedule Appointment
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Appointments List Board */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        {loading && appointments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Consulting session schedulers...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50">
                  <th className="py-4 px-6 font-bold">Appointment ID</th>
                  <th className="py-4 px-6 font-bold">Patient Name</th>
                  <th className="py-4 px-6 font-bold">Assigned Doctor</th>
                  <th className="py-4 px-6 font-bold">Scheduled Time</th>
                  <th className="py-4 px-6 font-bold">Status Badge</th>
                  <th className="py-4 px-6 font-bold text-center">Action Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredAppointments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-slate-400 font-bold">
                      #APT-{a.id}
                    </td>

                    {/* Patient Name */}
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-slate-800">{a.patient_name}</p>
                    </td>

                    {/* Assigned Doctor */}
                    <td className="py-4 px-6 text-slate-600">
                      {a.doctor_name}
                    </td>

                    {/* Scheduled Time */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-slate-700 font-bold flex items-center gap-1.5">
                          <CalendarDays size={13} className="text-slate-400" />
                          {a.date}
                        </p>
                        <p className="text-slate-400 font-bold flex items-center gap-1.5">
                          <Clock size={13} />
                          {a.time}
                        </p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wide uppercase ${
                        a.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : a.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {a.status}
                      </span>
                    </td>

                    {/* Action Panel */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteAppointment(a.id)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                          title="Delete / Cancel Visit"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-3">
            <CalendarDays size={36} className="text-slate-300" />
            <p>No appointments found in active filters.</p>
          </div>
        )}
      </div>

      {/* Booking Form Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scale-up">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                Schedule Medical Appointment
              </h3>
              <button
                onClick={closeBookingModal}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Patient
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: #{p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Assigned Physician
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Visit Time
                  </label>
                  <input
                    type="time"
                    required
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Appointment Status
                </label>
                <select
                  value={appointmentStatus}
                  onChange={(e) => setAppointmentStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all-300 shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarDays size={14} />
                  Book Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
