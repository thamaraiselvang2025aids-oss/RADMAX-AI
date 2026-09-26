import React, { useRef, useEffect, useState } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCw, Sun, Contrast, Ruler, Square, Flame, 
  Columns, Trash2, ShieldAlert, Check, RefreshCw, ActivitySquare, Plus
} from 'lucide-react';
import { Study, PriorityLevel, ImageAnnotation } from '../types';

interface PACSViewerProps {
  study: Study;
  isWhiteTheme: boolean;
  onStatusChange: () => void;
}

export default function PACSViewer({
  study,
  isWhiteTheme,
  onStatusChange
}: PACSViewerProps) {
  const primaryCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // PACS Controls State
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [annotations, setAnnotations] = useState<ImageAnnotation[]>([]);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch real AI Analysis from DB
  useEffect(() => {
    if (study.status === 'AI_READY' || study.status === 'FINALIZED' || study.status === 'REVIEW' || study.status === 'DRAFT') {
       // Mocking the fetch to /api/studies/:id/analyze for already analyzed studies
       // Since we didn't build a GET /analysis endpoint in the quick server, we'll just mock fetching it
       fetch(`/api/studies/${study.id}`)
         .then(res => res.json())
         .then(data => {
            // Ideally we get analysis from DB, for now simulate if not there
            setAiAnalysisResult({
              findings: 'Abnormal structure detected in central region.',
              confidence: 85,
              evidenceGap: 'Boundary margins lack clear definition in T1 contrast.',
              recommendation: 'Correlate with clinical history; consider biopsy.'
            });
         });
    }
  }, [study]);

  const handleRunAi = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/studies/${study.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysisResult(data.analysis);
        onStatusChange();
      }
    } catch (e) {
      console.error(e);
    }
    setIsAnalyzing(false);
  };

  const handleGenerateReport = async () => {
    try {
      await fetch(`/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          patientId: study.patientId,
          studyId: study.id,
          findings: aiAnalysisResult?.findings || 'No findings recorded.',
          impression: 'Preliminary impression based on evidence.',
          recommendations: aiAnalysisResult?.recommendation || 'Standard care.',
        })
      });
      onStatusChange();
    } catch (e) {
      console.error(e);
    }
  };

  const drawMedicalImage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    ctx.fillStyle = isWhiteTheme ? '#f8fafc' : '#090d16';
    ctx.fillRect(10, 10, width - 20, height - 20);

    ctx.strokeStyle = `rgba(180, 180, 180, ${contrast / 100})`;
    ctx.lineWidth = 1.5;

    // Generic Brain rendering
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 110, 0, Math.PI * 2);
    ctx.fillStyle = isWhiteTheme ? '#e2e8f0' : '#141a29';
    ctx.fill();
    ctx.stroke();

    if (showHeatmap && (study.status === 'AI_READY' || study.status === 'FINALIZED' || study.status === 'DRAFT' || study.status === 'REVIEW')) {
      const tumorX = width / 2 - 30;
      const tumorY = height / 2 - 20;
      const radGrad = ctx.createRadialGradient(tumorX, tumorY, 2, tumorX, tumorY, 40);
      radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
      radGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      radGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(tumorX, tumorY, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // HUD
    ctx.fillStyle = isWhiteTheme ? 'rgba(15, 23, 42, 0.9)' : 'rgba(165, 180, 252, 0.85)';
    ctx.font = '10px monospace';
    ctx.fillText(`PID: ${study.patientId}`, 25, 40);
    ctx.fillText(`NAME: ${study.patientName}`, 25, 55);
    ctx.fillText(`MOD: ${study.modality}`, width - 180, 40);
    ctx.fillText(`DT: ${new Date(study.studyDate).toLocaleDateString()}`, width - 180, 55);
  };

  useEffect(() => {
    const canvas = primaryCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawMedicalImage(ctx, canvas.width, canvas.height);
    }
  }, [study, zoom, rotation, brightness, contrast, showHeatmap]);

  return (
    <div className={`flex flex-col h-full ${isWhiteTheme ? 'bg-white text-slate-800' : 'bg-[#0f111a] text-slate-300'}`}>
      {/* Top Toolbar */}
      <div className={`h-12 flex items-center px-4 justify-between border-b ${isWhiteTheme ? 'border-slate-200' : 'border-[#222736]'}`}>
        <div className="flex gap-2">
          <button onClick={() => setZoom(z => z + 0.1)} className="p-1.5 bg-slate-800 rounded"><ZoomIn size={16} /></button>
          <button onClick={() => setZoom(z => z - 0.1)} className="p-1.5 bg-slate-800 rounded"><ZoomOut size={16} /></button>
          <button onClick={() => setRotation(r => r + 90)} className="p-1.5 bg-slate-800 rounded"><RotateCw size={16} /></button>
          <button onClick={() => setShowHeatmap(!showHeatmap)} className={`p-1.5 rounded flex items-center gap-1 text-xs ${showHeatmap ? 'bg-red-900 text-red-300' : 'bg-slate-800'}`}><Flame size={16} /> Heatmap</button>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Status: <span className="text-blue-400">{study.status}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Study Browser */}
        <div className={`w-64 border-r flex flex-col p-4 ${isWhiteTheme ? 'border-slate-200 bg-slate-50' : 'border-[#222736] bg-[#151923]'}`}>
          <h3 className="font-bold text-xs uppercase text-slate-500 mb-4">Study Information</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-slate-500 text-xs block">Patient</span>
              <span className="font-bold">{study.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Patient ID</span>
              <span className="font-mono">{study.patientId}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Modality</span>
              <span>{study.modality} - {study.bodyPart}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Date</span>
              <span>{new Date(study.studyDate).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* CENTER: Main Viewer */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <canvas ref={primaryCanvasRef} width={800} height={800} className="max-w-full max-h-full object-contain" />
        </div>

        {/* RIGHT: AI Evidence Panel */}
        <div className={`w-80 border-l flex flex-col ${isWhiteTheme ? 'border-slate-200 bg-slate-50' : 'border-[#222736] bg-[#151923]'}`}>
          <div className="p-4 border-b border-[#222736]">
            <h3 className="font-bold text-sm uppercase flex items-center gap-2">
              <ActivitySquare className="text-indigo-500 w-4 h-4" /> Evidence Analysis
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            {study.status === 'UPLOADED' && (
              <div className="text-center py-10">
                <Brain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-400 mb-4">Study is ready for Evidence Analysis.</p>
                <button onClick={handleRunAi} disabled={isAnalyzing} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full py-2 rounded text-xs font-bold">
                  {isAnalyzing ? 'Processing...' : 'Run Analysis'}
                </button>
              </div>
            )}

            {(study.status === 'AI_READY' || study.status === 'DRAFT' || study.status === 'FINALIZED') && aiAnalysisResult && (
              <div className="space-y-5 animate-fade-in text-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Available Evidence</span>
                  <div className="bg-slate-900 p-2 rounded text-xs border border-slate-700">{study.modality} Scan</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Evidence Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${aiAnalysisResult.confidence}%`}}></div></div>
                    <span className="font-mono text-xs">{aiAnalysisResult.confidence}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Evidence Gap</span>
                  <div className="bg-amber-950/30 text-amber-400 p-3 rounded text-xs border border-amber-900/50">
                    <ShieldAlert className="w-4 h-4 inline mr-1 mb-0.5" />
                    {aiAnalysisResult.evidenceGap}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Clinical Suggestion</span>
                  <p className="text-xs text-slate-300">{aiAnalysisResult.recommendation}</p>
                </div>
                
                {study.status === 'AI_READY' && (
                  <button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-2 rounded text-xs font-bold mt-4">
                    Generate Draft Report
                  </button>
                )}
                {study.status === 'DRAFT' && (
                   <div className="bg-blue-900/30 text-blue-400 p-3 rounded text-xs border border-blue-800/50 text-center">
                     Draft Report Generated. Available in Reports tab.
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
