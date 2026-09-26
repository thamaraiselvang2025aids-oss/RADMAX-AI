import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Activity, Search, Bell, Plus, ChevronRight, X, User,
  CheckCircle, AlertTriangle, Users, FileText, Settings, Download
} from 'lucide-react';
import './index.css';

// --- FORMAT DATE UTILS ---
const getSystemDate = () => {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return new Date().toLocaleDateString('en-GB', options);
};

// --- LOGIN PAGE ---
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-logo">
          <Activity size={32} />
          <h2>MEDVISION AI</h2>
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.4, maxWidth: '400px' }}>
          AI-assisted medical imaging workflow for modern radiology teams.
        </h3>
      </div>
      
      <div className="login-right">
        <div className="login-card">
          <h2 className="mb-6" style={{ fontSize: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            Radiologist Sign In
          </h2>
          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label>Professional Email</label>
              <input 
                type="text" 
                className="input-field" 
                value={email} onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="login-form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={password} onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>
            <div className="flex items-center mb-6 gap-2">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" className="text-sm text-muted">Remember me</label>
            </div>
            <button type="submit" className="btn-primary w-full mb-4">
              SIGN IN
            </button>
            <div className="flex justify-between items-center text-sm">
              <a href="#" className="text-muted" style={{ textDecoration: 'underline' }}>Forgot password?</a>
              <span className="text-muted flex items-center gap-2">
                <CheckCircle size={14} color="var(--status-positive)" /> Secure clinical workspace
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- DASHBOARD LAYOUT & VIEWS ---
function Dashboard() {
  const navigate = useNavigate();
  const [activeSidebar, setActiveSidebar] = useState('My Worklist');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sysDate, setSysDate] = useState(getSystemDate());
  const [selectedStudy, setSelectedStudy] = useState(null);

  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  
  const [studies, setStudies] = useState([]);
  
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch data on load
  const fetchData = async () => {
    try {
      const [ptRes, stRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/patients'),
        fetch('http://localhost:8001/api/v1/studies')
      ]);
      if (ptRes.ok) setPatients(await ptRes.json());
      if (stRes.ok) setStudies(await stRes.json());
    } catch (err) {
      console.error("Error fetching data from API:", err);
    }
  };

  // Workstation XAI State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modality, setModality] = useState('MRI');
  const [bodyPart, setBodyPart] = useState('Brain');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setSysDate(getSystemDate()), 60000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const runDiagnostics = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('modality', modality);
    formData.append('bodyPart', bodyPart);

    try {
      const response = await fetch('http://localhost:8001/api/v1/inference', {
        method: 'POST', body: formData,
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error contacting local FastAPI ML Backend. Ensure it is running.");
    } finally {
      setLoading(false);
    }
  };

  if (selectedStudy) {
    return (
      <div className="workstation-layout">
        <div className="ws-topbar">
          <button className="btn-primary" onClick={() => setSelectedStudy(null)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}>
            ← Cancel
          </button>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span>Patient: {selectedStudy.patient || 'Select Patient'} {selectedStudy.patientId ? `(${selectedStudy.patientId})` : ''}</span>
            <span className="text-muted">|</span>
            <span>{modality || selectedStudy.study}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted text-sm">AI Analysis:</span>
            <span className={`ai-status ${selectedStudy.aiType}`}>{selectedStudy.aiLabel}</span>
          </div>
        </div>

        <div className="ws-main">
          <div className="ws-grid">
            {/* LEFT COLUMN - PATIENT DATA OR FORM */}
            <div className="ws-col-left">
              {selectedStudy.isNew ? (
                <>
                  <h3 className="text-sm text-tertiary mb-4 uppercase tracking-wide">Patient Selection</h3>
                  <div className="mb-6">
                    <select className="input-field" onChange={(e) => {
                      const p = patients.find(pt => pt.id === e.target.value);
                      if (p) {
                        setSelectedStudy(prev => ({ 
                          ...prev, 
                          patientId: p.id, 
                          patient: p.name, 
                          age: p.age, 
                          gender: p.gender,
                          phone: p.phone,
                          history: p.history,
                          allergies: p.allergies,
                          doctor: p.doctor,
                          notes: p.notes
                        }));
                      } else {
                        setSelectedStudy(prev => ({ ...prev, patientId: null, patient: null }));
                      }
                    }}>
                      <option value="">-- Search & Select Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.id} - {p.name} ({p.dob || p.age})</option>
                      ))}
                    </select>
                  </div>

                  {selectedStudy.patientId ? (
                    <>
                      <h3 className="text-sm text-tertiary mb-2 uppercase tracking-wide border-b border-subtle pb-1">Patient Information</h3>
                      <div className="mb-6 bg-app p-3 rounded border border-subtle text-sm">
                        <div className="flex justify-between mb-1"><span className="text-muted">ID:</span> <span className="font-mono text-primary">{selectedStudy.patientId}</span></div>
                        <div className="flex justify-between mb-1"><span className="text-muted">Name:</span> <span className="font-medium text-primary">{selectedStudy.patient}</span></div>
                        <div className="flex justify-between mb-1"><span className="text-muted">Gender/Age:</span> <span>{selectedStudy.gender} / {selectedStudy.age}</span></div>
                        {selectedStudy.phone && <div className="flex justify-between mb-1"><span className="text-muted">Phone:</span> <span>{selectedStudy.phone}</span></div>}
                        {selectedStudy.doctor && <div className="flex justify-between mb-1"><span className="text-muted">Ref. Doctor:</span> <span>{selectedStudy.doctor}</span></div>}
                        
                        <div className="mt-2 border-t border-subtle pt-2">
                          <div className="text-xs text-muted uppercase mb-1">Medical History</div>
                          <div className="text-xs">{selectedStudy.history || 'None'}</div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-muted uppercase mb-1">Allergies</div>
                          <div className="text-xs text-status-urgent">{selectedStudy.allergies || 'None'}</div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-muted uppercase mb-1">Clinical Notes</div>
                          <div className="text-xs">{selectedStudy.notes || 'None'}</div>
                        </div>
                      </div>

                      <h3 className="text-sm text-tertiary mb-4 uppercase tracking-wide border-b border-subtle pb-1">Study Setup</h3>
                      <div className="mb-4">
                        <label className="text-xs text-muted block mb-1 uppercase">Study ID</label>
                        <input className="input-field mono" value={`STD-${Math.floor(Math.random() * 9000) + 1000}`} readOnly />
                      </div>
                      <div className="mb-4">
                        <label className="text-xs text-muted block mb-1 uppercase">Modality</label>
                        <select className="input-field" value={modality} onChange={(e) => setModality(e.target.value)}>
                          <option value="MRI">MRI</option>
                          <option value="CT">CT</option>
                          <option value="X-Ray">X-Ray</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="text-xs text-muted block mb-1 uppercase">Region</label>
                        <select className="input-field" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)}>
                          <option value="Brain">Brain</option>
                          <option value="Lung">Lung</option>
                          <option value="Chest">Chest</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="text-xs text-muted block mb-1 uppercase">Clinical Indication</label>
                        <textarea className="input-field" rows={3} placeholder="Enter clinical indication for this specific study..."></textarea>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 text-muted text-sm border border-subtle rounded border-dashed">
                      Please select a patient from the directory above to proceed with the study setup.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-sm text-tertiary mb-2 uppercase tracking-wide">Patient</h3>
                  <div className="ws-data-group"><span className="ws-data-label">Name</span><span className="ws-data-value">{selectedStudy.patient}</span></div>
                  <div className="ws-data-group"><span className="ws-data-label">Age</span><span className="ws-data-value">{selectedStudy.age}</span></div>
                  <div className="ws-data-group"><span className="ws-data-label">Gender</span><span className="ws-data-value">{selectedStudy.gender}</span></div>
                  <div className="ws-data-group"><span className="ws-data-label">Patient ID</span><span className="ws-data-value mono">{selectedStudy.id}</span></div>
                  <div className="ws-data-group"><span className="ws-data-label">Scan Date</span><span className="ws-data-value">{sysDate}</span></div>
                </>
              )}
            </div>

            {/* MIDDLE COLUMN - VIEWER */}
            <div className="ws-col-mid">
              <div className="image-viewer">
                {selectedStudy.isNew ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div className="file-drop" onClick={() => fileInputRef.current.click()} style={{ width: '100%', maxWidth: '400px' }}>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,.dcm" />
                      {preview ? (
                        <img src={preview} alt="Upload preview" style={{ maxHeight: '200px', borderRadius: '4px' }} />
                      ) : (
                        <span>Click to upload DICOM/Image</span>
                      )}
                    </div>
                    {preview && (
                      <button className="btn-primary mt-4" onClick={runDiagnostics} disabled={loading} style={{ width: '100%', maxWidth: '400px' }}>
                        {loading ? 'Processing ML Inference...' : 'Run AI Analysis'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    {selectedStudy.heatmapUrl ? (
                      <img src={selectedStudy.heatmapUrl} alt="AI Heatmap" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-subtle)' }} />
                    ) : (
                      <div style={{ width: '300px', height: '300px', border: '2px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        No Image Available
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="viewer-controls">
                <button>Zoom</button>
                <button>−</button>
                <button>+</button>
                <button>Pan</button>
                <button>Window/Level</button>
                <button>Reset</button>
              </div>
            </div>

            {/* RIGHT COLUMN - AI FINDINGS */}
            <div className="ws-col-right">
              <h3 className="text-sm text-tertiary mb-4 uppercase tracking-wide">AI Findings</h3>
              
              {selectedStudy.isNew && !result && !loading && (
                <div className="text-muted text-sm text-center mt-8">
                  Upload an image and run analysis to view findings.
                </div>
              )}

              {loading && (
                <div className="text-center mt-8 text-primary">
                  <Activity className="spin mx-auto mb-2" size={24} color="var(--accent-blue)" />
                  Analyzing image...
                </div>
              )}

              {result && selectedStudy.isNew && (
                <div className="xai-result-panel" style={{ marginTop: 0 }}>
                  {result.heatmapOverlayUrl && <img src={result.heatmapOverlayUrl} className="xai-img" alt="Grad-CAM XAI" />}
                  <div className="flex items-center gap-2 font-medium mb-2" style={{ color: result.emergencyPriority === 'HIGH' ? 'var(--status-urgent)' : 'var(--text-primary)' }}>
                    <AlertTriangle size={16} /> {result.diseasesDetected?.[0]?.disease || 'Standard Finding'}
                  </div>
                  <div className="mb-4">
                    <p className="text-sm"><span className="text-muted">Confidence:</span> <span className="font-medium text-primary">{result.confidenceScore}%</span></p>
                    <p className="text-sm"><span className="text-muted">Severity:</span> <span className="font-medium" style={{ color: result.emergencyPriority === 'HIGH' ? 'var(--status-urgent)' : 'var(--text-primary)' }}>{result.emergencyPriority}</span></p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-xs text-muted mb-2 uppercase">AI Explanation</h4>
                    <p className="text-sm text-primary" style={{ lineHeight: 1.5 }}>
                      {result.aiFindings}
                    </p>
                  </div>
                </div>
              )}

              {!selectedStudy.isNew && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-status-urgent font-medium mb-2">
                      <AlertTriangle size={16} /> {selectedStudy.findingDetails?.title || 'Abnormal Region'}
                    </div>
                    <p className="text-sm text-muted">
                      Location: {selectedStudy.findingDetails?.location || 'Right frontal region'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm"><span className="text-muted">Confidence:</span> <span className="font-medium text-primary">{selectedStudy.findingDetails?.confidence || '94%'}</span></p>
                    <p className="text-sm"><span className="text-muted">Severity:</span> <span className="font-medium text-status-urgent">{selectedStudy.findingDetails?.severity || 'Review'}</span></p>
                  </div>

                  <div>
                    <h4 className="text-xs text-muted mb-2 uppercase">AI Explanation</h4>
                    <p className="text-sm text-primary" style={{ lineHeight: 1.5 }}>
                      {selectedStudy.findingDetails?.explanation || 'The focal heat map isolates the specified region. The expansion and asymmetric enhancement identified here are consistent with clinical abnormality.'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="ws-bottom">
            <h3 className="text-sm text-tertiary mb-2 uppercase tracking-wide">Radiologist Findings</h3>
            <textarea className="input-field" rows={3} placeholder="Enter / edit clinical observations..." value={selectedStudy.clinicalHistory || ''} onChange={e => setSelectedStudy({...selectedStudy, clinicalHistory: e.target.value})}></textarea>
            <div className="flex justify-between items-center mt-2">
              <button className="btn-primary" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} onClick={() => setSelectedStudy(null)}>
                Discard
              </button>
              
              {selectedStudy.isNew ? (
                <button className="btn-primary" disabled={!result || !selectedStudy.patient} onClick={async () => {
                  if (!selectedStudy.patient) return alert("Select patient first");
                  const studyData = {
                    id: `ST-${Math.floor(Math.random() * 90000) + 10000}`,
                    patientId: selectedStudy.patientId,
                    patientName: selectedStudy.patient,
                    age: selectedStudy.age,
                    gender: selectedStudy.gender,
                    modality: modality,
                    bodyPart: bodyPart,
                    clinicalHistory: selectedStudy.clinicalHistory || 'Uploaded manually via Workstation',
                    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    date: sysDate,
                    aiType: result.emergencyPriority === 'HIGH' ? 'finding' : 'clear',
                    aiLabel: 'COMPLETED',
                    aiFindingTitle: result.diseasesDetected?.[0]?.disease || 'Standard Finding',
                    aiLocation: 'Detected Region',
                    aiConfidence: result.confidenceScore + '%',
                    aiSeverity: result.emergencyPriority,
                    aiExplanation: result.aiFindings,
                    heatmapUrl: result.heatmapOverlayUrl
                  };
                  await fetch('http://localhost:8001/api/v1/studies', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studyData)
                  });
                  fetchData();
                  setSelectedStudy(null);
                }}>
                  {result ? 'Save Study & Finalize' : 'Run AI First to Save'}
                </button>
              ) : (
                <button className="btn-primary" onClick={() => setSelectedStudy(null)}>Close Viewer</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="app-layout">
        {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity size={20} /> MEDVISION AI
        </div>
        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-title">WORKSPACE</div>
            <button className={`nav-item ${activeSidebar === 'My Worklist' ? 'active' : ''}`} onClick={() => setActiveSidebar('My Worklist')}>
              <CheckCircle size={16} /> My Worklist
            </button>
            <button className={`nav-item ${activeSidebar === 'Priority' ? 'active' : ''}`} onClick={() => setActiveSidebar('Priority')}>
              <AlertTriangle size={16} /> Priority
            </button>
          </div>
          <div className="nav-section">
            <div className="nav-title">PATIENTS</div>
            <button className={`nav-item ${activeSidebar === 'Patient Directory' ? 'active' : ''}`} onClick={() => setActiveSidebar('Patient Directory')}>
              <Users size={16} /> Patient Directory
            </button>
          </div>
          <div className="nav-section">
            <div className="nav-title">SYSTEM</div>
            <button className={`nav-item ${activeSidebar === 'XAI Reports' ? 'active' : ''}`} onClick={() => setActiveSidebar('XAI Reports')}>
              <FileText size={16} /> XAI Reports
            </button>
            <button className={`nav-item ${activeSidebar === 'Settings' ? 'active' : ''}`} onClick={() => setActiveSidebar('Settings')}>
              <Settings size={16} /> Settings
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-wrapper">
        <header className="top-header">
          <div className="search-bar">
            <Search size={16} color="var(--text-tertiary)" />
            <input type="text" placeholder="Search patient, MRN, accession or study..." />
          </div>
          <div className="header-actions">
            <Bell size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
            <div className="flex items-center gap-2">
              <User size={18} color="var(--text-secondary)" />
              <span className="font-medium">Dr. Smith</span>
            </div>
            <button className="btn-primary" onClick={() => setSelectedStudy({ isNew: true, id: 'New Study', study: 'Pending Upload', aiType: 'processing', aiLabel: 'PENDING' })}>
              <Plus size={16} /> Add Study
            </button>
          </div>
        </header>

        <div className="dashboard-container">
          {/* MAIN GRID */}
          <div className="dashboard-main">
            {activeSidebar === 'My Worklist' && (
              <>
                <div className="mb-6">
                  <h1 style={{ fontSize: '1.25rem' }}>Good morning, Dr. Smith</h1>
                  <p className="text-muted">{sysDate}</p>
                </div>

                <div className="metrics-row">
                  <div className="metric-card">
                    <div className="metric-value">12</div>
                    <div className="metric-label">To Read</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">04</div>
                    <div className="metric-label">Priority Studies</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">28m</div>
                    <div className="metric-label">Avg TAT</div>
                  </div>
                </div>

                <div className="queue-header">
                  <h3>MY READING QUEUE</h3>
                </div>
                
                <div className="filters mb-4">
                  {['All', 'Priority', 'MRI', 'CT', 'X-Ray', 'Unread'].map(f => (
                    <button key={f} className={`filter-pill ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
                      {f}
                    </button>
                  ))}
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>MRN / Patient ID</th>
                      <th>Patient</th>
                      <th>Age / Sex</th>
                      <th>Study</th>
                      <th>Indication</th>
                      <th>AI Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studies.filter(s => activeFilter === 'All' || s.modality === activeFilter || s.aiSeverity === activeFilter).map(s => (
                      <tr key={s.id}>
                        <td>{s.time}</td>
                        <td className="mono">{s.patientId}</td>
                        <td className={s.aiSeverity === 'HIGH' ? 'priority-urgent' : 'font-medium'}>{s.patientName}</td>
                        <td>{s.age} · {s.gender}</td>
                        <td className={s.aiSeverity === 'HIGH' ? 'priority-urgent' : ''}>{s.modality} {s.bodyPart}</td>
                        <td>{s.clinicalHistory}</td>
                        <td><span className={`ai-status ${s.aiType}`}>{s.aiType === 'finding' ? 'AI FINDING' : s.aiType === 'clear' ? 'AI CLEAR' : 'AI COMPLETED'}</span></td>
                        <td>
                          <button className="action-link" onClick={() => setSelectedStudy({
                            id: s.patientId, patient: s.patientName, age: s.age, gender: s.gender, study: s.modality, aiType: s.aiType, aiLabel: s.aiLabel,
                            clinicalHistory: s.clinicalHistory, heatmapUrl: s.heatmapUrl,
                            findingDetails: { title: s.aiFindingTitle, location: s.aiLocation, confidence: s.aiConfidence, severity: s.aiSeverity, explanation: s.aiExplanation }
                          })}>OPEN <ChevronRight size={14}/></button>
                        </td>
                      </tr>
                    ))}
                    {studies.length === 0 && (
                      <tr><td colSpan="8" className="text-center text-muted p-4">No studies found in the database. Add a new study.</td></tr>
                    )}
                  </tbody>
                </table>
              </>
            )}

            {activeSidebar === 'Patient Directory' && (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <h1 style={{ fontSize: '1.25rem' }}>Patient Directory</h1>
                  {!editingPatient && (
                    <div className="flex gap-4">
                      <div className="search-bar" style={{ width: '250px' }}>
                        <Search size={16} color="var(--text-tertiary)" />
                        <input type="text" placeholder="Search patients..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                      </div>
                      <button className="btn-primary" onClick={() => setEditingPatient({ id: `PT-${Math.floor(Math.random() * 90000) + 10000}`, name: '', dob: '', age: '', gender: 'Male', phone: '', email: '', address: '', history: '', allergies: '', doctor: '', notes: '', studies: 0, lastStudy: 'N/A', status: 'New' })}>
                        <Plus size={16} /> New Patient
                      </button>
                    </div>
                  )}
                </div>

                {editingPatient ? (
                  <div className="bg-panel p-6 border border-subtle rounded">
                    <h3 className="text-sm text-tertiary mb-4 uppercase tracking-wide">Patient Registration</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div><label className="text-xs text-muted block mb-1">Patient ID</label><input className="input-field mono" value={editingPatient.id} onChange={e => setEditingPatient({...editingPatient, id: e.target.value})} /></div>
                      <div><label className="text-xs text-muted block mb-1">Full Name</label><input className="input-field" value={editingPatient.name} onChange={e => setEditingPatient({...editingPatient, name: e.target.value})} /></div>
                      <div><label className="text-xs text-muted block mb-1">Date of Birth</label><input type="date" className="input-field" value={editingPatient.dob} onChange={e => setEditingPatient({...editingPatient, dob: e.target.value})} /></div>
                      <div><label className="text-xs text-muted block mb-1">Age</label><input className="input-field" value={editingPatient.age} onChange={e => setEditingPatient({...editingPatient, age: e.target.value})} /></div>
                      <div><label className="text-xs text-muted block mb-1">Gender</label><select className="input-field" value={editingPatient.gender} onChange={e => setEditingPatient({...editingPatient, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div>
                      <div><label className="text-xs text-muted block mb-1">Phone</label><input className="input-field" value={editingPatient.phone} onChange={e => setEditingPatient({...editingPatient, phone: e.target.value})} /></div>
                      <div><label className="text-xs text-muted block mb-1">Email</label><input className="input-field" value={editingPatient.email} onChange={e => setEditingPatient({...editingPatient, email: e.target.value})} /></div>
                      <div><label className="text-xs text-muted block mb-1">Referring Doctor</label><input className="input-field" value={editingPatient.doctor} onChange={e => setEditingPatient({...editingPatient, doctor: e.target.value})} /></div>
                    </div>
                    <div className="mb-4"><label className="text-xs text-muted block mb-1">Address</label><input className="input-field" value={editingPatient.address} onChange={e => setEditingPatient({...editingPatient, address: e.target.value})} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div><label className="text-xs text-muted block mb-1">Medical History</label><textarea className="input-field" rows={2} value={editingPatient.history} onChange={e => setEditingPatient({...editingPatient, history: e.target.value})}></textarea></div>
                      <div><label className="text-xs text-muted block mb-1">Allergies</label><textarea className="input-field" rows={2} value={editingPatient.allergies} onChange={e => setEditingPatient({...editingPatient, allergies: e.target.value})}></textarea></div>
                    </div>
                    <div className="mb-6"><label className="text-xs text-muted block mb-1">Clinical Notes</label><textarea className="input-field" rows={2} value={editingPatient.notes} onChange={e => setEditingPatient({...editingPatient, notes: e.target.value})}></textarea></div>
                    <div className="flex gap-4">
                      <button className="btn-primary" onClick={async () => {
                        await fetch('http://localhost:8001/api/v1/patients', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPatient)
                        });
                        fetchData();
                        setEditingPatient(null);
                      }}>Save Patient</button>
                      <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }} onClick={() => setEditingPatient(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Patient</th>
                        <th>Age / Sex</th>
                        <th>Studies</th>
                        <th>Last Study</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.id.toLowerCase().includes(patientSearch.toLowerCase())).map(p => (
                        <tr key={p.id}>
                          <td className="mono">{p.id}</td>
                          <td className="font-medium">{p.name}</td>
                          <td>{p.age} · {p.gender}</td>
                          <td>{p.studies}</td>
                          <td>{p.lastStudy}</td>
                          <td>{p.status}</td>
                          <td>
                            <div className="flex gap-2">
                              <button className="action-link" onClick={() => setEditingPatient(p)}>Edit</button>
                              <span className="text-muted">|</span>
                              <button className="action-link text-status-urgent" onClick={async () => {
                                await fetch(`http://localhost:8001/api/v1/patients/${p.id}`, { method: 'DELETE' });
                                fetchData();
                              }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {activeSidebar === 'XAI Reports' && (
              <>
                {selectedReport ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', width: '100%', height: '100%', overflowY: 'auto', padding: '1.5rem', boxSizing: 'border-box', background: 'var(--bg-app)' }}>
                    
                    {/* TOP: Full-width header */}
                    <div className="bg-panel border border-subtle rounded p-4 shadow-sm w-full" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn-primary" onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', padding: '0.25rem 0.75rem', borderRadius: '6px' }}>← Back to Reports</button>
                        <h2 className="text-lg font-semibold tracking-wide">RADIOLOGY REPORT <span className="text-muted ml-2 font-mono text-sm">{selectedReport.id}</span></h2>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button className="btn-primary" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} onClick={() => {
                           setReports(prev => prev.map(r => r.id === selectedReport.id ? {...selectedReport, status: 'Draft'} : r));
                           setSelectedReport(null);
                        }}>Save Draft</button>
                        <button className="btn-primary flex items-center gap-2" onClick={() => window.print()}><Download size={14}/> Print PDF</button>
                        <button className="btn-primary" style={{ background: 'var(--accent-blue)', color: '#fff', fontWeight: 'bold' }} onClick={() => {
                           setReports(prev => prev.map(r => r.id === selectedReport.id ? {...selectedReport, status: 'Finalized'} : r));
                           setSelectedReport(null);
                        }}>Finalize Report</button>
                      </div>
                    </div>

                    {/* ROW 1: Full-width Patient & Study Summary card */}
                    <div className="bg-panel rounded border border-subtle p-6 shadow-sm w-full">
                      <h3 className="text-sm text-accent-blue mb-4 uppercase tracking-wider font-bold border-b border-subtle pb-2 flex items-center gap-2"><User size={16}/> Patient & Study Summary</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                        {selectedReport.isNew ? (
                          <>
                            <div style={{ gridColumn: 'span 2' }}>
                              <div className="text-xs text-muted uppercase mb-1">Select Patient & Study</div>
                              <select 
                                className="input-field" 
                                style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', width: '100%', padding: '0.5rem' }}
                                value={selectedReport.patientId}
                                onChange={(e) => {
                                  const pId = e.target.value;
                                  const p = patients.find(pt => pt.id === pId);
                                  // Find a matching study for this patient to pull AI data
                                  const st = studies.find(s => s.patientId === pId) || {};
                                  setSelectedReport(prev => ({
                                    ...prev, 
                                    patientId: pId, 
                                    patientName: p ? p.name : '',
                                    gender: p ? p.gender : '',
                                    age: p ? p.age : '',
                                    study: st.modality || 'MRI',
                                    bodyPart: st.bodyPart || 'Brain',
                                    aiFinding: st.aiFindingTitle || 'No Critical Findings',
                                    confidence: st.aiConfidence || 'N/A',
                                    heatmapUrl: st.heatmapUrl || '',
                                    observations: st.aiExplanation || 'Clinical observation notes pending.'
                                  }));
                                }}
                              >
                                <option value="">-- Choose Patient --</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Gender</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.gender || ''} onChange={e => setSelectedReport({...selectedReport, gender: e.target.value})} />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Age / DOB</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.age || ''} onChange={e => setSelectedReport({...selectedReport, age: e.target.value})} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Patient ID</div>
                              <input className="input-field w-full mono" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.patientId || ''} onChange={e => setSelectedReport({...selectedReport, patientId: e.target.value})} />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Full Name</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.patientName || ''} onChange={e => setSelectedReport({...selectedReport, patientName: e.target.value})} />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Gender</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.gender || patients.find(p => p.id === selectedReport.patientId)?.gender || ''} onChange={e => setSelectedReport({...selectedReport, gender: e.target.value})} />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Age / DOB</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.age || patients.find(p => p.id === selectedReport.patientId)?.age || ''} onChange={e => setSelectedReport({...selectedReport, age: e.target.value})} />
                            </div>
                          </>
                        )}
                        
                        <div>
                          <div className="text-xs text-muted uppercase mb-1">Modality</div>
                          <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.study || ''} onChange={e => setSelectedReport({...selectedReport, study: e.target.value})} />
                        </div>
                        <div>
                          <div className="text-xs text-muted uppercase mb-1">Body Part</div>
                          <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.bodyPart || 'Head / Chest'} onChange={e => setSelectedReport({...selectedReport, bodyPart: e.target.value})} />
                        </div>
                        <div>
                          <div className="text-xs text-muted uppercase mb-1">Study Date</div>
                          <input type="date" className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.date || ''} onChange={e => setSelectedReport({...selectedReport, date: e.target.value})} />
                        </div>
                        <div><div className="text-xs text-muted uppercase mb-1">AI Status</div><div className="text-sm mt-1"><span className={`ai-status ${selectedReport.status === 'Draft' ? 'processing' : 'finding'}`}>{selectedReport.status}</span></div></div>
                      </div>
                    </div>

                    {/* ROW 2: Full-width AI Diagnostics & Findings card */}
                    <div className="bg-panel rounded border border-subtle p-6 shadow-sm w-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-status-urgent"></div>
                      <h3 className="text-sm text-accent-blue mb-4 uppercase tracking-wider font-bold border-b border-subtle pb-2 flex items-center gap-2"><Activity size={16}/> AI Diagnostics & Findings</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div>
                            <div className="text-xs text-muted uppercase mb-1">Detected Abnormality</div>
                            <input className="input-field w-full text-status-urgent font-medium" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.aiFinding || ''} onChange={e => setSelectedReport({...selectedReport, aiFinding: e.target.value})} />
                          </div>
                          <div>
                            <div className="text-xs text-muted uppercase mb-1">Confidence Score</div>
                            <input className="input-field w-full text-primary font-bold" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={selectedReport.confidence || ''} onChange={e => setSelectedReport({...selectedReport, confidence: e.target.value})} />
                          </div>
                          <div>
                            <div className="text-xs text-muted uppercase mb-1">AI Explanation</div>
                            <textarea className="input-field w-full text-sm text-secondary" rows={4} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.5rem', resize: 'vertical' }} value={selectedReport.observations || ''} onChange={e => setSelectedReport({...selectedReport, observations: e.target.value})} />
                          </div>
                        </div>
                        
                        <div className="w-full h-48 bg-app border border-subtle rounded flex flex-col items-center justify-center text-muted text-xs p-2 text-center">
                          {selectedReport.heatmapUrl ? (
                            <img src={selectedReport.heatmapUrl} alt="AI Heatmap" className="h-full w-full object-contain rounded" />
                          ) : (
                            <span>[ AI Image / Heatmap ]</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ROW 3: Radiologist Report section */}
                    <div className="bg-panel rounded border border-subtle p-6 shadow-sm" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
                      <div className="border-b border-subtle pb-4">
                        <h3 className="text-sm text-accent-blue uppercase tracking-wider font-bold flex items-center gap-2"><FileText size={16}/> Radiologist Report</h3>
                        <p className="text-xs text-muted mt-1">Complete the clinical findings and recommendations below.</p>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label className="text-xs text-primary font-bold block mb-2 uppercase tracking-wider">Clinical History / Observations</label>
                        <textarea className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', minHeight: '140px', width: '100%', boxSizing: 'border-box' }} value={selectedReport.observations} onChange={e => setSelectedReport({...selectedReport, observations: e.target.value})} placeholder="Enter patient history and initial clinical observations..."></textarea>
                      </div>
                      
                      <div style={{ width: '100%' }}>
                        <label className="text-xs text-primary font-bold block mb-2 uppercase tracking-wider">Radiographic Findings</label>
                        <textarea className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', minHeight: '180px', width: '100%', boxSizing: 'border-box' }} value={selectedReport.findings} onChange={e => setSelectedReport({...selectedReport, findings: e.target.value})} placeholder="Detail all radiographic findings, noting exact anatomical locations..."></textarea>
                      </div>
                      
                      <div style={{ width: '100%' }}>
                        <label className="text-xs text-primary font-bold block mb-2 uppercase tracking-wider">Impression</label>
                        <textarea className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', minHeight: '140px', width: '100%', boxSizing: 'border-box' }} value={selectedReport.impression} onChange={e => setSelectedReport({...selectedReport, impression: e.target.value})} placeholder="State the final clinical impression..."></textarea>
                      </div>

                      <div style={{ width: '100%' }}>
                        <label className="text-xs text-primary font-bold block mb-2 uppercase tracking-wider">Recommendations / Follow-up</label>
                        <textarea className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', minHeight: '140px', width: '100%', boxSizing: 'border-box' }} value={selectedReport.recommendations} onChange={e => setSelectedReport({...selectedReport, recommendations: e.target.value})} placeholder="Suggested clinical follow-up..."></textarea>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex justify-between items-center">
                      <h1 style={{ fontSize: '1.25rem' }}>XAI Reports</h1>
                      <button className="btn-primary" onClick={() => setSelectedReport({ id: `REP-${Math.floor(Math.random()*9000)+1000}`, patientId: 'PT-10429', patientName: 'New Patient', study: 'CT Chest', modality: 'DenseNet121', date: sysDate, status: 'Draft', aiFinding: 'Pneumonia Indicator', confidence: '88%', observations: '', findings: '', impression: '', recommendations: '' })}>
                        <Plus size={16} /> Create Report
                      </button>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Report ID</th>
                          <th>Patient</th>
                          <th>Study</th>
                          <th>Finding</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map(r => (
                          <tr key={r.id}>
                            <td className="mono">{r.id}</td>
                            <td className="font-medium">{r.patientName}</td>
                            <td>{r.study}</td>
                            <td><span className="ai-status finding">{r.aiFinding}</span></td>
                            <td className={r.status === 'Finalized' ? 'text-status-positive font-medium' : 'text-muted'}>{r.status}</td>
                            <td>{r.date}</td>
                            <td>
                              <button className="action-link" onClick={() => setSelectedReport(r)}>
                                {r.status === 'Finalized' ? 'View' : 'Edit'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}

            {activeSidebar === 'Settings' && (
              <div style={{ maxWidth: '600px' }}>
                <div className="mb-6"><h1 style={{ fontSize: '1.25rem' }}>Settings</h1></div>
                
                <div className="mb-6">
                  <h3 className="text-base mb-2 border-b border-subtle pb-2">Profile</h3>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-muted">Name: Dr. Smith</label>
                    <label className="text-sm text-muted">Professional ID: RAD-1042</label>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-base mb-2 border-b border-subtle pb-2">Appearance</h3>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked readOnly /> <label className="text-sm text-muted">Dark Theme</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (ACTIVITY & PROCESSING) - Hidden on XAI Reports to maximize width */}
          {activeSidebar !== 'XAI Reports' && (
            <div className="dashboard-right">
              <div className="panel-section">
                <h3>RECENT ACTIVITY</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-dot active"></div>
                    <div className="activity-content">
                      <p>AI analysis completed</p>
                      <div className="meta">PT-10428 · MRI Brain<br/>2 min ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p>New study received</p>
                      <div className="meta">PT-10435 · CT Chest<br/>8 min ago</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p>Report finalized</p>
                      <div className="meta">PT-10418 · X-Ray Chest<br/>14 min ago</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel-section">
                <h3>AI PROCESSING</h3>
                <div className="processing-item">
                  <div className="proc-header">
                    <span className="mono">PT-10435</span>
                    <span>72%</span>
                  </div>
                  <div className="proc-meta">MRI Brain · Analyzing</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '72%' }}></div></div>
                </div>
                <div className="processing-item">
                  <div className="proc-header">
                    <span className="mono">PT-10431</span>
                    <span>100%</span>
                  </div>
                  <div className="proc-meta">CT Chest · Completed</div>
                  <div className="progress-bar"><div className="progress-fill done" style={{ width: '100%' }}></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    
      {/* --- PRINT PDF TEMPLATE (Hidden by default, activated on window.print()) --- */}
      {selectedReport && (
        <div className="print-container">
          <div className="print-header">
            <div>
              <h1>MEDVISION AI RADIOLOGY REPORT</h1>
              <p>Advanced Clinical Diagnostics</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p><strong>Report ID:</strong> {selectedReport.id}</p>
              <p><strong>Date:</strong> {selectedReport.date}</p>
              <p><strong>Status:</strong> {selectedReport.status.toUpperCase()}</p>
            </div>
          </div>

          <div className="print-grid">
            <div>
              <span className="print-label">Patient Name:</span>
              <span className="print-val"> {selectedReport.patientName}</span><br/>
              <span className="print-label">Patient ID:</span>
              <span className="print-val"> {selectedReport.patientId}</span>
            </div>
            <div>
              <span className="print-label">Modality/Study:</span>
              <span className="print-val"> {selectedReport.study}</span><br/>
              <span className="print-label">AI Engine:</span>
              <span className="print-val"> {selectedReport.modality}</span>
            </div>
          </div>

          <div className="print-ai-box">
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '11pt', color: '#333' }}>AI Diagnostic Inference</h3>
            <p style={{ margin: 0 }}><strong>Detected Finding:</strong> {selectedReport.aiFinding} &nbsp;|&nbsp; <strong>Confidence:</strong> {selectedReport.confidence}</p>
          </div>

          <div className="print-section">
            <h3>Clinical Observations</h3>
            <p>{selectedReport.observations || 'None provided.'}</p>
          </div>

          <div className="print-section">
            <h3>Radiographic Findings</h3>
            <p>{selectedReport.findings || 'None provided.'}</p>
          </div>

          <div className="print-section">
            <h3>Impression</h3>
            <p>{selectedReport.impression || 'None provided.'}</p>
          </div>

          <div className="print-section">
            <h3>Recommendations</h3>
            <p>{selectedReport.recommendations || 'None provided.'}</p>
          </div>

          <div className="print-footer">
            <div>Page 1 of 1</div>
            <div>Generated by MedVision AI Workstation</div>
          </div>

          <div className="print-signature">
            <div className="print-signature-line">
              Dr. Smith<br/>
              Lead Radiologist
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
