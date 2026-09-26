import { useState } from 'react';
import { Activity, ArrowRight, ShieldAlert, Calendar, ChevronRight } from 'lucide-react';
import { MedicalScan } from '../types';

interface DiseaseProgressProps {
  scan: MedicalScan;
}

export default function DiseaseProgress({ scan }: DiseaseProgressProps) {
  const [sliderVal, setSliderVal] = useState<number>(50); // Represents progress over time

  const isBrain = scan.bodyPart.toLowerCase() === 'brain';
  const growth = scan.aiAnalysis?.growthPercentage || null;

  return (
    <div id="disease-progression-workbench" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5 select-none">
        <Activity className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="font-bold text-sm text-white uppercase tracking-wide">Temporal Disease Progression Workbench</h3>
          <p className="text-[10px] text-slate-400">Volumetric tracking and predictive analytics alignment</p>
        </div>
      </div>

      {/* Grid containing progression details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        
        {/* Left Card: Comparative metrics */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest select-none">Comparative Metrics</h4>
          
          <div className="space-y-3">
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/30">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Baseline Study Date</span>
              <span className="text-xs text-white font-mono mt-0.5 block flex items-center gap-1.5 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Jan 15, 2026
              </span>
            </div>

            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/30">
              <span className="text-[9px] text-indigo-400 font-bold uppercase block">Current Study Date</span>
              <span className="text-xs text-white font-mono mt-0.5 block flex items-center gap-1.5 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Jul 19, 2026
              </span>
            </div>

            {growth !== null ? (
              <div className="bg-rose-950/20 p-3 rounded-lg border border-rose-900/30 text-rose-400">
                <span className="text-[9px] text-rose-500 font-bold uppercase block">VOLUMETRIC GROWTH INDEX</span>
                <span className="text-xl font-black font-mono mt-0.5 block">+{growth}%</span>
                <p className="text-[10px] text-slate-400 mt-1">Significant expansion detected in margins. Recommended immediate resection consult.</p>
              </div>
            ) : (
              <div className="bg-slate-900/20 p-3 rounded-lg border border-slate-800/30 text-slate-400">
                <span className="text-[9px] font-bold uppercase block">VOLUMETRIC GROWTH INDEX</span>
                <span className="text-sm font-semibold mt-1 block">No prior matching PACS baseline found</span>
              </div>
            )}
          </div>
        </div>

        {/* Center Card: Visual Slider alignment */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-3 lg:col-span-2">
          <div className="flex justify-between items-center select-none">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Growth Morphing Simulator</h4>
            <span className="text-[10px] font-bold bg-indigo-950/40 text-indigo-400 py-0.5 px-2 rounded-lg border border-indigo-800/40 font-mono">
              Aligned Slices: Level 45
            </span>
          </div>

          {/* Morphing Visual Canvas Simulation */}
          <div className="flex-1 min-h-[160px] bg-slate-950 rounded-lg flex items-center justify-center border border-slate-800/40 relative overflow-hidden select-none">
            {/* Split visuals */}
            <div className="flex gap-12 items-center">
              {/* Baseline circular tumor */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                  <div 
                    className="rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 transition-all duration-300" 
                    style={{ width: `${16 * 1.5}px`, height: `${16 * 1.5}px` }} 
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase mt-1.5 block">Baseline Tumor</span>
              </div>

              <ArrowRight className="w-5 h-5 text-indigo-500 animate-pulse" />

              {/* Current morphed tumor */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                  <div 
                    className="rounded-full bg-gradient-to-tr from-rose-600 to-amber-400 transition-all duration-200" 
                    style={{ 
                      width: `${(16 + (sliderVal / 100) * 12) * 1.5}px`, 
                      height: `${(16 + (sliderVal / 100) * 12) * 1.5}px` 
                    }} 
                  />
                </div>
                <span className="text-[9px] font-bold text-rose-400 uppercase mt-1.5 block">
                  Morphed Volume (+{Math.round((sliderVal / 100) * 20)}%)
                </span>
              </div>
            </div>

            {/* Float alert banner */}
            {isBrain && (
              <span className="absolute bottom-3 left-3 bg-red-950/60 border border-red-800/40 text-[9px] font-semibold text-red-400 py-1 px-2 rounded-lg flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> High infiltration probability along contralateral cortex.
              </span>
            )}
          </div>

          {/* Slider input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold select-none">
              <span>JAN 2026 (Baseline)</span>
              <span className="text-indigo-400">MORPHING SEQUENCE</span>
              <span>JUL 2026 (Current)</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer" 
            />
          </div>
        </div>
      </div>

      {/* Prediction Clinical Timeline forecast */}
      <div className="mt-5 border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3.5 select-none">Prediction Forecast Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-xl flex items-start gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono shrink-0 font-bold">1</span>
            <div>
              <p className="font-bold text-slate-300">Month 0 (Jul 2026)</p>
              <p className="text-[10px] text-slate-400 mt-1">Primary glioma is hyperintense (3.4cm). Mass effect compression active.</p>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-xl flex items-start gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-[10px] text-indigo-400 font-mono shrink-0 font-bold">2</span>
            <div>
              <p className="font-bold text-slate-300">Month 1 (Aug 2026)</p>
              <p className="text-[10px] text-slate-400 mt-1">Estimated chemotherapy response cycle. Intratumor edema margin check.</p>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-xl flex items-start gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono shrink-0 font-bold">3</span>
            <div>
              <p className="font-bold text-slate-300">Month 3 (Oct 2026)</p>
              <p className="text-[10px] text-slate-400 mt-1">Forecasted volume stabilization stage (chemotherapy consolidation).</p>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-xl flex items-start gap-2 text-xs">
            <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono shrink-0 font-bold">4</span>
            <div>
              <p className="font-bold text-slate-300">Month 6 (Jan 2027)</p>
              <p className="text-[10px] text-indigo-400 mt-1">Recommended baseline reference re-scan for long term regression.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
