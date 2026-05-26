import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, X, PlusCircle, AlertCircle, Award } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  department: string;
  phone: string;
}

interface DoctorManagerProps {
  apiBaseUrl: string;
  isConnected: boolean;
}

const INITIAL_MOCK_DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. Sarah Connor', specialization: 'Cardiology', department: 'Cardiology', phone: '8765432101' },
  { id: 2, name: 'Dr. Gregory House', specialization: 'Diagnostic Medicine', department: 'Internal Medicine', phone: '8765432102' },
  { id: 3, name: 'Dr. Meredith Grey', specialization: 'General Surgery', department: 'Surgery', phone: '8765432103' },
  { id: 4, name: 'Dr. Stephen Strange', specialization: 'Neurosurgery', department: 'Neurology', phone: '8765432104' }
];

const DoctorManager: React.FC<DoctorManagerProps> = ({ apiBaseUrl, isConnected }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form Field States
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [phone, setPhone] = useState('');

  // Load doctors list
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);

    if (!isConnected) {
      // Mock loading from local storage
      const local = localStorage.getItem('medipulse_doctors');
      if (local) {
        setDoctors(JSON.parse(local));
      } else {
        setDoctors(INITIAL_MOCK_DOCTORS);
        localStorage.setItem('medipulse_doctors', JSON.stringify(INITIAL_MOCK_DOCTORS));
      }
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/doctors`);
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      } else {
        throw new Error('Failed to retrieve doctors list.');
      }
    } catch (err) {
      console.error(err);
      setError('Database staff search offline. Defaulting to local memory catalog.');
      const local = localStorage.getItem('medipulse_doctors') || JSON.stringify(INITIAL_MOCK_DOCTORS);
      setDoctors(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [apiBaseUrl, isConnected]);

  // Handle Form Open (Add/Edit)
  const openModal = (doctor: Doctor | null = null) => {
    setError(null);
    if (doctor) {
      setEditingDoctor(doctor);
      setName(doctor.name);
      setSpecialization(doctor.specialization);
      setDepartment(doctor.department);
      setPhone(doctor.phone);
    } else {
      setEditingDoctor(null);
      setName('');
      setSpecialization('');
      setDepartment('Cardiology');
      setPhone('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
  };

  // Submit Action (Add / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !specialization.trim() || !phone.trim()) {
      setError('All fields are mandatory!');
      return;
    }

    const payload = {
      name: name.trim(),
      specialization: specialization.trim(),
      department,
      phone: phone.trim()
    };

    if (!isConnected) {
      let updatedDoctors: Doctor[] = [];
      if (editingDoctor) {
        updatedDoctors = doctors.map(d => 
          d.id === editingDoctor.id ? { ...d, ...payload } : d
        );
      } else {
        const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
        updatedDoctors = [{ id: newId, ...payload }, ...doctors];
      }
      setDoctors(updatedDoctors);
      localStorage.setItem('medipulse_doctors', JSON.stringify(updatedDoctors));
      closeModal();
      return;
    }

    try {
      setLoading(true);
      const url = editingDoctor 
        ? `${apiBaseUrl}/doctors/${editingDoctor.id}` 
        : `${apiBaseUrl}/doctors`;
      
      const method = editingDoctor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        fetchDoctors();
        closeModal();
      } else {
        setError(resData.message || 'Error occurred while saving doctor registers.');
      }
    } catch (err) {
      console.error(err);
      setError('Staff server error. Save failed.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Action
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this doctor profile?')) {
      return;
    }

    if (!isConnected) {
      const updatedDoctors = doctors.filter(d => d.id !== id);
      setDoctors(updatedDoctors);
      localStorage.setItem('medipulse_doctors', JSON.stringify(updatedDoctors));

      // Also clean up appointments with the deleted doctor
      const localApps = localStorage.getItem('medipulse_appointments');
      if (localApps) {
        const parsedApps = JSON.parse(localApps);
        const filteredApps = parsedApps.filter((a: any) => a.doctor_id !== id);
        localStorage.setItem('medipulse_appointments', JSON.stringify(filteredApps));
      }
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/doctors/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchDoctors();
      } else {
        const data = await response.json();
        setError(data.message || 'Error deleting doctor record.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to service to delete doctor profile.');
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors
  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.department.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search staff by name, specialty, dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Add Doctor button */}
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition-all-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 shrink-0 cursor-pointer"
        >
          <UserPlus size={18} />
          Add Doctor Profile
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Doctors Grid/Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        {loading && doctors.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Consulting clinic registries...</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50">
                  <th className="py-4 px-6 font-bold">Doctor Profile</th>
                  <th className="py-4 px-6 font-bold">Specialization</th>
                  <th className="py-4 px-6 font-bold">Clinic Department</th>
                  <th className="py-4 px-6 font-bold">Contact Number</th>
                  <th className="py-4 px-6 font-bold text-center">Action Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredDoctors.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                          {d.name.split(' ').pop()?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{d.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Staff Code: #DOC-{d.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                        <Award size={10} />
                        {d.specialization}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-6">
                      <span className="text-slate-600 font-bold">{d.department}</span>
                    </td>

                    {/* Contact Phone */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-slate-500 font-semibold">{d.phone}</span>
                    </td>

                    {/* Action Panel */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(d)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                          title="Remove Staff"
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
            <UserPlus size={36} className="text-slate-300" />
            <p>No physician profiles matched this query.</p>
          </div>
        )}
      </div>

      {/* CRUD Overlay Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scale-up">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingDoctor ? 'Edit Doctor Profile' : 'Register Doctor Staff'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Doctor Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Connor"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Specialization Specialty
                </label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Cardiology"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Hospital Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                >
                  {['Cardiology', 'Internal Medicine', 'Surgery', 'Neurology', 'Pediatrics', 'Oncology', 'Emergency'].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Contact Mobile Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 8765432101"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-medium text-slate-800"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all-300 shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle size={14} />
                  {editingDoctor ? 'Save Changes' : 'Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManager;
