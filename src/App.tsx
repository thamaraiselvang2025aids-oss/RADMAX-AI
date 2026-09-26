import React, { useState, useEffect } from 'react';
import { 
  Users, Image as ImageIcon, Activity, 
  FileText, Plus, Check, RefreshCw, 
  Search, Sun, Contrast, ActivitySquare, LayoutDashboard, BrainCircuit, ShieldAlert
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import PACSViewer from './components/PACSViewer';
import LoginView from './views/LoginView';
import { UserRole, PriorityLevel, Study, Patient, HospitalStats, Report, UserProfile } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Theme state: dark by default per requirements
  const [isWhiteTheme, setIsWhiteTheme] = useState<boolean>(false);

  const [studies, setStudies] = useState<Study[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedStudyId, setSelectedStudyId] = useState<string>('');

  // Add Patient Form State
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    patientId: '',
    dateOfBirth: '',
    sex: 'Male',
    phone: '',
    email: '',
    medicalHistory: ''
  });

  // Upload Study State
  const [uploadData, setUploadData] = useState({
    patientId: '',
    modality: 'MRI',
    bodyPart: 'Brain',
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    try {
      const [patientsRes, studiesRes, statsRes, logsRes] = await Promise.all([
        fetch('/api/patients', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/studies', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/stats'),
        fetch('/api/audit', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (patientsRes.ok) setPatients(await patientsRes.json());
      if (studiesRes.ok) {
        const data = await studiesRes.json();
        setStudies(data);
        if (data.length > 0 && !selectedStudyId) {
          setSelectedStudyId(data[0].id);
        }
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (e) {
      console.error("Failed to fetch app data:", e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.PATIENT) setCurrentTab('reports');
      fetchData();
    }
  }, [currentUser]);

  // Refresh data when switching to important tabs so they aren't stale
  useEffect(() => {
    if (currentUser && ['settings', 'dashboard', 'emergency-queue'].includes(currentTab)) {
      fetchData();
    }
  }, [currentTab]);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('dashboard');
    localStorage.removeItem('token');
  };

  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPatient)
      });
      if (res.ok) {
        const added = await res.json();
        setPatients(prev => [added, ...prev]);
        setIsAddingPatient(false);
        setNewPatient({ name: '', patientId: '', dateOfBirth: '', sex: 'Male', phone: '', email: '', medicalHistory: '' });
      }
    } catch (err) {
      console.error("Failed to add patient:", err);
    }
  };

  const handleUploadStudySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.patientId) return alert('Please select a patient.');
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('patientId', uploadData.patientId);
    formData.append('modality', uploadData.modality);
    formData.append('bodyPart', uploadData.bodyPart);
    if (uploadData.file) {
      formData.append('dicomFile', uploadData.file);
    }

    try {
      const res = await fetch('/api/studies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      if (res.ok) {
        const addedStudy = await res.json();
        setStudies(prev => [addedStudy, ...prev]);
        setSelectedStudyId(addedStudy.id);
        setCurrentTab('medical-images');
        setUploadData({ patientId: '', modality: 'MRI', bodyPart: 'Brain', file: null });
      }
    } catch (err) {
      console.error("Failed to upload study:", err);
    }
    setIsUploading(false);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const activeStudy = studies.find(s => s.id === selectedStudyId);

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isWhiteTheme ? 'bg-slate-50 text-slate-800' : 'bg-[#0f111a] text-slate-300'}`}>
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onLogout={handleLogout}
        isWhiteTheme={isWhiteTheme}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className={`h-14 border-b flex items-center justify-between px-6 z-10 select-none ${
          isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'
        }`}>
          <div className="flex items-center gap-3">
            <ActivitySquare className={`w-5 h-5 ${isWhiteTheme ? 'text-indigo-600' : 'text-blue-400'}`} />
            <span className={`font-bold tracking-wide uppercase text-xs ${isWhiteTheme ? 'text-slate-800' : 'text-slate-200'}`}>MedVision Clinical Node</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsWhiteTheme(!isWhiteTheme)} className="p-1.5 hover:bg-slate-800/50 rounded-lg">
              {isWhiteTheme ? <Contrast className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-slate-400" />}
            </button>
            <div className={`h-4 w-[1px] ${isWhiteTheme ? 'bg-slate-300' : 'bg-slate-700'}`} />
            <span className={`text-xs ${isWhiteTheme ? 'text-slate-600' : 'text-slate-400'}`}>{currentUser.username}</span>
          </div>
        </header>

        {/* Dynamic Inner Workspace Panel */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
          
          {/* DASHBOARD TAB */}
          {currentTab === 'dashboard' && currentUser.role === UserRole.RADIOLOGIST && (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                    <LayoutDashboard className="w-5 h-5 text-blue-500" /> Workstation Dashboard
                  </h2>
                </div>
              </div>

              {/* Add Patient Module */}
              <div className={`rounded-xl border p-5 ${isWhiteTheme ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#151923] border-[#222736] shadow-xl'}`}>
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsAddingPatient(!isAddingPatient)}>
                  <h3 className={`font-semibold text-sm uppercase flex items-center gap-2 ${isWhiteTheme ? 'text-slate-800' : 'text-slate-200'}`}>
                    <Plus className="w-4 h-4 text-blue-500" /> Patient Registration
                  </h3>
                  <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                    isWhiteTheme ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-900/20 text-blue-400 border-blue-800/30'
                  }`}>
                    {isAddingPatient ? 'Close' : 'Register Patient'}
                  </button>
                </div>
                
                {isAddingPatient && (
                  <form onSubmit={handleAddPatientSubmit} className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="w-full text-xs rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Full Name" />
                      <input type="text" required value={newPatient.patientId} onChange={e => setNewPatient({...newPatient, patientId: e.target.value})} className="w-full text-xs rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Medical Record Number (MRN)" />
                      <input type="date" required value={newPatient.dateOfBirth} onChange={e => setNewPatient({...newPatient, dateOfBirth: e.target.value})} className="w-full text-xs rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
                      <select value={newPatient.sex} onChange={e => setNewPatient({...newPatient, sex: e.target.value})} className="w-full text-xs rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                      <Check className="w-4 h-4" /> Save Record
                    </button>
                  </form>
                )}
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'}`}>
                  <p className="text-xs uppercase text-slate-500 font-bold mb-1">Registered Patients</p>
                  <p className="text-2xl font-bold font-mono">{patients.length}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'}`}>
                  <p className="text-xs uppercase text-slate-500 font-bold mb-1">Total Studies</p>
                  <p className="text-2xl font-bold font-mono">{studies.length}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'}`}>
                  <p className="text-xs uppercase text-slate-500 font-bold mb-1">Pending AI</p>
                  <p className="text-2xl font-bold font-mono text-amber-500">{studies.filter(s => s.status === 'UPLOADED').length}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'}`}>
                  <p className="text-xs uppercase text-slate-500 font-bold mb-1">Ready for Review</p>
                  <p className="text-2xl font-bold font-mono text-blue-500">{studies.filter(s => s.status === 'AI_READY').length}</p>
                </div>
              </div>

              {/* Studies Table */}
              <div className={`rounded-xl border ${isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'}`}>
                <div className="p-4 border-b border-[#222736]">
                  <h3 className="font-bold text-sm uppercase text-slate-300">Recent Studies</h3>
                </div>
                <div className="p-4">
                  {studies.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      No DICOM studies available. Upload a study from the patient workspace.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-500 border-b border-[#222736]">
                          <th className="pb-2 font-semibold uppercase">Patient</th>
                          <th className="pb-2 font-semibold uppercase">Study</th>
                          <th className="pb-2 font-semibold uppercase">Date</th>
                          <th className="pb-2 font-semibold uppercase">Status</th>
                          <th className="pb-2 font-semibold uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studies.map(s => (
                          <tr key={s.id} className="border-b border-[#222736]/50 hover:bg-[#1a1f2e] transition-colors cursor-pointer" onClick={() => { setSelectedStudyId(s.id); setCurrentTab('medical-images'); }}>
                            <td className="py-3 text-slate-200 font-medium">{s.patientName}</td>
                            <td className="py-3 text-slate-400">{s.modality} - {s.bodyPart}</td>
                            <td className="py-3 text-slate-400">{new Date(s.studyDate).toLocaleDateString()}</td>
                            <td className="py-3">
                              <span className="bg-slate-800/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{s.status}</span>
                            </td>
                            <td className="py-3 text-right">
                              <button className="text-blue-400 font-semibold hover:text-blue-300">Open Workspace →</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PATIENT ONLY TAB */}
          {currentTab === 'reports' && currentUser.role === UserRole.PATIENT && (
             <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
               <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                 <FileText className="w-5 h-5 text-blue-500" /> My Radiology Reports
               </h2>
               {studies.length === 0 ? (
                 <div className="text-center py-12 text-slate-500 text-sm border border-slate-800 rounded-xl">
                   No approved radiology reports are currently available for your profile.
                 </div>
               ) : (
                 studies.map(s => (
                   <div key={s.id} className="bg-[#151923] border border-[#222736] p-6 rounded-xl">
                     <h3 className="font-bold text-lg text-white">{s.modality} of {s.bodyPart}</h3>
                     <p className="text-xs text-slate-400 mt-1">Date: {new Date(s.studyDate).toLocaleDateString()} • Status: FINALIZED</p>
                     <div className="mt-4 p-4 bg-[#0f111a] border border-[#222736] rounded-lg">
                       <p className="text-xs text-slate-300">{s.status === 'FINALIZED' ? 'Report finalized by radiologist. Contact physician for follow-up.' : 'Processing...'}</p>
                     </div>
                   </div>
                 ))
               )}
             </div>
          )}

          {/* MEDICAL IMAGES / PACS VIEWER */}
          {currentTab === 'medical-images' && currentUser.role === UserRole.RADIOLOGIST && (
            activeStudy ? (
              <PACSViewer 
                study={activeStudy} 
                isWhiteTheme={isWhiteTheme} 
                onStatusChange={fetchData} 
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                No study selected.
              </div>
            )
          )}

          {/* UPLOAD STUDY */}
          {currentTab === 'upload-scan' && currentUser.role === UserRole.RADIOLOGIST && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                <Plus className="w-5 h-5 text-blue-500" /> Upload DICOM Study
              </h2>
              
              <div className={`p-6 rounded-xl border ${isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'}`}>
                <form onSubmit={handleUploadStudySubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Select Patient</label>
                    <select required value={uploadData.patientId} onChange={e => setUploadData({...uploadData, patientId: e.target.value})} className="w-full text-xs rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Modality</label>
                      <select value={uploadData.modality} onChange={e => setUploadData({...uploadData, modality: e.target.value})} className="w-full text-xs rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-blue-500">
                        <option>MRI</option>
                        <option>CT Scan</option>
                        <option>X-Ray</option>
                        <option>Mammography</option>
                        <option>Ultrasound</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Body Part</label>
                      <input type="text" required value={uploadData.bodyPart} onChange={e => setUploadData({...uploadData, bodyPart: e.target.value})} className="w-full text-xs rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Brain, Chest" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">DICOM File / Series</label>
                    <input type="file" onChange={e => setUploadData({...uploadData, file: e.target.files?.[0] || null})} className="w-full text-xs rounded-lg px-3 py-2 bg-slate-900/50 border border-slate-700 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <button type="submit" disabled={isUploading} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4">
                    {isUploading ? 'Uploading & Ingesting...' : 'Upload & Proceed to PACS'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* EMERGENCY QUEUE */}
          {currentTab === 'emergency-queue' && currentUser.role === UserRole.RADIOLOGIST && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                <Activity className="w-5 h-5 text-red-500" /> Emergency Priority Queue
              </h2>
              
              <div className={`rounded-xl border ${isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'}`}>
                <div className="p-4 border-b border-[#222736]">
                  <h3 className="font-bold text-sm uppercase text-slate-300">High Priority Cases</h3>
                </div>
                <div className="p-4">
                  {studies.filter(s => s.priority === PriorityLevel.CRITICAL || s.priority === PriorityLevel.HIGH).length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      No critical or high priority studies currently in the queue.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-500 border-b border-[#222736]">
                          <th className="pb-2 font-semibold uppercase">Patient</th>
                          <th className="pb-2 font-semibold uppercase">Study</th>
                          <th className="pb-2 font-semibold uppercase">Priority</th>
                          <th className="pb-2 font-semibold uppercase">Status</th>
                          <th className="pb-2 font-semibold uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studies.filter(s => s.priority === PriorityLevel.CRITICAL || s.priority === PriorityLevel.HIGH).map(s => (
                          <tr key={s.id} className="border-b border-[#222736]/50 hover:bg-[#1a1f2e] transition-colors cursor-pointer" onClick={() => { setSelectedStudyId(s.id); setCurrentTab('medical-images'); }}>
                            <td className="py-3 text-slate-200 font-medium">{s.patientName}</td>
                            <td className="py-3 text-slate-400">{s.modality} - {s.bodyPart}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${s.priority === PriorityLevel.CRITICAL ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-orange-900/50 text-orange-400 border border-orange-800'}`}>
                                {s.priority}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="bg-slate-800/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{s.status}</span>
                            </td>
                            <td className="py-3 text-right">
                              <button className="text-red-400 font-semibold hover:text-red-300">Review Urgent →</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {currentTab === 'settings' && currentUser.role === UserRole.RADIOLOGIST && (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                <ShieldAlert className="w-5 h-5 text-indigo-500" /> HIPAA Audit Vault
              </h2>
              
              <div className={`rounded-xl border overflow-hidden ${isWhiteTheme ? 'bg-white border-slate-200' : 'bg-[#151923] border-[#222736]'}`}>
                <div className="p-4 border-b border-[#222736] bg-slate-900/50">
                  <h3 className="font-bold text-sm uppercase text-slate-300">System Activity Logs</h3>
                </div>
                <div className="p-0 max-h-[600px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      No audit logs available.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[#151923] border-b border-[#222736]">
                        <tr className="text-slate-500">
                          <th className="p-3 font-semibold uppercase">Timestamp</th>
                          <th className="p-3 font-semibold uppercase">User</th>
                          <th className="p-3 font-semibold uppercase">Action</th>
                          <th className="p-3 font-semibold uppercase">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map(log => (
                          <tr key={log.id} className="border-b border-[#222736]/30 hover:bg-[#1a1f2e] transition-colors">
                            <td className="p-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-3 text-slate-300">{log.username}</td>
                            <td className="p-3">
                              <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{log.action}</span>
                            </td>
                            <td className="p-3 text-slate-400">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fallback */}
          {!['dashboard', 'medical-images', 'reports', 'upload-scan', 'emergency-queue', 'settings'].includes(currentTab) && (
            <div className="flex h-full items-center justify-center flex-col text-slate-500">
              <BrainCircuit className="w-12 h-12 mb-4 text-slate-700" />
              <p>Module "{currentTab}" is under construction or intentionally removed in Phase 1.</p>
              <button onClick={() => setCurrentTab('dashboard')} className="mt-4 text-blue-500 text-sm">Return to Dashboard</button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
