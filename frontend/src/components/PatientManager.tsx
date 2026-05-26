import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, X, PlusCircle, AlertCircle, Heart } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  phone: string;
  address: string;
}

interface PatientManagerProps {
  apiBaseUrl: string;
  isConnected: boolean;
}

const INITIAL_MOCK_PATIENTS: Patient[] = [
  { id: 1, name: 'John Doe', age: 45, gender: 'Male', blood_group: 'A+', phone: '9876543210', address: '123 Baker Street, London' },
  { id: 2, name: 'Jane Smith', age: 34, gender: 'Female', blood_group: 'O-', phone: '9876543211', address: '456 Elm Street, New York' },
  { id: 3, name: 'Robert Johnson', age: 62, gender: 'Male', blood_group: 'B+', phone: '9876543212', address: '789 Oak Avenue, Chicago' },
  { id: 4, name: 'Emily Davis', age: 28, gender: 'Female', blood_group: 'AB+', phone: '9876543213', address: '101 Pine Road, San Francisco' },
  { id: 5, name: 'Michael Wilson', age: 50, gender: 'Male', blood_group: 'O+', phone: '9876543214', address: '202 Maple Lane, Seattle' }
];

const PatientManager: React.FC<PatientManagerProps> = ({ apiBaseUrl, isConnected }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  // Form Field States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Load patients list
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    
    if (!isConnected) {
      // Mock loading from local storage or initial list
      const local = localStorage.getItem('medipulse_patients');
      if (local) {
        setPatients(JSON.parse(local));
      } else {
        setPatients(INITIAL_MOCK_PATIENTS);
        localStorage.setItem('medipulse_patients', JSON.stringify(INITIAL_MOCK_PATIENTS));
      }
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/patients`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        throw new Error('Failed to retrieve patients from Flask database.');
      }
    } catch (err) {
      console.error(err);
      setError('Database retrieval failed. Reverting to safe local storage backup.');
      // Local backup failover
      const local = localStorage.getItem('medipulse_patients') || JSON.stringify(INITIAL_MOCK_PATIENTS);
      setPatients(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [apiBaseUrl, isConnected]);

  // Handle Opening Form for Add/Edit
  const openModal = (patient: Patient | null = null) => {
    setError(null);
    if (patient) {
      setEditingPatient(patient);
      setName(patient.name);
      setAge(patient.age.toString());
      setGender(patient.gender);
      setBloodGroup(patient.blood_group);
      setPhone(patient.phone);
      setAddress(patient.address);
    } else {
      setEditingPatient(null);
      setName('');
      setAge('');
      setGender('Male');
      setBloodGroup('A+');
      setPhone('');
      setAddress('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPatient(null);
  };

  // Submit Action (Add / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !age || !phone.trim() || !address.trim()) {
      setError('All fields are mandatory!');
      return;
    }

    const payload = {
      name: name.trim(),
      age: parseInt(age),
      gender,
      blood_group: bloodGroup,
      phone: phone.trim(),
      address: address.trim()
    };

    if (!isConnected) {
      // Mock state updates
      let updatedPatients: Patient[] = [];
      if (editingPatient) {
        updatedPatients = patients.map(p => 
          p.id === editingPatient.id ? { ...p, ...payload, age: parseInt(age) } : p
        );
      } else {
        const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
        updatedPatients = [{ id: newId, ...payload }, ...patients];
      }
      setPatients(updatedPatients);
      localStorage.setItem('medipulse_patients', JSON.stringify(updatedPatients));
      closeModal();
      return;
    }

    try {
      setLoading(true);
      const url = editingPatient 
        ? `${apiBaseUrl}/patients/${editingPatient.id}` 
        : `${apiBaseUrl}/patients`;
      
      const method = editingPatient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        fetchPatients();
        closeModal();
      } else {
        setError(resData.message || 'Error occurred while saving patient records.');
      }
    } catch (err) {
      console.error(err);
      setError('API connection error. Try saving again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Action
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this patient record?')) {
      return;
    }

    if (!isConnected) {
      const updatedPatients = patients.filter(p => p.id !== id);
      setPatients(updatedPatients);
      localStorage.setItem('medipulse_patients', JSON.stringify(updatedPatients));
      
      // Also update appointments to clean out deleted patients if cached locally
      const localApps = localStorage.getItem('medipulse_appointments');
      if (localApps) {
        const parsedApps = JSON.parse(localApps);
        const filteredApps = parsedApps.filter((a: any) => a.patient_id !== id);
        localStorage.setItem('medipulse_appointments', JSON.stringify(filteredApps));
      }
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/patients/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPatients();
      } else {
        const data = await response.json();
        setError(data.message || 'Error deleting patient.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to service to delete patient.');
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on query
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.phone.includes(searchQuery) ||
    p.blood_group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Utilities */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, phone, group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
        </div>

        {/* Add Patient button */}
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition-all-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 shrink-0 cursor-pointer"
        >
          <UserPlus size={18} />
          Add Patient Record
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Patients List Board */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        {loading && patients.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-semibold">Consulting database registers...</p>
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-extrabold bg-slate-50/50">
                  <th className="py-4 px-6 font-bold">Patient Details</th>
                  <th className="py-4 px-4 font-bold">Age / Gender</th>
                  <th className="py-4 px-4 font-bold">Blood Group</th>
                  <th className="py-4 px-4 font-bold">Phone Contact</th>
                  <th className="py-4 px-6 font-bold">Address Residence</th>
                  <th className="py-4 px-6 font-bold text-center">Action Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredPatients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Age / Gender */}
                    <td className="py-4 px-4">
                      <span className="text-slate-600">{p.age} yrs</span>
                      <span className="mx-1 text-slate-300">|</span>
                      <span className="text-slate-500 font-semibold">{p.gender}</span>
                    </td>

                    {/* Blood Group */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 font-bold border border-red-100">
                        <Heart size={10} className="fill-red-500 stroke-red-500" />
                        {p.blood_group}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-slate-600">{p.phone}</span>
                    </td>

                    {/* Address */}
                    <td className="py-4 px-6 max-w-xs truncate text-slate-500" title={p.address}>
                      {p.address}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal(p)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                          title="Delete Record"
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
            <p>No patients match the search parameters.</p>
          </div>
        )}
      </div>

      {/* CRUD Overlay Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingPatient ? 'Edit Patient Record' : 'Register New Patient'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="150"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Phone Contact
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-medium text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Address Residence
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 Baker Street, London"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Form Footer Actions */}
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
                  {editingPatient ? 'Save Changes' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManager;
