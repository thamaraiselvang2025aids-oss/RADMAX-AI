import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Activity, Search, Bell, Plus, ChevronRight, X, User,
  CheckCircle, AlertTriangle, Users, FileText, Settings, Download,
  ZoomIn, ZoomOut, Move, Sun, Moon, RotateCcw, Crosshair, Image as ImageIcon,
  Mic, FileSignature, Layers, Clock, Cpu, Palette, Database, Sliders, ShieldCheck, Check, Sparkles,
  UserPlus, Phone, Mail, MapPin, Stethoscope, ArrowLeft, CheckCircle2, ShieldAlert, Calendar, Save, Hash,
  UploadCloud, FolderOpen, Eye
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import './index.css';

// --- INJECT BYPASS TUNNEL HEADER ---
const originalFetch = window.fetch;
window.fetch = async function () {
  let [resource, config] = arguments;
  if (config === undefined) config = {};
  if (config.headers === undefined) config.headers = {};
  
  // Convert Headers object to normal object if necessary, or just set it
  if (config.headers instanceof Headers) {
    config.headers.append('Bypass-Tunnel-Reminder', 'true');
  } else {
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
  }
  
  return await originalFetch(resource, config);
};

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

  // White / Dark Theme State
  const [isWhiteTheme, setIsWhiteTheme] = useState(() => {
    return localStorage.getItem('medvision_theme') === 'light';
  });

  useEffect(() => {
    if (isWhiteTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('medvision_theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('medvision_theme', 'dark');
    }
  }, [isWhiteTheme]);

  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [studyPatientSearch, setStudyPatientSearch] = useState('');
  const [showQuickPatientForm, setShowQuickPatientForm] = useState(false);
  const [quickPatient, setQuickPatient] = useState({ name: '', age: '30', gender: 'Male', phone: '', doctor: 'Dr. Smith' });
  const [toastMessage, setToastMessage] = useState('');

  // Settings State
  const [settingsActiveTab, setSettingsActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: 'Dr. Smith, M.D.',
    license: 'RAD-1042-MD',
    email: 'dr.smith@medvision.ai',
    institution: 'Central General Hospital',
    department: 'Radiology & Nuclear Medicine',
    specialty: 'Diagnostic Neuroradiology',
    phone: '+1 (555) 234-5678'
  });
  const [aiConfig, setAiConfig] = useState({
    autoInference: true,
    criticalAlerts: true,
    gradcamHeatmaps: true,
    tabularAssistance: true,
    confidenceThreshold: 85
  });
  const [profileToast, setProfileToast] = useState('');

  const saveQuickPatient = async () => {
    if (!quickPatient.name.trim()) {
      alert("Please enter patient name");
      return;
    }
    const newPt = {
      id: `PT-${Math.floor(Math.random() * 90000) + 10000}`,
      name: quickPatient.name.trim(),
      dob: '',
      age: quickPatient.age || '30',
      gender: quickPatient.gender || 'Male',
      phone: quickPatient.phone || '',
      email: '',
      address: '',
      history: '',
      allergies: '',
      doctor: quickPatient.doctor || 'Dr. Smith',
      notes: '',
      studies: 0,
      lastStudy: 'N/A',
      status: 'New'
    };
    await fetch('/api/v1/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPt)
    });
    await fetchData();
    setSelectedStudy(prev => ({
      ...prev,
      patientId: newPt.id,
      patient: newPt.name,
      age: newPt.age,
      gender: newPt.gender,
      phone: newPt.phone,
      doctor: newPt.doctor
    }));
    setShowQuickPatientForm(false);
    setQuickPatient({ name: '', age: '30', gender: 'Male', phone: '', doctor: 'Dr. Smith' });
    setToastMessage(`Patient ${newPt.name} (${newPt.id}) registered & selected!`);
    setTimeout(() => setToastMessage(''), 4000);
  };
  
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
  const [result, setResult] = useState(null);
  const [modality, setModality] = useState('MRI');
  const [bodyPart, setBodyPart] = useState('Brain');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleBodyPartChange = (val) => {
    setBodyPart(val);
    if (val === 'Thyroid' || val === 'Breast' || val === 'Pregnancy') {
      setModality('Ultrasound');
    } else if (val === 'Chest') {
      setModality('X-Ray');
    } else if (val === 'Stroke' || val === 'Lung') {
      setModality('CT');
    } else if (val === 'Brain') {
      setModality('MRI');
    }
  };
  
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

    let targetModality = modality;
    if (bodyPart === 'Thyroid' || bodyPart === 'Pregnancy' || bodyPart === 'Breast') {
      targetModality = 'Ultrasound';
      setModality('Ultrasound');
    } else if (bodyPart === 'Stroke' || bodyPart === 'Lung') {
      targetModality = 'CT';
      setModality('CT');
    } else if (bodyPart === 'Brain') {
      targetModality = 'MRI';
      setModality('MRI');
    } else if (bodyPart === 'Chest') {
      targetModality = 'X-Ray';
      setModality('X-Ray');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('modality', targetModality);
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
        {/* TOP BAR */}
        <div className="ws-topbar">
          <div className="flex items-center gap-3">
            <button 
              className="btn-secondary text-xs" 
              onClick={() => { setSelectedStudy(null); setFile(null); setPreview(null); setResult(null); }}
            >
              <ArrowLeft size={15} /> Exit Workstation
            </button>
            <div className="ws-brand-group">
              <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em' }} className="mono">
                MEDVISION PACS STUDIO
              </span>
              <span className="ws-live-pill">
                <span className="ws-live-pulse-dot"></span> LIVE DIAGNOSTIC WORKSTATION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="ws-subject-pill">
              {selectedStudy.patient ? (
                <>
                  <div className="ws-patient-avatar" style={{ width: 26, height: 26, fontSize: '0.75rem' }}>
                    {selectedStudy.patient.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm">{selectedStudy.patient}</span>
                  <span className="mono text-xs text-muted">({selectedStudy.patientId || selectedStudy.id})</span>
                  <span className="text-muted">·</span>
                  <span className="text-xs text-muted">{selectedStudy.age}y / {selectedStudy.gender}</span>
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#f59e0b' }}>
                  <AlertTriangle size={13} /> Select Patient Required
                </span>
              )}
              <span className="ws-protocol-badge">
                {modality} · {bodyPart}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="theme-toggle-btn"
              onClick={() => setIsWhiteTheme(!isWhiteTheme)}
              title={isWhiteTheme ? "Switch to Dark Theme" : "Switch to White Theme"}
            >
              {isWhiteTheme ? <Moon size={14} /> : <Sun size={14} color="#fde047" />}
              <span>{isWhiteTheme ? "Dark Mode" : "Light Mode"}</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <Sparkles size={14} color="#3b82f6" />
              <span className="text-xs font-semibold mono" style={{ color: '#3b82f6' }}>
                AI ENGINE: {result ? 'DIAGNOSIS ACTIVE' : (loading ? 'INFERENCE...' : 'ARMED')}
              </span>
            </div>
          </div>
        </div>

        <div className="ws-main">
          <div className="ws-grid">
            {/* LEFT COLUMN - INTAKE & PROTOCOLS */}
            <div className="ws-col-left">
              {selectedStudy.isNew ? (
                <>
                  {/* CARD 1: PATIENT INTAKE */}
                  <div className="ws-card">
                    <div className="ws-card-header">
                      <span className="ws-card-title">
                        <UserPlus size={15} /> Patient Intake
                      </span>
                      <button 
                        type="button" 
                        className="text-xs font-semibold text-primary hover:text-emerald-400 cursor-pointer"
                        onClick={() => setShowQuickPatientForm(!showQuickPatientForm)}
                      >
                        {showQuickPatientForm ? '← Select Existing' : '+ New Patient'}
                      </button>
                    </div>

                    {showQuickPatientForm ? (
                      <div className="bg-app p-3 rounded-lg border border-emerald-500/30 text-sm">
                        <div className="text-xs text-emerald-400 font-semibold mb-2 uppercase">Quick Register Patient</div>
                        <div className="mb-2">
                          <label className="text-xs text-muted block mb-1">Full Name *</label>
                          <input 
                            className="input-field text-xs" 
                            placeholder="e.g. John Doe" 
                            value={quickPatient.name} 
                            onChange={e => setQuickPatient({...quickPatient, name: e.target.value})} 
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div>
                            <label className="text-xs text-muted block mb-1">Age</label>
                            <input 
                              className="input-field text-xs" 
                              placeholder="30" 
                              value={quickPatient.age} 
                              onChange={e => setQuickPatient({...quickPatient, age: e.target.value})} 
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted block mb-1">Gender</label>
                            <select 
                              className="input-field text-xs" 
                              value={quickPatient.gender} 
                              onChange={e => setQuickPatient({...quickPatient, gender: e.target.value})}
                            >
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-xs text-muted block mb-1">Phone</label>
                          <input 
                            className="input-field text-xs" 
                            placeholder="+91 9876543210" 
                            value={quickPatient.phone} 
                            onChange={e => setQuickPatient({...quickPatient, phone: e.target.value})} 
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="btn-primary text-xs w-full" onClick={saveQuickPatient}>
                            Save & Select
                          </button>
                          <button type="button" className="btn-secondary text-xs" onClick={() => setShowQuickPatientForm(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Search Input */}
                        <div className="relative mb-2">
                          <div className="relative flex items-center">
                            <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: '#60a5fa' }} />
                            <input 
                              type="text"
                              className="input-field text-xs pl-8 pr-7"
                              placeholder="Search patient name, MRN, phone..."
                              value={studyPatientSearch}
                              onChange={(e) => setStudyPatientSearch(e.target.value)}
                              style={{
                                paddingLeft: '2.1rem',
                                paddingRight: '1.75rem',
                                borderRadius: '6px'
                              }}
                            />
                            {studyPatientSearch && (
                              <button 
                                type="button" 
                                onClick={() => setStudyPatientSearch('')} 
                                className="absolute right-2 text-muted hover:text-white"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Dropdown */}
                        <select 
                          className="input-field font-medium text-xs mb-2"
                          value={selectedStudy.patientId || ''} 
                          onChange={(e) => {
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
                          }}
                        >
                          <option value="">-- Select Patient ({patients.length} in EHR) --</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.id} — {p.name} ({p.gender}, {p.age}y)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Patient Profile Details Card */}
                    {selectedStudy.patientId && (
                      <div className="ws-patient-profile">
                        <div className="ws-patient-header-row">
                          <div className="ws-patient-avatar">
                            {selectedStudy.patient ? selectedStudy.patient.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : <User size={18} />}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-primary">{selectedStudy.patient}</div>
                            <div className="text-xs text-muted mono">{selectedStudy.patientId} · {selectedStudy.gender}, {selectedStudy.age} yrs</div>
                          </div>
                        </div>

                        <div className="ws-metadata-grid">
                          <div className="ws-meta-item">
                            <span className="ws-meta-label">Accession #</span>
                            <span className="ws-meta-val mono">ACC-{selectedStudy.patientId.replace(/\D/g,'') || '7829'}</span>
                          </div>
                          <div className="ws-meta-item">
                            <span className="ws-meta-label">Ref. Doctor</span>
                            <span className="ws-meta-val">{selectedStudy.doctor || 'Dr. Smith'}</span>
                          </div>
                        </div>

                        <div className="ws-clinical-tags-row">
                          <span className={`ws-tag-pill ${selectedStudy.allergies && selectedStudy.allergies !== 'None' ? 'allergy' : 'doctor'}`}>
                            Allergies: {selectedStudy.allergies || 'None Reported'}
                          </span>
                          <span className="ws-tag-pill history">
                            Hx: {selectedStudy.history || 'Routine Assessment'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARD 2: PROTOCOL & MODALITY SELECTION */}
                  <div className="ws-card">
                    <div className="ws-card-header">
                      <span className="ws-card-title">
                        <Sliders size={15} /> Imaging Modality & Protocol
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <div>
                        <label className="text-xs text-muted block mb-1 font-medium">
                          Diagnostic Modality
                        </label>
                        <select 
                          className="input-field text-xs font-semibold cursor-pointer"
                          value={modality}
                          onChange={(e) => {
                            const newMod = e.target.value;
                            setModality(newMod);
                            if (newMod === 'MRI') setBodyPart('Brain');
                            else if (newMod === 'CT') setBodyPart('Lung');
                            else if (newMod === 'Ultrasound') setBodyPart('Breast');
                            else if (newMod === 'X-Ray') setBodyPart('Chest');
                          }}
                        >
                          <option value="MRI">🧲 MRI — Magnetic Resonance Imaging</option>
                          <option value="CT">⚡ CT — Computed Tomography</option>
                          <option value="Ultrasound">🩺 Ultrasound — Diagnostic Sonography</option>
                          <option value="X-Ray">🩻 X-Ray — Digital Radiography</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-muted block mb-1 font-medium">
                          Clinical Protocol / Organ
                        </label>
                        <select 
                          className="input-field text-xs font-semibold cursor-pointer"
                          value={bodyPart}
                          onChange={(e) => {
                            const newPart = e.target.value;
                            setBodyPart(newPart);
                            if (newPart === 'Brain') setModality('MRI');
                            else if (newPart === 'Stroke' || newPart === 'Lung') setModality('CT');
                            else if (newPart === 'Breast' || newPart === 'Thyroid' || newPart === 'Pregnancy') setModality('Ultrasound');
                            else if (newPart === 'Chest') setModality('X-Ray');
                          }}
                        >
                          {modality === 'MRI' && (
                            <optgroup label="MRI Protocols">
                              <option value="Brain">🧠 Brain — Tumor Detection (Glioma / Meningioma)</option>
                            </optgroup>
                          )}
                          {modality === 'CT' && (
                            <optgroup label="CT Protocols">
                              <option value="Lung">🫁 Lung CT — Pneumonia & Infiltration</option>
                              <option value="Stroke">⚡ Brain CT — Acute Stroke & Hemorrhage</option>
                            </optgroup>
                          )}
                          {modality === 'Ultrasound' && (
                            <optgroup label="Ultrasound Protocols">
                              <option value="Breast">🩺 Breast Ultrasound — Lesion & Nodule Screen</option>
                              <option value="Thyroid">🔬 Thyroid Ultrasound — TI-RADS Classification</option>
                              <option value="Pregnancy">👶 Fetal Ultrasound — Obstetric State Analysis</option>
                            </optgroup>
                          )}
                          {modality === 'X-Ray' && (
                            <optgroup label="Radiography Protocols">
                              <option value="Chest">🩻 Chest X-Ray — Pulmonary Pathology Screen</option>
                            </optgroup>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-app border border-subtle text-xs mono flex items-center justify-between mt-0.5">
                      <span className="text-muted flex items-center gap-1.5">
                        <Cpu size={13} color="#3b82f6" /> Neural Network: {modality === 'CT' && bodyPart === 'Lung' ? 'DenseNet121' : 'ResNet18'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold" style={{ color: '#10b981' }}>
                        <span className="ws-live-pulse-dot" style={{ width: 6, height: 6 }}></span> Active
                      </span>
                    </div>
                  </div>

                  {/* CARD 3: CLINICAL INDICATION */}
                  <div className="ws-card">
                    <div className="ws-card-header">
                      <span className="ws-card-title">
                        <FileText size={15} /> Clinical Indication
                      </span>
                    </div>

                    <div className="quick-chips-row mb-2">
                      {['Trauma / Fall', 'Severe Headache', 'Dyspnea / Cough', 'Palpable Nodule', 'Routine Checkup'].map(chip => (
                        <button 
                          key={chip} 
                          type="button" 
                          className="quick-chip-btn"
                          onClick={() => {
                            const cur = selectedStudy.clinicalHistory || '';
                            setSelectedStudy({ ...selectedStudy, clinicalHistory: cur ? `${cur}, ${chip}` : chip });
                          }}
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>

                    <textarea 
                      className="input-field text-xs" 
                      rows={2} 
                      placeholder="Enter specific clinical reason or symptoms for this exam..."
                      value={selectedStudy.clinicalHistory || ''}
                      onChange={e => setSelectedStudy({ ...selectedStudy, clinicalHistory: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                /* EXISTING STUDY VIEW */
                <div className="ws-card">
                  <div className="ws-card-header">
                    <span className="ws-card-title"><User size={15} /> Patient Dossier</span>
                    <span className="mono text-xs text-muted">{selectedStudy.id}</span>
                  </div>
                  <div className="ws-patient-profile">
                    <div className="ws-patient-header-row">
                      <div className="ws-patient-avatar">
                        {selectedStudy.patient ? selectedStudy.patient.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : <User size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-primary">{selectedStudy.patient}</div>
                        <div className="text-xs text-muted mono">{selectedStudy.age}y · {selectedStudy.gender}</div>
                      </div>
                    </div>
                    <div className="ws-metadata-grid">
                      <div className="ws-meta-item"><span className="ws-meta-label">Modality</span><span className="ws-meta-val">{selectedStudy.modality || modality}</span></div>
                      <div className="ws-meta-item"><span className="ws-meta-label">Region</span><span className="ws-meta-val">{selectedStudy.bodyPart || bodyPart}</span></div>
                      <div className="ws-meta-item"><span className="ws-meta-label">Scan Date</span><span className="ws-meta-val">{selectedStudy.date || sysDate}</span></div>
                      <div className="ws-meta-item"><span className="ws-meta-label">Status</span><span className="ws-meta-val" style={{ color: '#10b981' }}>Verified</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MIDDLE COLUMN - PACS VIEWPORT CANVAS */}
            <div className="ws-col-mid pacs-medical-canvas">
              {/* Corner Brackets */}
              <div className="pacs-corner tl"></div>
              <div className="pacs-corner tr"></div>
              <div className="pacs-corner bl"></div>
              <div className="pacs-corner br"></div>

              {/* Anatomical Axis Markers */}
              <div className="pacs-axis-marker top">A</div>
              <div className="pacs-axis-marker bottom">P</div>
              <div className="pacs-axis-marker left">R</div>
              <div className="pacs-axis-marker right">L</div>

              {/* HUD Overlays */}
              <div className="pacs-hud tl">
                <div>{selectedStudy.patient || 'UNASSIGNED PATIENT'}</div>
                <div>ID: {selectedStudy.patientId || selectedStudy.id || 'N/A'}</div>
                <div>DOB: {selectedStudy.age ? `${new Date().getFullYear() - parseInt(selectedStudy.age)}-01-01 (${selectedStudy.age}y/${selectedStudy.gender || 'U'})` : 'N/A'}</div>
              </div>
              <div className="pacs-hud tr">
                <div>ST. JUDE RADIOLOGY</div>
                <div>{sysDate}</div>
                <div>{modality} {bodyPart.toUpperCase()}</div>
                <div>ACC: {selectedStudy.patientId ? selectedStudy.patientId.replace(/\D/g,'') || '7829' : '849204'}</div>
              </div>
              <div className="pacs-hud bl">
                <div>Series: 1/1  Img: 1/1</div>
                <div>Zoom: {Math.round(zoom * 100)}%</div>
                <div>Matrix: 512 × 512</div>
              </div>
              <div className="pacs-hud br">
                <div>W: {Math.round(contrast * 2.5)}  L: {Math.round(brightness * 1.5 - 50)}</div>
                <div>Thk: 3.0 mm</div>
                <div>Kernel: Standard Soft</div>
              </div>

              {/* Floating PACS Tool Dock */}
              <div className="pacs-floating-dock">
                <button title="Pan Tool" onClick={() => setActiveTool('pan')} className={`tool-btn ${activeTool === 'pan' ? 'active' : ''}`}><Move size={17} /></button>
                <button title="Window/Level Contrast" onClick={() => setActiveTool('windowLevel')} className={`tool-btn ${activeTool === 'windowLevel' ? 'active' : ''}`}><Sun size={17} /></button>
                <button title="Zoom Tool" onClick={() => setActiveTool('zoom')} className={`tool-btn ${activeTool === 'zoom' ? 'active' : ''}`}><Crosshair size={17} /></button>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', margin: '0.2rem 0' }}></div>
                <button title="Zoom In" onClick={() => setZoom(prev => Math.min(prev + 0.25, 3.5))} className="tool-btn"><ZoomIn size={17} /></button>
                <button title="Zoom Out" onClick={() => setZoom(prev => Math.max(0.2, prev - 0.25))} className="tool-btn"><ZoomOut size={17} /></button>
                <button title="Reset PACS View" onClick={() => { setZoom(1); setPan({x:0, y:0}); setBrightness(100); setContrast(100); }} className="tool-btn"><RotateCcw size={17} /></button>
              </div>

              {/* Interactive Ingestion or Active Scan Viewport */}
              <div 
                style={{ 
                  flex: 1, width: '100%', height: '100%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  overflow: 'hidden', position: 'relative',
                  cursor: activeTool === 'pan' ? (isDragging ? 'grabbing' : 'grab') : (activeTool === 'windowLevel' ? 'col-resize' : 'crosshair')
                }}
                onMouseDown={handleViewerMouseDown}
                onMouseMove={handleViewerMouseMove}
                onMouseUp={handleViewerMouseUpOrLeave}
                onMouseLeave={handleViewerMouseUpOrLeave}
              >
                {selectedStudy.isNew ? (
                  <>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,.dcm" />
                    {preview ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={preview} 
                          alt="Medical scan preview"
                          style={{ 
                            maxHeight: '440px', maxWidth: '85%', objectFit: 'contain',
                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                            filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                            transition: isDragging ? 'none' : 'transform 0.1s'
                          }} 
                        />
                        
                        {/* Action Dock beneath image */}
                        <div className="pacs-action-dock">
                          <div className="flex items-center justify-between text-xs text-muted">
                            <span className="mono">Input: {modality} · {bodyPart}</span>
                            <span style={{ color: '#10b981' }}>Ready for Inference</span>
                          </div>
                          <button 
                            className="btn-primary" 
                            onClick={runDiagnostics} 
                            disabled={loading}
                            style={{ 
                              padding: '0.85rem', fontWeight: 700, 
                              fontSize: '0.92rem', letterSpacing: '0.04em',
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                              boxShadow: '0 4px 18px rgba(37, 99, 235, 0.5)'
                            }}
                          >
                            {loading ? (
                              <span className="flex items-center gap-2">
                                <Activity className="spin" size={17} /> Running Deep Learning Diagnostics...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Sparkles size={17} /> Execute AI Diagnostics & Grad-CAM
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Clean, Elegant Medical Scan Upload Bay */
                      <div className="pacs-dropbay" onClick={() => fileInputRef.current.click()}>
                        <div className="pacs-dropbay-icon">
                          <UploadCloud size={36} color="#3b82f6" />
                        </div>
                        <div className="text-center">
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
                            Upload DICOM / Patient Imaging Scan
                          </div>
                          <p className="text-xs text-muted" style={{ maxWidth: '360px', margin: '0 auto 1.25rem auto', lineHeight: 1.55 }}>
                            Click to browse or drag and drop scan file. Supports DICOM (.dcm), PNG, JPG, and JPEG.
                          </p>
                          <button type="button" className="btn-primary" style={{ pointerEvents: 'none', margin: '0 auto' }}>
                            <FolderOpen size={15} /> Select File from Computer
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Viewing Existing Study */
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedStudy.heatmapUrl ? (
                      <img 
                        src={selectedStudy.heatmapUrl} 
                        alt="AI Heatmap" 
                        style={{ 
                          maxHeight: '440px', maxWidth: '85%', objectFit: 'contain',
                          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                          transition: isDragging ? 'none' : 'transform 0.1s'
                        }} 
                      />
                    ) : (
                      <div className="text-muted text-sm mono">No Scan Slice Available in Storage</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - AI DIAGNOSTIC SUITE */}
            <div className="ws-col-right">
              <div className="ws-card">
                <div className="ws-card-header">
                  <span className="ws-card-title">
                    <Sparkles size={15} /> AI Diagnostics & XAI
                  </span>
                  <span className={`ai-status ${result ? (result.emergencyPriority === 'HIGH' ? 'finding' : 'clear') : 'processing'}`}>
                    {result ? (result.emergencyPriority === 'HIGH' ? 'CRITICAL' : 'VERIFIED') : 'STANDBY'}
                  </span>
                </div>

                {/* Pre-Inference Mode */}
                {!result && !loading && (
                  <>
                    <div className="ai-spec-box">
                      <div className="ai-spec-row">
                        <span className="label">Target Neural Network</span>
                        <span className="val mono">{modality === 'CT' && bodyPart === 'Lung' ? 'DenseNet121' : 'ResNet18'}</span>
                      </div>
                      <div className="ai-spec-row">
                        <span className="label">Input Tensor</span>
                        <span className="val mono">224 × 224 RGB</span>
                      </div>
                      <div className="ai-spec-row">
                        <span className="label">Benchmark AUC</span>
                        <span className="val mono" style={{ color: '#10b981' }}>0.94 - 0.98</span>
                      </div>
                      <div className="ai-spec-row">
                        <span className="label">XAI Explainability</span>
                        <span className="val mono" style={{ color: '#60a5fa' }}>Grad-CAM Armed</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted">
                      <div className="font-bold uppercase tracking-wider text-tertiary mb-1.5">Monitored Pathologies:</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="ws-tag-pill history">Neoplastic Masses</span>
                        <span className="ws-tag-pill allergy">Consolidation</span>
                        <span className="ws-tag-pill doctor">Structural Anomalies</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-subtle bg-app text-xs text-muted" style={{ lineHeight: 1.5 }}>
                      Upload a patient DICOM or scan image to execute deep learning neural inference and generate Grad-CAM saliency mapping.
                    </div>
                  </>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-8">
                    <Activity className="spin mx-auto mb-3" size={32} color="#3b82f6" />
                    <div className="font-bold text-sm text-primary mb-1">Executing Neural Inference...</div>
                    <p className="text-xs text-muted mono">Extracting convolutional gradients & Grad-CAM...</p>
                  </div>
                )}

                {/* Post-Inference Results */}
                {result && (
                  <div className="ai-results-stack">
                    <div className={`ai-finding-hero ${result.emergencyPriority === 'HIGH' || result.emergencyPriority === 'CRITICAL' ? 'critical' : 'normal'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: result.emergencyPriority === 'HIGH' ? '#ef4444' : '#10b981' }}>
                          {result.emergencyPriority === 'HIGH' ? '🚨 HIGH PRIORITY / TRIAGE' : '✅ NORMAL / CLEAR FINDING'}
                        </span>
                        <span className="mono text-xs font-bold">{result.confidenceScore}%</span>
                      </div>

                      <div className="font-bold text-base text-primary">
                        {result.diseasesDetected?.[0]?.disease || 'Standard Finding'}
                      </div>

                      <div className="confidence-gauge-wrapper">
                        <div className="confidence-bar-bg">
                          <div className="confidence-bar-fill" style={{ width: `${result.confidenceScore}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Heatmap Thumbnail */}
                    {result.heatmapOverlayUrl && (
                      <div className="ai-heatmap-section">
                        <div className="text-xs text-muted uppercase font-semibold mb-1 flex items-center gap-1.5">
                          <Eye size={13} color="#60a5fa" /> Grad-CAM Activation Heatmap
                        </div>
                        <div className="ai-heatmap-thumb-card">
                          <img src={result.heatmapOverlayUrl} alt="Grad-CAM Saliency Overlay" />
                        </div>
                      </div>
                    )}

                    {/* AI Explanation Box */}
                    <div className="ai-explanation-box">
                      <div className="font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-1.5" style={{ fontSize: '0.72rem' }}>
                        <CheckCircle size={13} color="#10b981" /> Clinical Rule Engine Findings
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        {result.aiFindings}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM PANEL - RADIOLOGIST REPORT COMPOSER */}
          <div className="ws-bottom">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileSignature size={16} color="#60a5fa" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary m-0">Structured Radiologist Report</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  className="btn-secondary text-xs"
                  onClick={() => {
                    const cur = selectedStudy.clinicalHistory || '';
                    setSelectedStudy({ ...selectedStudy, clinicalHistory: cur ? `${cur} [Voice Dictation Recorded]` : 'Clinical Dictation Recorded.' });
                  }}
                >
                  <Mic size={13} /> Dictate
                </button>
                <button 
                  type="button" 
                  className="btn-secondary text-xs"
                  onClick={() => setSelectedStudy({
                    ...selectedStudy, 
                    clinicalHistory: `EXAM: ${modality} ${bodyPart}\nTECHNIQUE: Standard multi-planar imaging.\nFINDINGS: The examined anatomical parenchyma is unremarkable with no focal masses, edema, or hemorrhage.\nIMPRESSION: 1. Normal study. No acute pathology identified.`
                  })}
                >
                  <FileText size={13} /> Normal Template
                </button>
                <button 
                  type="button" 
                  className="btn-secondary text-xs"
                  onClick={() => setSelectedStudy({
                    ...selectedStudy, 
                    clinicalHistory: `EXAM: ${modality} ${bodyPart}\nTECHNIQUE: Targeted scan protocol.\nFINDINGS: Focal structural anomaly identified in target region with abnormal gradient enhancement.\nIMPRESSION: 1. Abnormal finding requiring clinical correlation.\nRECOMMENDATIONS: Recommend clinical follow-up and targeted biopsy if indicated.`
                  })}
                >
                  <AlertTriangle size={13} /> Abnormality Template
                </button>
              </div>
            </div>

            <textarea 
              className="clinical-report-textarea" 
              placeholder="Enter / dictate structured clinical observations, radiological impressions, and patient recommendations..."
              value={selectedStudy.clinicalHistory || ''} 
              onChange={e => setSelectedStudy({...selectedStudy, clinicalHistory: e.target.value})}
            />

            <div className="flex justify-between items-center">
              <button 
                type="button" 
                className="btn-secondary text-xs" 
                onClick={() => { setSelectedStudy(null); setFile(null); setPreview(null); setResult(null); }}
              >
                <X size={14} /> Discard Study
              </button>
              
              <div className="flex gap-2">
                {result && (
                  <button 
                    type="button" 
                    className="btn-secondary text-xs" 
                    onClick={() => {
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
                    }}
                  >
                    <Download size={14} /> Download PDF Dossier
                  </button>
                )}
                
                <button 
                  type="button" 
                  className="btn-primary text-xs" 
                  disabled={!result || !selectedStudy.patient} 
                  onClick={async () => {
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
                    setFile(null);
                    setPreview(null);
                    setResult(null);
                  }}
                >
                  <Save size={14} /> {result ? 'Save Study & Finalize to EHR' : 'Run AI First to Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: '#10b981', color: '#fff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✓</span> {toastMessage}
        </div>
      )}
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
            <button className="nav-item" onClick={() => {
              setFile(null);
              setPreview(null);
              setResult(null);
              setSelectedStudy({ isNew: true, id: 'New Study', study: 'Pending Upload', aiType: 'processing', aiLabel: 'PENDING' });
            }}>
              <Plus size={16} /> Add Study
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
            <button 
              type="button"
              className="theme-toggle-btn"
              onClick={() => setIsWhiteTheme(!isWhiteTheme)}
              title={isWhiteTheme ? "Switch to Dark Theme" : "Switch to White Theme"}
            >
              {isWhiteTheme ? <Moon size={15} /> : <Sun size={15} color="#fde047" />}
              <span>{isWhiteTheme ? "Dark Mode" : "Light Mode"}</span>
            </button>
            <Bell size={18} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
            <div className="flex items-center gap-2">
              <User size={18} color="var(--text-secondary)" />
              <span className="font-medium">Dr. Smith</span>
            </div>
            <button className="btn-primary" onClick={() => {
              setFile(null);
              setPreview(null);
              setResult(null);
              setSelectedStudy({ isNew: true, id: 'New Study', study: 'Pending Upload', aiType: 'processing', aiLabel: 'PENDING' });
            }}>
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

                {/* REGISTERED PATIENTS DIRECTORY TABLE ON DASHBOARD */}
                <div style={{ marginTop: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={20} color="var(--accent-primary, #3b82f6)" />
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Registered Patients Directory</h2>
                      <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {patients.length} Registered
                      </span>
                    </div>
                    <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => {
                      setActiveSidebar('Patient Directory');
                      setEditingPatient({ id: `PT-${Math.floor(Math.random() * 90000) + 10000}`, name: '', dob: '', age: '', gender: 'Male', phone: '', email: '', address: '', history: '', allergies: '', doctor: '', notes: '', studies: 0, lastStudy: 'N/A', status: 'New' });
                    }}>
                      <Plus size={14} className="mr-1 inline" /> New Patient
                    </button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Full Name</th>
                        <th>Age · Gender</th>
                        <th>Phone</th>
                        <th>Assigned Doctor</th>
                        <th>Total Studies</th>
                        <th>Last Visit</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map(p => (
                        <tr key={p.id}>
                          <td className="mono" style={{ color: '#60a5fa' }}>{p.id}</td>
                          <td className="font-medium">{p.name}</td>
                          <td>{p.age} · {p.gender}</td>
                          <td>{p.phone || 'N/A'}</td>
                          <td>{p.doctor || 'Dr. Smith'}</td>
                          <td>
                            <span style={{ background: p.studies > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)', color: p.studies > 0 ? '#10b981' : '#94a3b8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                              {p.studies} {p.studies === 1 ? 'Study' : 'Studies'}
                            </span>
                          </td>
                          <td>{p.lastStudy || 'N/A'}</td>
                          <td><span className="ai-status clear">{p.status || 'Active'}</span></td>
                          <td>
                            <div className="flex gap-2">
                              <button className="action-link" style={{ color: '#38bdf8' }} onClick={() => {
                                setFile(null);
                                setPreview(null);
                                setResult(null);
                                setSelectedStudy({
                                  isNew: true,
                                  id: 'New Study',
                                  study: 'Pending Upload',
                                  aiType: 'processing',
                                  aiLabel: 'PENDING',
                                  patientId: p.id,
                                  patient: p.name,
                                  age: p.age,
                                  gender: p.gender,
                                  phone: p.phone,
                                  history: p.history,
                                  allergies: p.allergies,
                                  doctor: p.doctor,
                                  notes: p.notes
                                });
                              }}>
                                + Add Study
                              </button>
                              <span className="text-muted">|</span>
                              <button className="action-link" onClick={() => { setActiveSidebar('Patient Directory'); setEditingPatient(p); }}>
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {patients.length === 0 && (
                        <tr><td colSpan="9" className="text-center text-muted p-4">No registered patients in clinical database. Click "New Patient" above.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                  <div className="patient-reg-container">
                    <div className="patient-reg-card">
                      {/* HEADER */}
                      <div className="patient-reg-header">
                        <div className="patient-reg-header-left">
                          <div className="patient-avatar-badge">
                            {editingPatient.name ? editingPatient.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : <UserPlus size={24} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                                {editingPatient.name ? `Patient EHR: ${editingPatient.name}` : 'New Patient Registration'}
                              </h2>
                              <span className="mono text-xs px-2.5 py-0.5 rounded font-bold" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                {editingPatient.id}
                              </span>
                            </div>
                            <p className="text-xs text-muted" style={{ margin: '4px 0 0 0' }}>
                              Electronic Health Record (EHR) demographics, clinical contact, and intake baseline.
                            </p>
                          </div>
                        </div>
                        <button className="btn-ghost" onClick={() => setEditingPatient(null)}>
                          <X size={16} /> Discard
                        </button>
                      </div>

                      {/* SECTION 1: DEMOGRAPHICS */}
                      <div className="patient-reg-section">
                        <div className="patient-reg-section-title">
                          <User size={16} /> Patient Demographics & Identification
                        </div>
                        <div className="patient-reg-grid-3">
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Patient ID / MRN</label>
                            <input className="input-field mono" value={editingPatient.id} onChange={e => setEditingPatient({...editingPatient, id: e.target.value})} placeholder="PT-XXXXX" />
                          </div>
                          <div className="patient-reg-field" style={{ gridColumn: 'span 2' }}>
                            <label className="patient-reg-label">Full Legal Name</label>
                            <input className="input-field" value={editingPatient.name} onChange={e => setEditingPatient({...editingPatient, name: e.target.value})} placeholder="First Last (e.g. John Doe)" />
                          </div>
                        </div>

                        <div className="patient-reg-grid-3" style={{ marginTop: '1.25rem' }}>
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Date of Birth</label>
                            <input type="date" className="input-field" value={editingPatient.dob} onChange={e => {
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
                            }} />
                          </div>
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Age (Years)</label>
                            <input className="input-field" value={editingPatient.age} onChange={e => setEditingPatient({...editingPatient, age: e.target.value})} placeholder="Calculated or enter age" />
                          </div>
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Biological Sex / Gender</label>
                            <select className="input-field" value={editingPatient.gender} onChange={e => setEditingPatient({...editingPatient, gender: e.target.value})}>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: CONTACT & REFERRAL */}
                      <div className="patient-reg-section">
                        <div className="patient-reg-section-title">
                          <Phone size={16} /> Contact & Clinical Provider Information
                        </div>
                        <div className="patient-reg-grid-3">
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Primary Phone</label>
                            <input className="input-field" placeholder="+1 (555) 000-0000" value={editingPatient.phone} onChange={e => setEditingPatient({...editingPatient, phone: e.target.value})} />
                          </div>
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Email Address</label>
                            <input className="input-field" placeholder="patient@healthcare.org" value={editingPatient.email} onChange={e => setEditingPatient({...editingPatient, email: e.target.value})} />
                          </div>
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Referring Physician</label>
                            <input className="input-field" placeholder="Dr. Referring Specialist" value={editingPatient.doctor} onChange={e => setEditingPatient({...editingPatient, doctor: e.target.value})} />
                          </div>
                        </div>

                        <div className="patient-reg-field" style={{ marginTop: '1.25rem' }}>
                          <label className="patient-reg-label">Residential Address & Clinical Facility</label>
                          <input className="input-field" placeholder="Street Address, City, Postal Code" value={editingPatient.address} onChange={e => setEditingPatient({...editingPatient, address: e.target.value})} />
                        </div>
                      </div>

                      {/* SECTION 3: CLINICAL BACKGROUND */}
                      <div className="patient-reg-section" style={{ borderBottom: 'none' }}>
                        <div className="patient-reg-section-title">
                          <FileText size={16} /> Medical History, Allergies & Clinical Notes
                        </div>
                        <div className="patient-reg-grid-2">
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Medical History & Prior Diagnoses</label>
                            <textarea className="input-field" rows={3} placeholder="Previous surgical procedures, chronic illness, implants..." value={editingPatient.history} onChange={e => setEditingPatient({...editingPatient, history: e.target.value})}></textarea>
                          </div>
                          <div className="patient-reg-field">
                            <label className="patient-reg-label">Known Allergies & Contraindications</label>
                            <textarea className="input-field" rows={3} placeholder="Contrast media, Iodine, Penicillin, Latex, None reported..." value={editingPatient.allergies} onChange={e => setEditingPatient({...editingPatient, allergies: e.target.value})}></textarea>
                          </div>
                        </div>

                        <div className="patient-reg-field" style={{ marginTop: '1.25rem' }}>
                          <label className="patient-reg-label">Clinical Intake Notes & Diagnostic Indications</label>
                          <textarea className="input-field" rows={3} placeholder="Special instructions, scanning protocols, mobility notes..." value={editingPatient.notes} onChange={e => setEditingPatient({...editingPatient, notes: e.target.value})}></textarea>
                        </div>
                      </div>

                      {/* FOOTER ACTIONS */}
                      <div className="patient-reg-footer">
                        <button className="btn-secondary" onClick={() => setEditingPatient(null)}>
                          <X size={16} /> Cancel
                        </button>
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
                          const savedName = editingPatient.name;
                          const savedId = editingPatient.id;
                          fetchData();
                          setEditingPatient(null);
                          setToastMessage(`Patient ${savedName} (${savedId}) saved successfully!`);
                          setTimeout(() => setToastMessage(''), 4000);
                        }}>
                          <Check size={16} /> Save Patient Record
                        </button>
                      </div>
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
                  <div className="report-detail-wrapper" style={{ overflowY: 'auto', padding: '1rem', boxSizing: 'border-box' }}>
                    
                    {/* TOP: Full-width header */}
                    <div className="report-header-banner">
                      <div className="flex items-center gap-4">
                        <button className="btn-secondary" onClick={() => setSelectedReport(null)}>
                          <ArrowLeft size={16} /> Back to Reports
                        </button>
                        <div className="flex items-center gap-3">
                          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            RADIOLOGY REPORT
                          </h2>
                          <span className="mono text-xs px-2.5 py-1 rounded font-bold" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            {selectedReport.id}
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded font-bold" style={{ background: selectedReport.status === 'Draft' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: selectedReport.status === 'Draft' ? '#f59e0b' : '#10b981', border: `1px solid ${selectedReport.status === 'Draft' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
                            {selectedReport.status || 'FINALIZED'}
                          </span>
                        </div>
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

                    {/* SECTION 1: Patient & Study Clinical Dossier */}
                    <div className="report-dossier-card">
                      {selectedReport.isNew ? (
                        <div>
                          <div className="patient-reg-section-title">
                            <User size={16} /> Select Patient for Report
                          </div>
                          <div className="patient-reg-grid-3">
                            <div className="patient-reg-field" style={{ gridColumn: 'span 2' }}>
                              <label className="patient-reg-label">Select Patient & Linked Study</label>
                              <select 
                                className="input-field" 
                                value={selectedReport.patientId}
                                onChange={(e) => {
                                  const pId = e.target.value;
                                  const p = patients.find(pt => pt.id === pId);
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
                            <div className="patient-reg-field">
                              <label className="patient-reg-label">Study Date</label>
                              <input type="date" className="input-field" value={selectedReport.date || ''} onChange={e => setSelectedReport({...selectedReport, date: e.target.value})} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {/* Hero row with Avatar and Core Identifiers */}
                          <div className="dossier-hero-row">
                            <div className="dossier-patient-main">
                              <div className="dossier-avatar">
                                {selectedReport.patientName ? selectedReport.patientName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'PT'}
                              </div>
                              <div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                                  {selectedReport.patientName || 'Anonymous Patient'}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted">
                                  <span className="mono font-semibold text-accent-blue">{selectedReport.patientId}</span>
                                  <span>·</span>
                                  <span>{selectedReport.gender || patients.find(p => p.id === selectedReport.patientId)?.gender || 'Male'}</span>
                                  <span>·</span>
                                  <span>{selectedReport.age || patients.find(p => p.id === selectedReport.patientId)?.age || 'N/A'} yrs</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                                {selectedReport.study || 'MRI'} · {selectedReport.bodyPart || 'Brain'}
                              </span>
                              <span className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                                <Calendar size={13} /> {selectedReport.date || 'Current Session'}
                              </span>
                            </div>
                          </div>

                          {/* 4-Column Clinical Metadata Grid */}
                          <div className="dossier-grid">
                            <div className="dossier-cell">
                              <div className="dossier-cell-label">Patient ID / MRN</div>
                              <div className="dossier-cell-value mono">{selectedReport.patientId || 'N/A'}</div>
                            </div>
                            <div className="dossier-cell">
                              <div className="dossier-cell-label">Telephone Contact</div>
                              <div className="dossier-cell-value">{patients.find(p => p.id === selectedReport.patientId)?.phone || 'N/A'}</div>
                            </div>
                            <div className="dossier-cell">
                              <div className="dossier-cell-label">Official Email</div>
                              <div className="dossier-cell-value">{patients.find(p => p.id === selectedReport.patientId)?.email || 'N/A'}</div>
                            </div>
                            <div className="dossier-cell">
                              <div className="dossier-cell-label">Referring Physician</div>
                              <div className="dossier-cell-value">Dr. {patients.find(p => p.id === selectedReport.patientId)?.doctor || 'Specialist'}</div>
                            </div>
                            <div className="dossier-cell">
                              <div className="dossier-cell-label">Clinical Facility / Address</div>
                              <div className="dossier-cell-value">{patients.find(p => p.id === selectedReport.patientId)?.address || 'Radiology Suite'}</div>
                            </div>
                            <div className="dossier-cell">
                              <div className="dossier-cell-label">Imaging Modality</div>
                              <div className="dossier-cell-value">{selectedReport.study || 'MRI (Magnetic Resonance)'}</div>
                            </div>
                            <div className="dossier-cell">
                              <div className="dossier-cell-label">Target Anatomy</div>
                              <div className="dossier-cell-value">{selectedReport.bodyPart || 'Brain / Neuro'}</div>
                            </div>
                            <div className="dossier-cell">
                              <div className="dossier-cell-label">Study Date</div>
                              <div className="dossier-cell-value">{selectedReport.date || 'Standard protocol'}</div>
                            </div>
                          </div>

                          {/* 3-Column Clinical Callouts */}
                          <div className="dossier-callout-row">
                            <div className="dossier-callout-box">
                              <div className="dossier-cell-label flex items-center gap-1.5"><FileText size={12}/> Medical History</div>
                              <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                                {patients.find(p => p.id === selectedReport.patientId)?.history || 'None reported (NIL)'}
                              </div>
                            </div>
                            <div className="dossier-callout-box">
                              <div className="dossier-cell-label flex items-center gap-1.5"><ShieldAlert size={12}/> Allergies & Contraindications</div>
                              <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                                {patients.find(p => p.id === selectedReport.patientId)?.allergies || 'None reported (NIL)'}
                              </div>
                            </div>
                            <div className="dossier-callout-box">
                              <div className="dossier-cell-label flex items-center gap-1.5"><Activity size={12}/> Clinical Notes</div>
                              <div className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                                {patients.find(p => p.id === selectedReport.patientId)?.notes || 'Routine clinical assessment.'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ROW 2: Full-width AI Diagnostics & Findings card */}
                    {/* SECTION 2: AI Diagnostics & Grad-CAM Findings Card */}
                    <div className="report-ai-card">
                      <div className="patient-reg-section-title">
                        <Activity size={16} /> Deep Learning AI Diagnostics & Grad-CAM Heatmap
                      </div>

                      <div className="report-ai-body">
                        <div>
                          {/* Finding and Confidence Hero Badges */}
                          <div className="ai-finding-hero">
                            <div className="ai-abnormality-badge">
                              <Activity size={18} />
                              <span>{selectedReport.aiFinding || 'Detected Abnormality'}</span>
                            </div>
                            <div className="ai-confidence-pill">
                              <CheckCircle2 size={16} />
                              <span>{selectedReport.confidence || '99%'} Confidence</span>
                            </div>
                          </div>

                          {/* AI Narrative Quote Box */}
                          <div className="ai-narrative-box">
                            <div className="flex items-center gap-2 font-bold mb-2 text-xs uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
                              <Sparkles size={14} /> AI Diagnostic Inference Summary
                            </div>
                            <p style={{ margin: 0 }}>
                              {selectedReport.observations || 'The deep learning neural network has evaluated raw tissue intensity gradients and isolated pathological neural activations.'}
                            </p>
                          </div>

                          <div className="mt-3">
                            <label className="patient-reg-label block mb-1">Observation Annotations</label>
                            <textarea 
                              className="clinical-textarea" 
                              rows={3} 
                              value={selectedReport.observations || ''} 
                              onChange={e => setSelectedReport({...selectedReport, observations: e.target.value})}
                              placeholder="Clinical remarks or observation notes..."
                            />
                          </div>
                        </div>

                        {/* Framed Heatmap Container */}
                        <div className="heatmap-viewer-card">
                          <span className="heatmap-tag">GRAD-CAM ACTIVATION MAP</span>
                          {selectedReport.heatmapUrl ? (
                            <img src={selectedReport.heatmapUrl} alt="AI Grad-CAM Saliency Map" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted text-xs h-full p-4 text-center">
                              <ImageIcon size={32} className="mb-2 opacity-50" />
                              <span>[ Grad-CAM Visual Heatmap ]</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Radiologist Clinical Report Sections */}
                    <div className="report-sections-card">
                      <div className="border-b border-subtle pb-3">
                        <div className="patient-reg-section-title" style={{ margin: 0 }}>
                          <FileText size={16} /> Radiologist Clinical Report
                        </div>
                        <p className="text-xs text-muted" style={{ margin: '4px 0 0 0' }}>
                          Standard 4-tier structured radiological reporting protocol.
                        </p>
                      </div>

                      <div className="clinical-section-block">
                        <label className="clinical-section-header">
                          <span className="clinical-step-num">1</span>
                          <span>Clinical History & Indication</span>
                        </label>
                        <textarea 
                          className="clinical-textarea" 
                          rows={3} 
                          value={selectedReport.observations} 
                          onChange={e => setSelectedReport({...selectedReport, observations: e.target.value})} 
                          placeholder="Indication for exam, relevant symptoms, surgical history..."
                        />
                      </div>

                      <div className="clinical-section-block">
                        <label className="clinical-section-header">
                          <span className="clinical-step-num">2</span>
                          <span>Radiographic Findings</span>
                        </label>
                        <textarea 
                          className="clinical-textarea" 
                          rows={4} 
                          value={selectedReport.findings} 
                          onChange={e => setSelectedReport({...selectedReport, findings: e.target.value})} 
                          placeholder="Detailed radiographic findings, anatomical localization, tissue density..."
                        />
                      </div>

                      <div className="clinical-section-block">
                        <label className="clinical-section-header">
                          <span className="clinical-step-num">3</span>
                          <span>Diagnostic Impression</span>
                        </label>
                        <textarea 
                          className="clinical-textarea" 
                          rows={3} 
                          value={selectedReport.impression} 
                          onChange={e => setSelectedReport({...selectedReport, impression: e.target.value})} 
                          placeholder="Primary diagnosis, differential diagnoses, critical pathology..."
                        />
                      </div>

                      <div className="clinical-section-block">
                        <label className="clinical-section-header">
                          <span className="clinical-step-num">4</span>
                          <span>Recommendations & Follow-up Plan</span>
                        </label>
                        <textarea 
                          className="clinical-textarea" 
                          rows={3} 
                          value={selectedReport.recommendations} 
                          onChange={e => setSelectedReport({...selectedReport, recommendations: e.target.value})} 
                          placeholder="Clinical follow-up, correlation with biopsy or laboratory values, repeat imaging interval..."
                        />
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
              <div className="settings-container-wrap">
                {/* SETTINGS HEADER */}
                <div className="settings-header-banner">
                  <div>
                    <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Workstation Settings & Preferences</h1>
                    <p className="text-xs text-muted">Configure physician credentials, deep learning inference pipelines, and visual appearance.</p>
                  </div>
                  {profileToast && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <CheckCircle size={14} /> {profileToast}
                    </div>
                  )}
                </div>

                {/* SEGMENTED TAB NAVIGATION */}
                <div className="settings-tabs-nav">
                  <button 
                    type="button" 
                    className={`settings-tab-btn ${settingsActiveTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setSettingsActiveTab('profile')}
                  >
                    <User size={15} /> Physician Profile
                  </button>
                  <button 
                    type="button" 
                    className={`settings-tab-btn ${settingsActiveTab === 'ai' ? 'active' : ''}`}
                    onClick={() => setSettingsActiveTab('ai')}
                  >
                    <Cpu size={15} /> AI Diagnostics Engine
                  </button>
                  <button 
                    type="button" 
                    className={`settings-tab-btn ${settingsActiveTab === 'appearance' ? 'active' : ''}`}
                    onClick={() => setSettingsActiveTab('appearance')}
                  >
                    <Palette size={15} /> Appearance & Themes
                  </button>
                  <button 
                    type="button" 
                    className={`settings-tab-btn ${settingsActiveTab === 'database' ? 'active' : ''}`}
                    onClick={() => setSettingsActiveTab('database')}
                  >
                    <Database size={15} /> Storage & Health
                  </button>
                </div>

                {/* TAB 1: PHYSICIAN PROFILE */}
                {settingsActiveTab === 'profile' && (
                  <div>
                    {/* Doctor Avatar Banner */}
                    <div className="doctor-profile-banner">
                      <div className="doctor-avatar-circle">DS</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{profileForm.name}</h2>
                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#10b981', color: '#000', fontWeight: 700, borderRadius: '20px', letterSpacing: '0.05em' }}>
                            VERIFIED RADIOLOGIST
                          </span>
                        </div>
                        <p className="text-xs text-muted" style={{ margin: 0 }}>
                          {profileForm.specialty} · {profileForm.institution} · License #{profileForm.license}
                        </p>
                      </div>
                    </div>

                    <div className="settings-card">
                      <div className="settings-card-header">
                        <div className="settings-card-title">
                          <ShieldCheck size={18} style={{ color: 'var(--accent-blue)' }} /> Clinical Credentials
                        </div>
                        <span className="text-xs text-muted">Used in generated PDF radiology reports</span>
                      </div>

                      <div className="settings-form-grid">
                        <div className="settings-field-group">
                          <label>Full Legal Name & Title</label>
                          <input 
                            className="input-field" 
                            value={profileForm.name} 
                            onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                          />
                        </div>
                        <div className="settings-field-group">
                          <label>Medical Board License / NPI</label>
                          <input 
                            className="input-field mono" 
                            value={profileForm.license} 
                            onChange={e => setProfileForm({...profileForm, license: e.target.value})}
                          />
                        </div>
                        <div className="settings-field-group">
                          <label>Official Email Address</label>
                          <input 
                            className="input-field" 
                            type="email"
                            value={profileForm.email} 
                            onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                          />
                        </div>
                        <div className="settings-field-group">
                          <label>Primary Clinical Institution</label>
                          <input 
                            className="input-field" 
                            value={profileForm.institution} 
                            onChange={e => setProfileForm({...profileForm, institution: e.target.value})}
                          />
                        </div>
                        <div className="settings-field-group">
                          <label>Department</label>
                          <input 
                            className="input-field" 
                            value={profileForm.department} 
                            onChange={e => setProfileForm({...profileForm, department: e.target.value})}
                          />
                        </div>
                        <div className="settings-field-group">
                          <label>Subspecialty / Fellowship</label>
                          <input 
                            className="input-field" 
                            value={profileForm.specialty} 
                            onChange={e => setProfileForm({...profileForm, specialty: e.target.value})}
                          />
                        </div>
                        <div className="settings-field-group">
                          <label>Direct Workstation Contact Phone</label>
                          <input 
                            className="input-field" 
                            value={profileForm.phone} 
                            onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button 
                          type="button" 
                          className="btn-primary"
                          onClick={() => {
                            setProfileToast('Physician Profile successfully updated!');
                            setTimeout(() => setProfileToast(''), 3000);
                          }}
                        >
                          <CheckCircle size={15} /> Save Profile Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: AI DIAGNOSTICS CONFIGURATION */}
                {settingsActiveTab === 'ai' && (
                  <div>
                    {/* Live Engine Banner */}
                    <div className="settings-card" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(16,185,129,0.06) 100%)', borderColor: 'rgba(37,99,235,0.25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>FastAPI PyTorch ML Inference Engine</span>
                          </div>
                          <p className="text-xs text-muted" style={{ margin: 0 }}>
                            Listening on http://localhost:8001 · ResNet18 (Brain MRI 94.5%) · DenseNet121 (Lung CT 98.2%) · CLAHE Pipeline Active
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 600, border: '1px solid rgba(16,185,129,0.4)' }}>
                          PIPELINE ONLINE
                        </span>
                      </div>
                    </div>

                    <div className="settings-card">
                      <div className="settings-card-header">
                        <div className="settings-card-title">
                          <Sliders size={18} style={{ color: 'var(--accent-blue)' }} /> Deep Learning Workflow Toggles
                        </div>
                        <span className="text-xs text-muted">Automatic inference & emergency dispatch</span>
                      </div>

                      {/* Toggle 1 */}
                      <div className="toggle-switch-row">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                            Automatic AI Inference on Scan Ingestion
                          </div>
                          <div className="text-xs text-muted">
                            Automatically runs convolutional neural networks the moment a DICOM or image file is selected.
                          </div>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={aiConfig.autoInference} 
                            onChange={e => setAiConfig({...aiConfig, autoInference: e.target.checked})} 
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      {/* Toggle 2 */}
                      <div className="toggle-switch-row">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                            Emergency Room (ER) Critical Triage Escalation
                          </div>
                          <div className="text-xs text-muted">
                            Flags scans with detected intracranial tumors or COVID-19 consolidation as HIGH PRIORITY in the reading queue.
                          </div>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={aiConfig.criticalAlerts} 
                            onChange={e => setAiConfig({...aiConfig, criticalAlerts: e.target.checked})} 
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      {/* Toggle 3 */}
                      <div className="toggle-switch-row">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                            Explainable AI (Grad-CAM) Visual Heatmaps
                          </div>
                          <div className="text-xs text-muted">
                            Generates saliency heatmaps overlaying raw pixel tissue to show precisely where neural activations occurred.
                          </div>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={aiConfig.gradcamHeatmaps} 
                            onChange={e => setAiConfig({...aiConfig, gradcamHeatmaps: e.target.checked})} 
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      {/* Toggle 4 */}
                      <div className="toggle-switch-row">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                            Tabular Machine Learning Models (Stroke & Fetal Health)
                          </div>
                          <div className="text-xs text-muted">
                            Evaluates vital sign datasets (glucose, BMI, CTG) to predict pathological clinical outcomes with 93%+ accuracy.
                          </div>
                        </div>
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={aiConfig.tabularAssistance} 
                            onChange={e => setAiConfig({...aiConfig, tabularAssistance: e.target.checked})} 
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      {/* Confidence Slider */}
                      <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>AI Diagnostic Confidence Threshold</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.95rem' }}>{aiConfig.confidenceThreshold}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="60" 
                          max="98" 
                          value={aiConfig.confidenceThreshold}
                          onChange={e => setAiConfig({...aiConfig, confidenceThreshold: parseInt(e.target.value)})}
                          style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                          <span>60% (High Recall / Sensitive)</span>
                          <span>85% (Balanced Clinical)</span>
                          <span>98% (High Precision)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: APPEARANCE & THEMES */}
                {settingsActiveTab === 'appearance' && (
                  <div>
                    <div className="settings-card">
                      <div className="settings-card-header">
                        <div className="settings-card-title">
                          <Palette size={18} style={{ color: 'var(--accent-blue)' }} /> Color Theme & Interface Appearance
                        </div>
                        <span className="text-xs text-muted">Click a visual preview to switch theme</span>
                      </div>

                      {/* THEME PICKER CARDS */}
                      <div className="theme-picker-grid">
                        {/* Dark Option */}
                        <div 
                          className={`theme-card-option ${!isWhiteTheme ? 'selected' : ''}`}
                          onClick={() => setIsWhiteTheme(false)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>🌙 Premium Glassmorphism (Dark)</span>
                            {!isWhiteTheme && <CheckCircle size={16} style={{ color: '#3b82f6' }} />}
                          </div>
                          <div style={{ height: '70px', borderRadius: '8px', background: '#080c14', border: '1px solid #1e293b', padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <div style={{ width: '25%', height: '100%', background: '#0f172a', borderRadius: '4px' }}></div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <div style={{ width: '60%', height: '8px', background: '#3b82f6', borderRadius: '2px' }}></div>
                              <div style={{ width: '100%', height: '12px', background: '#1e293b', borderRadius: '2px' }}></div>
                              <div style={{ width: '80%', height: '12px', background: '#1e293b', borderRadius: '2px' }}></div>
                            </div>
                          </div>
                          <p className="text-xs text-muted" style={{ margin: 0 }}>
                            Low eyestrain dark palette designed for dark radiology reading rooms.
                          </p>
                        </div>

                        {/* Light Option */}
                        <div 
                          className={`theme-card-option ${isWhiteTheme ? 'selected' : ''}`}
                          onClick={() => setIsWhiteTheme(true)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>☀️ Clinical Contrast (White Theme)</span>
                            {isWhiteTheme && <CheckCircle size={16} style={{ color: '#2563eb' }} />}
                          </div>
                          <div style={{ height: '70px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <div style={{ width: '25%', height: '100%', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}></div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <div style={{ width: '60%', height: '8px', background: '#2563eb', borderRadius: '2px' }}></div>
                              <div style={{ width: '100%', height: '12px', background: '#ffffff', borderRadius: '2px', border: '1px solid #e2e8f0' }}></div>
                              <div style={{ width: '80%', height: '12px', background: '#ffffff', borderRadius: '2px', border: '1px solid #e2e8f0' }}></div>
                            </div>
                          </div>
                          <p className="text-xs text-muted" style={{ margin: 0 }}>
                            Crisp high-contrast daylight aesthetic tailored for clinical consultations.
                          </p>
                        </div>
                      </div>

                      {/* Display Layout Settings */}
                      <div className="settings-form-grid" style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <div className="settings-field-group">
                          <label>Worklist Reading Density</label>
                          <select className="input-field">
                            <option>Comfortable (Recommended for Radiologists)</option>
                            <option>Compact (High Throughput)</option>
                          </select>
                        </div>
                        <div className="settings-field-group">
                          <label>Default Diagnostic Imaging Modality</label>
                          <select className="input-field">
                            <option>Brain MRI (ResNet18 Fine-tuned)</option>
                            <option>Lung CT Scan (DenseNet121)</option>
                            <option>Chest X-Ray</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: DATABASE & STORAGE */}
                {settingsActiveTab === 'database' && (
                  <div>
                    <div className="settings-card">
                      <div className="settings-card-header">
                        <div className="settings-card-title">
                          <Database size={18} style={{ color: 'var(--accent-blue)' }} /> Storage & Clinical Data Persistence
                        </div>
                        <span className="text-xs text-muted">Local encrypted SQLite database</span>
                      </div>

                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                          <span className="text-xs text-muted block mb-1">DATABASE FILE</span>
                          <span style={{ fontWeight: 700, fontSize: '1rem' }} className="mono">medvision_clinical.db</span>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                          <span className="text-xs text-muted block mb-1">TOTAL PATIENTS</span>
                          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--accent-blue)' }}>{patients.length}</span>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                          <span className="text-xs text-muted block mb-1">STORED STUDIES</span>
                          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#10b981' }}>{studies.length}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <button 
                          type="button" 
                          className="btn-primary" 
                          onClick={() => setShowExportModal(true)}
                        >
                          <FileText size={16} /> Export Full Patient Database
                        </button>
                        <button 
                          type="button" 
                          className="btn-primary" 
                          style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                          onClick={() => {
                            if (window.confirm("Clear diagnostic image cache and refresh study cache?")) {
                              alert("Local diagnostic cache cleared successfully.");
                            }
                          }}
                        >
                          <X size={16} /> Clear Diagnostic Cache
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (ACTIVITY & PROCESSING) - Hidden on XAI Reports, Settings & Patient Registration to maximize width */}
          {activeSidebar !== 'XAI Reports' && activeSidebar !== 'Settings' && !(activeSidebar === 'Patient Directory' && editingPatient) && (
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
          <div className="medvision-copilot-modal">
            <div className="medvision-copilot-header">
              <div className="flex items-center gap-2">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 0 10px rgba(253,224,71,0.5)' }}>
                  <Activity size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#fde047' }}>MedVision Copilot</h3>
              </div>
              <button onClick={() => {
                setShowAssistant(false);
                setChatHistory([{ role: 'ai', text: 'Hello Dr. Smith. I am MedVision Copilot. How can I assist you with your clinical workflow today?' }]);
              }} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={16}/></button>
            </div>
            
            <div className="medvision-copilot-messages">
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div className={msg.role === 'user' ? 'medvision-copilot-msg-user' : 'medvision-copilot-msg-ai'}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="medvision-copilot-footer">
              <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  className="input-field" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Ask Copilot anything..." 
                  style={{ borderRadius: '20px', padding: '0.55rem 1rem', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ffffff' }} 
                />
                <button type="submit" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: 'pointer' }}>
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
