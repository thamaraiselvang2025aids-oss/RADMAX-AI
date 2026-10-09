import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Activity, Search, Bell, Plus, ChevronRight, X, User,
  CheckCircle, AlertTriangle, Users, FileText, Settings, Download,
  ZoomIn, ZoomOut, Move, Sun, RotateCcw, Crosshair, Image as ImageIcon,
  Mic, FileSignature, Layers, Clock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
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
        fetch('/api/v1/patients'),
        fetch('/api/v1/studies')
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
  
  // Viewer State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [activeTool, setActiveTool] = useState('pan'); // 'pan', 'windowLevel', 'zoom'

  // AI Assistant State
  const [showAssistant, setShowAssistant] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello Dr. Smith. I am MedVision Copilot. How can I assist you with your clinical workflow today?' }
  ]);

  // Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({ format: 'CSV', dateRange: 'All Time', radiologist: 'All', disease: 'All' });

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setSysDate(getSystemDate()), 60000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const handleChatSubmit = (e) => {
    e.preventDefault();
    const query = chatInput.trim();
    if (!query) return;
    
    const newHistory = [...chatHistory, { role: 'user', text: query }];
    setChatHistory(newHistory);
    setChatInput('');
    
    setTimeout(() => {
      const queryLower = query.toLowerCase();
      const matchedStudies = studies.filter(s => s.patientName && s.patientName.toLowerCase().includes(queryLower));
      
      let aiResponseText = '';
      
      if (matchedStudies.length > 0) {
        const s = matchedStudies[0];
        aiResponseText = `I found a record for ${s.patientName} (ID: ${s.patientId}).\n\n• Demographics: ${s.age} / ${s.gender}\n• Visit Date: ${s.date}\n• Scan: ${s.modality} ${s.bodyPart}\n\nAI DIAGNOSIS:\nResult: ${s.aiFindingTitle || s.aiLabel || 'No abnormal findings'}\nSeverity: ${s.aiSeverity}\nDetails: ${s.aiExplanation || 'N/A'}`;
      } else if (queryLower.includes('hello') || queryLower.includes('hi')) {
        aiResponseText = "Hello! Please enter a patient's name to instantly retrieve their clinical history and AI analysis results.";
      } else {
        aiResponseText = `I couldn't find any patient records matching "${query}". Please verify the name or check the Patient Directory.`;
      }
      
      setChatHistory([...newHistory, { role: 'ai', text: aiResponseText }]);
    }, 400);
  };

  const handleExport = () => {
    try {
      let filtered = [...studies];
      const today = new Date();
      
      // Date filter
      filtered = filtered.filter(s => {
        if (exportConfig.dateRange === 'All Time') return true;
        let dStr = s.date || '';
        if (dStr.includes('/')) {
          const parts = dStr.split('/');
          if (parts.length === 3) dStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        const d = new Date(dStr);
        if (isNaN(d)) return true;
        
        if (exportConfig.dateRange === 'Today') {
          return d.toDateString() === today.toDateString();
        }
        if (exportConfig.dateRange === 'This Week') {
          const diff = today - d;
          return diff <= 7 * 24 * 60 * 60 * 1000 && diff >= 0;
        }
        if (exportConfig.dateRange === 'This Month') {
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }
        return true;
      });

      // Disease filter
      if (exportConfig.disease !== 'All') {
        filtered = filtered.filter(s => {
          const finding = (s.aiFindingTitle || s.aiLabel || '').toLowerCase();
          return finding.includes(exportConfig.disease.toLowerCase());
        });
      }

      if (exportConfig.format === 'CSV') {
        let csv = 'Date,Patient ID,Patient Name,Age,Gender,Phone,Email,Address,Medical History,Allergies,Clinical Notes,Referring Doctor,Study,AI Analysis,Severity\n';
        filtered.forEach(s => {
          const p = patients.find(pt => pt.id === s.patientId) || {};
          csv += `"${s.date || ''}","${s.patientId || ''}","${s.patientName || ''}","${s.age || ''}","${s.gender || ''}","${p.phone || ''}","${p.email || ''}","${(p.address || '').replace(/"/g, '""')}","${(p.history || '').replace(/"/g, '""')}","${(p.allergies || '').replace(/"/g, '""')}","${(p.notes || '').replace(/"/g, '""')}","${p.doctor || ''}","${s.modality || ''}","${s.aiFindingTitle || s.aiLabel || 'Normal'}","${s.aiSeverity || 'Low'}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MedVision_Export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('MedVision AI - Patient Export Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Filters: ${exportConfig.dateRange} | ${exportConfig.radiologist} | ${exportConfig.disease}`, 14, 30);
        let y = 40;
        filtered.forEach((s, idx) => {
          if (y > 260) { doc.addPage(); y = 20; }
          const p = patients.find(pt => pt.id === s.patientId) || {};
          doc.setFontSize(11);
          doc.text(`${idx + 1}. ${s.date || 'N/A'} - ${s.patientName || 'Unknown'} (${s.age || 'N/A'}) - ${s.modality || 'Unknown'}`, 14, y);
          doc.setFontSize(9);
          doc.text(`   Contact: ${p.phone || 'N/A'} | Email: ${p.email || 'N/A'} | Ref: ${p.doctor || 'N/A'}`, 14, y + 5);
          doc.text(`   History: ${String(p.history || 'N/A').substring(0, 60)}... | Allergies: ${p.allergies || 'N/A'}`, 14, y + 10);
          doc.text(`   AI: ${s.aiFindingTitle || s.aiLabel || 'Normal'} | Severity: ${s.aiSeverity || 'Low'}`, 14, y + 15);
          y += 22;
        });
        doc.save(`MedVision_Export_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      setShowExportModal(false);
    } catch (err) {
      alert("Error generating export. Reverting to CSV. " + err.message);
      // Fallback to CSV if PDF crashes
      exportConfig.format = 'CSV';
      handleExport();
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleViewerMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleViewerMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });
    
    if (activeTool === 'pan') {
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (activeTool === 'windowLevel') {
      setContrast(prev => Math.max(0, prev + dx * 0.5));
      setBrightness(prev => Math.max(0, prev - dy * 0.5));
    }
  };

  const handleViewerMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const generatePDF = (customData = null) => {
    const data = customData || selectedReport;
    if (!data) return;
    const pdf = new jsPDF('p', 'pt', 'a4');
    let y = 40;
    
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MEDVISION AI RADIOLOGY REPORT', 40, y);
    y += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    pdf.text('Advanced Clinical Diagnostics', 40, y);
    
    pdf.setTextColor(0);
    pdf.text(`Report ID: ${data.id || 'N/A'}`, 400, 40);
    pdf.text(`Date: ${data.date || getSystemDate()}`, 400, 55);
    pdf.text(`Status: ${(data.status || 'FINALIZED').toUpperCase()}`, 400, 70);
    
    y += 40;
    pdf.setLineWidth(0.5);
    pdf.line(40, y, 550, y);
    y += 20;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Name:', 40, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.patientName || 'N/A', 120, y);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Modality/Study:', 300, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.study || data.modality || 'N/A', 400, y);
    
    y += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient ID:', 40, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.patientId || 'N/A', 120, y);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Engine:', 300, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.modality || 'N/A', 400, y);
    
    y += 30;
    pdf.setFillColor(245, 245, 245);
    pdf.rect(40, y, 510, 40, 'F');
    y += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Diagnostic Inference', 50, y);
    y += 15;
    pdf.setFont('helvetica', 'normal');
    const aiFinding = data.aiFinding || data.aiFindingTitle || 'Standard Finding';
    const confidence = data.confidence || data.aiConfidence || 'N/A';
    pdf.text(`Detected Finding: ${aiFinding}   |   Confidence: ${confidence}`, 50, y);
    
    y += 40;

    if (data.heatmapUrl) {
      try {
        pdf.addImage(data.heatmapUrl, 'PNG', 40, y, 200, 200);
        y += 220;
      } catch (e) {
        console.error("Failed to add image to PDF", e);
      }
    }
    
    const sections = [
      { title: 'Clinical Observations', content: data.observations || data.clinicalHistory || data.aiExplanation || 'None provided.' },
      { title: 'Radiographic Findings', content: data.findings || 'None provided.' },
      { title: 'Impression', content: data.impression || 'None provided.' },
      { title: 'Recommendations', content: data.recommendations || 'None provided.' }
    ];
    
    sections.forEach(sec => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(sec.title.toUpperCase(), 40, y);
      y += 5;
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(200);
      pdf.line(40, y, 550, y);
      y += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      const splitText = pdf.splitTextToSize(sec.content, 510);
      // Ensure we don't go off the page
      if (y + (splitText.length * 15) > 800) {
        pdf.addPage();
        y = 40;
      }
      pdf.text(splitText, 40, y);
      y += (splitText.length * 15) + 20;
    });
    
    if (y + 60 > 800) {
      pdf.addPage();
      y = 40;
    }
    
    y += 30;
    pdf.setDrawColor(0);
    pdf.line(40, y, 200, y);
    y += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dr. Smith', 90, y);
    y += 15;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Lead Radiologist', 80, y);
    
    pdf.save(`MedVision_Report_${data.id || 'Export'}.pdf`);
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
      const response = await fetch('/api/v1/inference', {
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
                        <div className="flex justify-between mb-1"><span className="text-muted">DOB (Age):</span> <span>{(new Date().getFullYear() - parseInt(selectedStudy.age))}-01-01 ({selectedStudy.age})</span></div>
                        <div className="flex justify-between mb-1"><span className="text-muted">Gender:</span> <span>{selectedStudy.gender}</span></div>
                        <div className="flex justify-between mb-1"><span className="text-muted">Acc. Number:</span> <span className="font-mono text-primary">ACC-{Math.floor(Math.random() * 9000000) + 1000000}</span></div>
                        {selectedStudy.phone && <div className="flex justify-between mb-1"><span className="text-muted">Phone:</span> <span>{selectedStudy.phone}</span></div>}
                        {selectedStudy.doctor && <div className="flex justify-between mb-1"><span className="text-muted">Ref. Doctor:</span> <span>{selectedStudy.doctor}</span></div>}
                        
                        <div className="border-t border-subtle pt-2 mt-2">
                          <div className="text-xs text-muted uppercase mb-1 flex items-center gap-1"><Layers size={12} /> Prior Studies</div>
                          <div className="text-xs text-status-urgent">None</div>
                        </div>

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
                  <h3 className="text-sm text-tertiary mb-2 uppercase tracking-wide border-b border-subtle pb-1">Patient Information</h3>
                  <div className="mb-6 bg-app p-3 rounded border border-subtle text-sm">
                    <div className="flex justify-between mb-1"><span className="text-muted">ID:</span> <span className="font-mono text-primary">{selectedStudy.id}</span></div>
                    <div className="flex justify-between mb-1"><span className="text-muted">Name:</span> <span className="font-medium text-primary">{selectedStudy.patient}</span></div>
                    <div className="flex justify-between mb-1"><span className="text-muted">DOB (Age):</span> <span>{(new Date().getFullYear() - parseInt(selectedStudy.age))}-01-01 ({selectedStudy.age})</span></div>
                    <div className="flex justify-between mb-1"><span className="text-muted">Gender:</span> <span>{selectedStudy.gender}</span></div>
                    <div className="flex justify-between mb-1"><span className="text-muted">Acc. Number:</span> <span className="font-mono text-primary">ACC-{Math.floor(Math.random() * 9000000) + 1000000}</span></div>
                    <div className="flex justify-between mb-1"><span className="text-muted">Scan Date:</span> <span>{selectedStudy.date || sysDate}</span></div>

                    <div className="border-t border-subtle pt-2 mt-2">
                      <div className="text-xs text-muted uppercase mb-1 flex items-center gap-1"><Layers size={12} /> Prior Studies</div>
                      <div className="text-xs text-status-urgent">None</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* MIDDLE COLUMN - VIEWER */}
            <div className="ws-col-mid" style={{ background: '#000', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div className="image-viewer"
                style={{ flex: 1, overflow: 'hidden', position: 'relative', cursor: activeTool === 'pan' ? (isDragging ? 'grabbing' : 'grab') : (activeTool === 'windowLevel' ? 'col-resize' : 'crosshair') }}
                onMouseDown={handleViewerMouseDown}
                onMouseMove={handleViewerMouseMove}
                onMouseUp={handleViewerMouseUpOrLeave}
                onMouseLeave={handleViewerMouseUpOrLeave}
              >
                {selectedStudy.isNew ? (
                  <div style={{ width: '100%', height: '100%', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    
                    <div className="file-drop" onClick={() => fileInputRef.current.click()} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,.dcm" />
                      {preview ? (
                        <>
                          {/* DICOM Text Overlays */}
                          <div className="dicom-overlay" style={{ position: 'absolute', top: '10px', left: '10px', color: '#ffcc00', fontSize: '0.85rem', textShadow: '1px 1px 2px #000', pointerEvents: 'none', zIndex: 5, textAlign: 'left' }}>
                            <div>{selectedStudy.patient || 'UNKNOWN'}</div>
                            <div>ID: {selectedStudy.id || 'N/A'}</div>
                            <div>DOB: {selectedStudy.age ? (new Date().getFullYear() - parseInt(selectedStudy.age)) + '-01-01' : ''}</div>
                          </div>
                          <div className="dicom-overlay" style={{ position: 'absolute', top: '10px', right: '10px', color: '#ffcc00', fontSize: '0.85rem', textShadow: '1px 1px 2px #000', pointerEvents: 'none', zIndex: 5, textAlign: 'right' }}>
                            <div>{sysDate}</div>
                            <div>{modality} {bodyPart}</div>
                            <div>ACC-{(Math.floor(Math.random() * 9000000) + 1000000)}</div>
                          </div>
                          <div className="dicom-overlay" style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#ffcc00', fontSize: '0.85rem', textShadow: '1px 1px 2px #000', pointerEvents: 'none', zIndex: 5, textAlign: 'left' }}>
                            <div>Se: 1/1</div>
                            <div>Im: 1/1</div>
                          </div>
                          <div className="dicom-overlay" style={{ position: 'absolute', bottom: '10px', right: '10px', color: '#ffcc00', fontSize: '0.85rem', textShadow: '1px 1px 2px #000', pointerEvents: 'none', zIndex: 5, textAlign: 'right' }}>
                            <div>W: {Math.round(contrast * 2.5)} L: {Math.round(brightness * 1.5 - 50)}</div>
                            <div>Thk: 3.0 mm</div>
                          </div>
                          
                          <img src={preview} alt="Upload preview" 
                            style={{ 
                              maxHeight: '400px', maxWidth: '100%', objectFit: 'contain',
                              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                              transition: isDragging ? 'none' : 'transform 0.1s'
                            }} 
                          />
                        </>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '2px dashed rgba(255,255,255,0.2)', padding: '4rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                        >
                          <ImageIcon size={64} opacity={0.6} color="#fff" />
                          <span style={{ fontSize: '1.2rem', letterSpacing: '0.5px', color: '#fff', fontWeight: '500' }}>Click to upload DICOM / Image</span>
                          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Supports PNG, JPG, and DCM files</span>
                        </div>
                      )}
                    </div>

                    {preview && (
                      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: '400px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <label className="text-xs text-muted block mb-1 uppercase tracking-wider">Modality</label>
                            <select className="input-field" value={modality} onChange={(e) => setModality(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                              <option value="MRI">MRI</option>
                              <option value="CT">CT</option>
                              <option value="X-Ray">X-Ray</option>
                              <option value="Ultrasound">Ultrasound</option>
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label className="text-xs text-muted block mb-1 uppercase tracking-wider">Region</label>
                            <select className="input-field" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                              <option value="Brain">Brain</option>
                              <option value="Lung">Lung</option>
                              <option value="Chest">Chest</option>
                              <option value="Breast">Breast</option>
                              <option value="Thyroid">Thyroid</option>
                            </select>
                          </div>
                        </div>
                        <button className="btn-primary" onClick={runDiagnostics} disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                          {loading ? 'Processing ML Inference...' : 'Run AI Analysis'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {selectedStudy.heatmapUrl ? (
                      <>
                        <div className="dicom-overlay" style={{ position: 'absolute', top: '10px', left: '10px', color: '#ffcc00', fontSize: '0.85rem', textShadow: '1px 1px 2px #000', pointerEvents: 'none', zIndex: 5, textAlign: 'left' }}>
                          <div>{selectedStudy.patient}</div>
                          <div>ID: {selectedStudy.id}</div>
                          <div>DOB: {(new Date().getFullYear() - parseInt(selectedStudy.age))}-01-01</div>
                        </div>
                        <div className="dicom-overlay" style={{ position: 'absolute', top: '10px', right: '10px', color: '#ffcc00', fontSize: '0.85rem', textShadow: '1px 1px 2px #000', pointerEvents: 'none', zIndex: 5, textAlign: 'right' }}>
                          <div>{sysDate}</div>
                          <div>{modality} {bodyPart}</div>
                        </div>
                        <div className="dicom-overlay" style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#ffcc00', fontSize: '0.85rem', textShadow: '1px 1px 2px #000', pointerEvents: 'none', zIndex: 5, textAlign: 'left' }}>
                          <div>AI Overlaid</div>
                        </div>
                        <div className="dicom-overlay" style={{ position: 'absolute', bottom: '10px', right: '10px', color: '#ffcc00', fontSize: '0.85rem', textShadow: '1px 1px 2px #000', pointerEvents: 'none', zIndex: 5, textAlign: 'right' }}>
                          <div>W: {Math.round(contrast * 2.5)} L: {Math.round(brightness * 1.5 - 50)}</div>
                        </div>

                        <img src={selectedStudy.heatmapUrl} alt="AI Heatmap" 
                          style={{ 
                            maxHeight: '100%', maxWidth: '100%', objectFit: 'contain',
                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                            transition: isDragging ? 'none' : 'transform 0.1s'
                          }} 
                        />
                      </>
                    ) : (
                      <div style={{ color: 'var(--text-muted)' }}>No Image Available</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="viewer-controls" style={{ 
                position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
                padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button title="Zoom Tool" onClick={() => setActiveTool('zoom')} className={`tool-btn ${activeTool === 'zoom' ? 'active' : ''}`}><Crosshair size={18} /></button>
                <button title="Zoom In" onClick={() => setZoom(prev => prev + 0.2)} className="tool-btn"><ZoomIn size={18} /></button>
                <button title="Zoom Out" onClick={() => setZoom(prev => Math.max(0.1, prev - 0.2))} className="tool-btn"><ZoomOut size={18} /></button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }}></div>
                <button title="Pan Tool" onClick={() => setActiveTool('pan')} className={`tool-btn ${activeTool === 'pan' ? 'active' : ''}`}><Move size={18} /></button>
                <button title="Window/Level" onClick={() => setActiveTool('windowLevel')} className={`tool-btn ${activeTool === 'windowLevel' ? 'active' : ''}`}><Sun size={18} /></button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.25rem 0' }}></div>
                <button title="Reset View" onClick={() => { setZoom(1); setPan({x:0, y:0}); setBrightness(100); setContrast(100); }} className="tool-btn"><RotateCcw size={18} /></button>
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
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-tertiary uppercase tracking-wide">Radiologist Findings</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 text-xs text-secondary hover:text-primary transition-colors bg-panel border border-subtle px-2 py-1 rounded">
                  <Mic size={14} /> Dictate
                </button>
                <button className="flex items-center gap-1 text-xs text-secondary hover:text-primary transition-colors bg-panel border border-subtle px-2 py-1 rounded" 
                  onClick={() => setSelectedStudy({...selectedStudy, clinicalHistory: `EXAM: ${modality} ${bodyPart}\n\nCLINICAL INDICATION: Evaluate for pathology.\n\nFINDINGS:\nThe study is largely unremarkable. No acute intracranial hemorrhage, mass effect, or midline shift.\n\nIMPRESSION:\n1. Normal ${modality} ${bodyPart}.`})}
                >
                  <FileSignature size={14} /> Normal Template
                </button>
              </div>
            </div>
            <textarea className="input-field" rows={3} placeholder="Enter / dictate clinical observations..." value={selectedStudy.clinicalHistory || ''} onChange={e => setSelectedStudy({...selectedStudy, clinicalHistory: e.target.value})}></textarea>
            <div className="flex justify-between items-center mt-2">
              <button className="btn-primary" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} onClick={() => setSelectedStudy(null)}>
                Discard
              </button>
              
              {selectedStudy.isNew ? (
                  <div className="flex gap-2">
                    {result && (
                      <button className="btn-primary" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} onClick={() => {
                        generatePDF({
                          id: `ST-${Math.floor(Math.random() * 90000) + 10000}`,
                          patientId: selectedStudy.patientId,
                          patientName: selectedStudy.patient,
                          age: selectedStudy.age,
                          modality: modality,
                          study: modality,
                          aiFinding: result.diseasesDetected?.[0]?.disease,
                          confidence: result.confidenceScore + '%',
                          heatmapUrl: result.heatmapOverlayUrl,
                          observations: selectedStudy.clinicalHistory || result.aiFindings,
                          date: sysDate,
                        });
                      }}>
                        <Download size={14} className="mr-2 inline" /> Download PDF Now
                      </button>
                    )}
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
                      await fetch('/api/v1/studies', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studyData)
                      });
                      fetchData();
                      setSelectedStudy(null);
                    }}>
                      {result ? 'Save Study & Finalize' : 'Run AI First to Save'}
                    </button>
                  </div>
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
            <button className={`nav-item ${activeSidebar === 'My Worklist' && activeFilter !== 'Priority' ? 'active' : ''}`} onClick={() => { setActiveSidebar('My Worklist'); setActiveFilter('All'); }}>
              <CheckCircle size={16} /> My Worklist
            </button>
            <button className={`nav-item ${activeSidebar === 'Priority' || (activeSidebar === 'My Worklist' && activeFilter === 'Priority') ? 'active' : ''}`} onClick={() => { setActiveSidebar('My Worklist'); setActiveFilter('Priority'); }}>
              <AlertTriangle size={16} /> Priority
            </button>
          </div>
          <div className="nav-section">
            <div className="nav-title">PATIENTS</div>
            <button className={`nav-item ${activeSidebar === 'Patient Directory' ? 'active' : ''}`} onClick={() => setActiveSidebar('Patient Directory')}>
              <Users size={16} /> Patient Directory
            </button>
            <button className={`nav-item ${activeSidebar === 'Patient History' ? 'active' : ''}`} onClick={() => setActiveSidebar('Patient History')}>
              <Clock size={16} /> Patient History
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
                    {studies.filter(s => {
                      if (activeFilter === 'All') return true;
                      if (activeFilter === 'Priority') return s.aiSeverity === 'HIGH' || s.aiSeverity === 'CRITICAL' || s.aiType === 'finding';
                      if (activeFilter === 'Unread') return s.aiType === 'processing';
                      return s.modality === activeFilter;
                    }).map(s => (
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
                      <div><label className="text-xs text-muted block mb-1">Date of Birth</label><input type="date" className="input-field" value={editingPatient.dob} onChange={e => {
                        const dob = e.target.value;
                        let age = editingPatient.age;
                        if (dob) {
                            const today = new Date();
                            const birthDate = new Date(dob);
                            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                calculatedAge--;
                            }
                            age = calculatedAge.toString();
                        }
                        setEditingPatient({...editingPatient, dob, age});
                      }} /></div>
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
                        if (editingPatient.phone && !/^\+\d{1,4}\s?\d{7,14}$/.test(editingPatient.phone.replace(/[-() ]/g, ''))) {
                          alert("Please enter a valid mobile number with country code (e.g., +1 555-1234)");
                          return;
                        }
                        if (editingPatient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingPatient.email)) {
                          alert("Please enter a valid email address");
                          return;
                        }
                        await fetch('/api/v1/patients', {
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
                                await fetch(`/api/v1/patients/${p.id}`, { method: 'DELETE' });
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

            {activeSidebar === 'Patient History' && (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <h1 style={{ fontSize: '1.25rem' }}>Patient History & Reports</h1>
                  <div className="flex gap-4">
                    <div className="search-bar" style={{ width: '250px' }}>
                      <Search size={16} color="var(--text-tertiary)" />
                      <input type="text" placeholder="Search by name or date..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                    </div>
                  </div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient Name</th>
                      <th>Study Modality</th>
                      <th>AI Finding</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...studies]
                      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                      .filter(s => ((s.patientName || '').toLowerCase().includes(patientSearch.toLowerCase()) || (s.date || '').includes(patientSearch)))
                      .map((s, i) => (
                        <tr key={s.id || i}>
                          <td>{s.date || 'N/A'}</td>
                          <td className="font-medium">{s.patientName || 'Unknown'}</td>
                          <td>{s.modality} {s.bodyPart}</td>
                          <td><span className={`ai-status ${s.aiType === 'clear' ? 'clear' : 'finding'}`}>{s.aiFindingTitle || s.aiLabel || 'N/A'}</span></td>
                          <td>Finalized</td>
                          <td>
                            <div className="flex gap-2">
                              <button className="action-link" onClick={() => {
                                setSelectedReport({
                                  id: s.id || `REP-${Math.floor(Math.random()*90000)+10000}`,
                                  isNew: false,
                                  patientId: s.patientId,
                                  patientName: s.patientName,
                                  gender: s.gender,
                                  age: s.age,
                                  study: s.modality,
                                  bodyPart: s.bodyPart,
                                  date: s.date,
                                  aiFinding: s.aiFindingTitle || s.aiLabel,
                                  confidence: s.aiConfidence,
                                  heatmapUrl: s.heatmapUrl,
                                  observations: s.aiExplanation,
                                  status: 'Finalized'
                                });
                                setActiveSidebar('XAI Reports');
                              }}>View</button>
                              <span className="text-muted">|</span>
                              <button className="action-link text-status-urgent" onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this study?')) {
                                  await fetch(`/api/v1/studies/${s.id}`, { method: 'DELETE' });
                                  fetchData();
                                }
                              }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    {studies.length === 0 && (
                      <tr><td colSpan="6" className="text-center text-muted p-4">No historical studies found.</td></tr>
                    )}
                  </tbody>
                </table>
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
                        <button className="btn-primary" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} onClick={async () => {
                           const originalStudy = studies.find(s => s.id === selectedReport.id) || {};
                           const updatedStudy = {
                              ...originalStudy,
                              id: selectedReport.id,
                              patientId: selectedReport.patientId,
                              patientName: selectedReport.patientName,
                              age: selectedReport.age,
                              gender: selectedReport.gender,
                              modality: selectedReport.study,
                              bodyPart: selectedReport.bodyPart,
                              aiExplanation: selectedReport.observations,
                              aiFindingTitle: selectedReport.aiFinding,
                              date: selectedReport.date || new Date().toLocaleDateString('en-GB'),
                              time: originalStudy.time || new Date().toLocaleTimeString(),
                              clinicalHistory: originalStudy.clinicalHistory || '',
                              aiType: originalStudy.aiType || 'completed',
                              aiLabel: originalStudy.aiLabel || '',
                              aiLocation: originalStudy.aiLocation || '',
                              aiConfidence: originalStudy.aiConfidence || '',
                              aiSeverity: originalStudy.aiSeverity || '',
                              heatmapUrl: selectedReport.heatmapUrl || ''
                           };
                           await fetch('/api/v1/studies', {
                              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedStudy)
                           });
                           fetchData();
                           setSelectedReport(null);
                        }}>Save Draft</button>
                        <button className="btn-primary flex items-center gap-2" onClick={() => generatePDF(null)}><Download size={14}/> Download PDF</button>
                        <button className="btn-primary" style={{ background: 'var(--accent-blue)', color: '#fff', fontWeight: 'bold' }} onClick={async () => {
                           const originalStudy = studies.find(s => s.id === selectedReport.id) || {};
                           const updatedStudy = {
                              ...originalStudy,
                              id: selectedReport.id,
                              patientId: selectedReport.patientId,
                              patientName: selectedReport.patientName,
                              age: selectedReport.age,
                              gender: selectedReport.gender,
                              modality: selectedReport.study,
                              bodyPart: selectedReport.bodyPart,
                              aiExplanation: selectedReport.observations,
                              aiFindingTitle: selectedReport.aiFinding,
                              date: selectedReport.date || new Date().toLocaleDateString('en-GB'),
                              time: originalStudy.time || new Date().toLocaleTimeString(),
                              clinicalHistory: originalStudy.clinicalHistory || '',
                              aiType: originalStudy.aiType || 'completed',
                              aiLabel: originalStudy.aiLabel || '',
                              aiLocation: originalStudy.aiLocation || '',
                              aiConfidence: originalStudy.aiConfidence || '',
                              aiSeverity: originalStudy.aiSeverity || '',
                              heatmapUrl: selectedReport.heatmapUrl || ''
                           };
                           await fetch('/api/v1/studies', {
                              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedStudy)
                           });
                           fetchData();
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
                      
                      {/* Additional Patient Details for Radiologists */}
                      {!selectedReport.isNew && (
                        <>
                          <div className="mt-4 pt-4 border-t border-subtle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.5rem', width: '100%' }}>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Phone</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={patients.find(p => p.id === selectedReport.patientId)?.phone || 'N/A'} readOnly />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Email</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={patients.find(p => p.id === selectedReport.patientId)?.email || 'N/A'} readOnly />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Referring Doctor</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={patients.find(p => p.id === selectedReport.patientId)?.doctor || 'N/A'} readOnly />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Address</div>
                              <input className="input-field w-full" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.25rem' }} value={patients.find(p => p.id === selectedReport.patientId)?.address || 'N/A'} readOnly />
                            </div>
                          </div>
                          
                          <div className="mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', width: '100%' }}>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Medical History</div>
                              <textarea className="input-field w-full text-sm" rows={2} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.5rem', resize: 'vertical' }} value={patients.find(p => p.id === selectedReport.patientId)?.history || 'N/A'} readOnly />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Allergies</div>
                              <textarea className="input-field w-full text-sm" rows={2} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.5rem', resize: 'vertical' }} value={patients.find(p => p.id === selectedReport.patientId)?.allergies || 'N/A'} readOnly />
                            </div>
                            <div>
                              <div className="text-xs text-muted uppercase mb-1">Clinical Notes</div>
                              <textarea className="input-field w-full text-sm" rows={2} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.5rem', resize: 'vertical' }} value={patients.find(p => p.id === selectedReport.patientId)?.notes || 'N/A'} readOnly />
                            </div>
                          </div>
                        </>
                      )}
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
                      <button className="btn-primary" onClick={() => setSelectedReport({ isNew: true, id: `REP-${Math.floor(Math.random()*9000)+1000}`, patientId: '', patientName: '', study: '', modality: '', date: sysDate, status: 'Draft', aiFinding: '', confidence: '', observations: '', findings: '', impression: '', recommendations: '' })}>
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
                        {studies.map((s, i) => (
                          <tr key={s.id || i}>
                            <td className="mono">{s.id || `REP-${i}`}</td>
                            <td className="font-medium">{s.patientName}</td>
                            <td>{s.modality}</td>
                            <td><span className={`ai-status ${s.aiType === 'clear' ? 'clear' : 'finding'}`}>{s.aiFindingTitle || s.aiLabel}</span></td>
                            <td className="text-status-positive font-medium">Finalized</td>
                            <td>{s.date}</td>
                            <td>
                              <div className="flex gap-2">
                                <button className="action-link" onClick={() => setSelectedReport({
                                  id: s.id || `REP-${Math.floor(Math.random()*90000)+10000}`,
                                  isNew: false,
                                  patientId: s.patientId,
                                  patientName: s.patientName,
                                  gender: s.gender,
                                  age: s.age,
                                  study: s.modality,
                                  bodyPart: s.bodyPart,
                                  date: s.date,
                                  aiFinding: s.aiFindingTitle || s.aiLabel,
                                  confidence: s.aiConfidence,
                                  heatmapUrl: s.heatmapUrl,
                                  observations: s.aiExplanation,
                                  status: 'Finalized'
                                })}>View</button>
                                <span className="text-muted">|</span>
                                <button className="action-link text-status-urgent" onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this report?')) {
                                    await fetch(`/api/v1/studies/${s.id}`, { method: 'DELETE' });
                                    fetchData();
                                  }
                                }}>Delete</button>
                              </div>
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
              <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
                <div className="mb-6"><h1 style={{ fontSize: '1.25rem' }}>Settings & Preferences</h1></div>
                
                <div className="bg-panel rounded border border-subtle p-6 mb-6">
                  <h3 className="text-base mb-4 border-b border-subtle pb-2 flex items-center gap-2">
                    <Users size={16} className="text-primary"/> Professional Profile
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div><label className="text-xs text-muted block mb-1">Full Name</label><input className="input-field" defaultValue="Dr. Smith" /></div>
                    <div><label className="text-xs text-muted block mb-1">Professional ID / License</label><input className="input-field" defaultValue="RAD-1042" /></div>
                    <div><label className="text-xs text-muted block mb-1">Email Address</label><input className="input-field" defaultValue="dr.smith@medvision.ai" /></div>
                    <div><label className="text-xs text-muted block mb-1">Institution</label><input className="input-field" defaultValue="Central General Hospital" /></div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="btn-primary"><CheckCircle size={16}/> Save Profile</button>
                  </div>
                </div>

                <div className="bg-panel rounded border border-subtle p-6 mb-6">
                  <h3 className="text-base mb-4 border-b border-subtle pb-2 flex items-center gap-2">
                    <Activity size={16} className="text-primary"/> AI Diagnostics Configuration
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div className="font-medium text-primary">Auto-run AI Inference</div>
                        <div className="text-xs text-muted">Automatically process incoming studies using default AI models</div>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }} />
                    </div>
                    <div className="flex justify-between items-center p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div className="font-medium text-primary">Critical Priority Alerts</div>
                        <div className="text-xs text-muted">Send desktop notification for HIGH severity findings</div>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }} />
                    </div>
                    <div className="flex justify-between items-center p-3 rounded" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div className="font-medium text-primary">Enable Saliency Heatmaps</div>
                        <div className="text-xs text-muted">Generate grad-CAM heatmaps for vision model interpretations</div>
                      </div>
                      <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--accent-blue)' }} />
                    </div>
                  </div>
                </div>

                <div className="bg-panel rounded border border-subtle p-6 mb-8">
                  <h3 className="text-base mb-4 border-b border-subtle pb-2 flex items-center gap-2">
                    System & Appearance
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label className="text-xs text-muted block mb-1">Theme Preference</label>
                      <select className="input-field">
                        <option>Premium Glassmorphism (Dark)</option>
                        <option>Clinical Contrast (Light)</option>
                        <option>System Default</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Display Density</label>
                      <select className="input-field">
                        <option>Comfortable</option>
                        <option>Compact</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-subtle flex gap-4">
                     <button className="btn-primary" onClick={() => setShowExportModal(true)} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}><FileText size={16}/> Export Database</button>
                     <button className="btn-primary" style={{ background: 'var(--status-urgent-subtle)', border: '1px solid var(--status-urgent)', color: 'var(--status-urgent)' }}><X size={16}/> Clear Cache</button>
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

      {/* FLOATING AI ASSISTANT WIDGET */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
        {showAssistant ? (
          <div className="bg-panel" style={{ width: '350px', height: '500px', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(253,224,71,0.05) 0%, rgba(217,119,6,0.15) 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 0 10px rgba(253,224,71,0.5)' }}>
                  <Activity size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#fde047' }}>MedVision Copilot</h3>
              </div>
              <button onClick={() => {
                setShowAssistant(false);
                setChatHistory([{ role: 'ai', text: 'Hello Dr. Smith. I am MedVision Copilot. How can I assist you with your clinical workflow today?' }]);
              }} style={{ color: 'var(--text-secondary)' }}><X size={16}/></button>
            </div>
            
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '12px', 
                    background: msg.role === 'user' ? 'rgba(255,255,255,0.05)' : 'rgba(253,224,71,0.1)',
                    border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(253,224,71,0.2)',
                    color: msg.role === 'user' ? 'var(--text-primary)' : '#fef08a',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
              <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  className="input-field" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Ask Copilot anything..." 
                  style={{ borderRadius: '20px', padding: '0.5rem 1rem' }} 
                />
                <button type="submit" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronRight size={18} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowAssistant(true)}
            style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(217,119,6,0.4)', cursor: 'pointer', border: 'none', transition: 'all 0.2s ease' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Activity size={28} />
          </button>
        )}
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

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="bg-panel" style={{ width: '500px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-lg font-bold">Export Patient Database</h2>
              <button onClick={() => setShowExportModal(false)} className="text-muted"><X size={20}/></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-xs text-muted block mb-1">Export Format</label>
                <select className="input-field" value={exportConfig.format} onChange={e => setExportConfig({...exportConfig, format: e.target.value})}>
                  <option value="CSV">CSV</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Date Range</label>
                <select className="input-field" value={exportConfig.dateRange} onChange={e => setExportConfig({...exportConfig, dateRange: e.target.value})}>
                  <option>All Time</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Radiologist</label>
                <select className="input-field" value={exportConfig.radiologist} onChange={e => setExportConfig({...exportConfig, radiologist: e.target.value})}>
                  <option>All</option>
                  <option>Dr. Smith (Current)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Disease / AI Identification</label>
                <select className="input-field" value={exportConfig.disease} onChange={e => setExportConfig({...exportConfig, disease: e.target.value})}>
                  <option>All</option>
                  <option>Tumor</option>
                  <option>Glioma</option>
                  <option>Pneumonia</option>
                  <option>Normal</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
              <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }} onClick={() => setShowExportModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleExport}><Download size={16}/> Generate Export</button>
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
