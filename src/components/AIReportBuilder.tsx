import { useState, useEffect } from 'react';
import { FileText, Wand2, ShieldCheck, CheckSquare, Sparkles } from 'lucide-react';
import { MedicalScan } from '../types';

interface AIReportBuilderProps {
  scan: MedicalScan;
  onReportFinalized: (scanId: string, findings: string, impression: string, recommendations: string, signature: string) => void;
  triggerAIAnalysis: () => Promise<void>;
  isAnalyzing: boolean;
}

export default function AIReportBuilder({
  scan,
  onReportFinalized,
  triggerAIAnalysis,
  isAnalyzing
}: AIReportBuilderProps) {
  // Clinician Inputs (State initialized to existing report or empty)
  const [findings, setFindings] = useState<string>('');
  const [impression, setImpression] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string>('');
  const [clinicianSignature, setClinicianSignature] = useState<string>('Dr. Sarah Chen, MD, FRCR');
  const [isFinalized, setIsFinalized] = useState<boolean>(scan.status === 'Reviewed');

  // Load existing data on scan switch
  useEffect(() => {
    setFindings(scan.findings || '');
    setImpression(scan.impression || '');
    setRecommendations(scan.recommendations || '');
    setIsFinalized(scan.status === 'Reviewed');
  }, [scan]);

  // Apply AI Draft into clinical report inputs
  const handleApplyAIDraft = () => {
    if (!scan.aiAnalysis) return;
    setFindings(scan.aiAnalysis.aiFindings);
    setImpression(scan.aiAnalysis.aiImpression);
    
    // Propose matching recommendations based on diseases detected
    const firstDisease = scan.aiAnalysis.diseasesDetected[0]?.disease || '';
    if (firstDisease.includes('Glioma') || firstDisease.includes('Tumor')) {
      setRecommendations('1. Urgent Neurosurgical Consultation for excision planning.\n2. Add brain MRI with gadolinium contrast.\n3. Consider MR spectroscopy.');
    } else if (firstDisease.includes('Pneumonia')) {
      setRecommendations('1. Initiate empiric antibiotic coverage (e.g. Ceftriaxone & Azithromycin).\n2. Correlate with CBC count, blood culture, sputum culture, and inflammatory panel.\n3. Follow-up chest radiograph in 6 weeks to ensure resolution.');
    } else if (firstDisease.includes('Fracture')) {
      setRecommendations('1. Orthopedic consultation for casting or immobilization.\n2. Weight-bearing restriction as tolerated.\n3. Dynamic lateral/AP views in 2 weeks.');
    } else {
      setRecommendations('No urgent clinical follow-ups. Regular health screening and symptomatic clinical review as needed.');
    }
  };

  const handleFinalizeReport = () => {
    if (!findings.trim() || !impression.trim() || !clinicianSignature.trim()) {
      alert("Please ensure Findings, Clinical Impression, and your Digital Signature are populated before final audit locking.");
      return;
    }
    onReportFinalized(scan.id, findings, impression, recommendations, clinicianSignature);
    setIsFinalized(true);
  };

  const hasAnalysis = !!scan.aiAnalysis;
  const confidence = scan.aiAnalysis?.confidenceScore || 0;

  return (
    <div id="clinical-report-builder" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 select-none">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wide">PACS Diagnostic Report Editor</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg border ${
            isFinalized 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' 
              : 'bg-yellow-950/40 text-yellow-500 border-yellow-800/60'
          }`}>
            {isFinalized ? '🔒 Audited & Locked' : '✏️ Draft Stage'}
          </span>
        </div>
      </div>

      {/* Split view: Left AI Draft details, Right Active human editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        
        {/* Left Column: Automated AI Insights Grid */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Sparkles className="w-3.5 h-3.5" /> AI Inference Engine
            </h4>
            
            {!hasAnalysis && (
              <button 
                onClick={triggerAIAnalysis}
                className="text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>Evaluating...</>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3" /> Run MONAI Inference
                  </>
                )}
              </button>
            )}
          </div>

          {hasAnalysis ? (
            <div className="space-y-4">
              {/* Confidence Indicator */}
              <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800/40">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">AI CONFIDENCE SCORE</p>
                  <p className="text-lg font-black text-indigo-300 font-mono mt-0.5">{confidence}%</p>
                </div>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      confidence > 90 ? 'bg-emerald-500' : confidence > 75 ? 'bg-amber-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${confidence}%` }} 
                  />
                </div>
              </div>

              {/* Classification list */}
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Classifications Detected</p>
                <div className="space-y-1.5">
                  {scan.aiAnalysis?.diseasesDetected.map((disease, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/40 py-2 px-3 rounded-lg border border-slate-800/30 text-xs">
                      <span className="text-white font-medium">{disease.disease}</span>
                      <span className="font-mono text-purple-400 font-bold">{disease.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Draft findings */}
              <div>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Draft Findings</p>
                <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/30">
                  {scan.aiAnalysis?.aiFindings}
                </p>
              </div>

              {/* Draft impression */}
              <div>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Draft Impression</p>
                <p className="text-[11px] leading-relaxed text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/30 font-semibold">
                  {scan.aiAnalysis?.aiImpression}
                </p>
              </div>

              {/* Apply Draft CTAs */}
              {!isFinalized && (
                <button
                  onClick={handleApplyAIDraft}
                  className="w-full bg-slate-900 hover:bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 hover:text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Integrate Draft into Report Fields
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center select-none">
              <FileText className="w-10 h-10 text-slate-700 stroke-[1.5] mb-2 animate-pulse" />
              <p className="text-xs font-medium">Inference Engine Ready.</p>
              <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">Trigger MONAI Deep Learning check to compose visual and textual diagnostics templates.</p>
            </div>
          )}
        </div>

        {/* Right Column: Hand-Coded Clinician Editor */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest select-none">
            Active Radiologist Assessment
          </h4>

          {/* Findings Textarea */}
          <div className="flex flex-col flex-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Findings</label>
            <textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              disabled={isFinalized}
              placeholder="Record detailed observations (size, lesion boundaries, mass effect, calcifications, fluid level)..."
              className="w-full flex-1 min-h-[90px] text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Impression Textarea */}
          <div className="flex flex-col flex-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Clinical Impression (Conclusive diagnosis)</label>
            <textarea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              disabled={isFinalized}
              placeholder="Record diagnosis interpretation and relevant grading (e.g. BI-RADS, staging, growth)..."
              className="w-full flex-1 min-h-[70px] text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Recommendations Textarea */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Recommendations (Suggested follow-up)</label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              disabled={isFinalized}
              placeholder="1. Repeat MRI with contrast in 3 months..."
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 h-[70px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Digital Signature */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Clinician Electronic Signature</label>
            <input
              type="text"
              value={clinicianSignature}
              onChange={(e) => setClinicianSignature(e.target.value)}
              disabled={isFinalized}
              placeholder="Dr. Sarah Chen, MD, FRCR"
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Action trigger */}
          {!isFinalized ? (
            <button
              onClick={handleFinalizeReport}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <ShieldCheck className="w-4 h-4" /> Finalize and Audit-Lock Report
            </button>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 p-3 rounded-xl flex items-center gap-2 mt-2 select-none">
              <CheckSquare className="w-5 h-5" />
              <div>
                <p className="text-xs font-bold leading-none">Diagnostic File Electronically Locked</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Signed by {scan.doctorSignature || clinicianSignature} for permanent record entry.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
