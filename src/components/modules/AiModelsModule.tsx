import React, { useState } from 'react';
import { Binary, Sliders, Cpu, Play, CheckCircle, ShieldAlert, Sparkles, Zap } from 'lucide-react';

interface AiModelsModuleProps {
  isWhiteTheme: boolean;
}

interface AIModel {
  id: string;
  name: string;
  architecture: string;
  version: string;
  size: string;
  accuracy: string;
  status: 'Active' | 'Standby' | 'Offline';
  threshold: number;
}

const INITIAL_MODELS: AIModel[] = [
  {
    id: 'model_brain',
    name: 'MONAI Brain Tumor Segmenter (3D UNet)',
    architecture: '3D-UNet ResNet Backbone',
    version: 'v4.2.1',
    size: '184 MB',
    accuracy: '98.1%',
    status: 'Active',
    threshold: 85
  },
  {
    id: 'model_chest',
    name: 'Chest Radiograph DenseNet Assessor',
    architecture: 'DenseNet-121 Feature Extractor',
    version: 'v2.8.0',
    size: '92 MB',
    accuracy: '96.8%',
    status: 'Active',
    threshold: 75
  },
  {
    id: 'model_breast',
    name: 'Mammographic Microcalcifications Sorter',
    architecture: 'ResNet-50 Classifier + FPN',
    version: 'v3.1.2',
    size: '128 MB',
    accuracy: '95.5%',
    status: 'Active',
    threshold: 80
  },
  {
    id: 'model_pneumonia',
    name: 'COVID-19 Pulmonary CT Volumetric morpher',
    architecture: '3D DenseNet ResNeXt-101',
    version: 'v1.4.0',
    size: '254 MB',
    accuracy: '94.2%',
    status: 'Standby',
    threshold: 90
  }
];

export default function AiModelsModule({ isWhiteTheme }: AiModelsModuleProps) {
  const [models, setModels] = useState<AIModel[]>(INITIAL_MODELS);
  const [selectedId, setSelectedId] = useState(models[0].id);

  const handleToggleStatus = (id: string) => {
    setModels(models.map(m => {
      if (m.id === id) {
        const nextStatus: AIModel['status'] = m.status === 'Active' ? 'Standby' : 'Active';
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const handleSliderChange = (id: string, val: number) => {
    setModels(models.map(m => m.id === id ? { ...m, threshold: val } : m));
  };

  const selectedModel = models.find(m => m.id === selectedId) || models[0];

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="select-none">
        <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
          isWhiteTheme ? 'text-slate-900' : 'text-white'
        }`}>
          <Binary className="w-6 h-6 text-indigo-400" /> MONAI Clinical AI Models Register
        </h2>
        <p className={`text-xs mt-1 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
          Review artificial intelligence parameters, classification confidence margins, structural UNet architectures, and offline execution states.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Models list */}
        <div className="space-y-2.5">
          {models.map((model) => {
            const isSelected = model.id === selectedId;
            const isActive = model.status === 'Active';

            return (
              <div
                key={model.id}
                onClick={() => setSelectedId(model.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? isWhiteTheme
                      ? 'bg-indigo-50 border-indigo-200 text-slate-900 shadow-sm'
                      : 'bg-indigo-950/40 border-indigo-700/50 text-white'
                    : isWhiteTheme
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{model.name.split(' (')[0]}</h4>
                    <p className={`text-[10px] mt-0.5 ${isWhiteTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                      Architecture: {model.architecture.split(' ')[0]}
                    </p>
                  </div>
                  
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-slate-500/15 text-slate-500 border border-slate-500/20'
                  }`}>
                    {model.status}
                  </span>
                </div>

                <div className="flex gap-4 mt-3 text-[10px] text-slate-500 uppercase font-semibold">
                  <span>Acc: <strong className="text-emerald-500">{model.accuracy}</strong></span>
                  <span>Size: <strong className={isWhiteTheme ? 'text-slate-800' : 'text-white'}>{model.size}</strong></span>
                  <span>Cutoff: <strong className="text-indigo-400">{model.threshold}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Adjust thresholds controls column */}
        <div className="xl:col-span-2">
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${
            isWhiteTheme 
              ? 'bg-white border-slate-200 shadow-sm text-slate-800' 
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            <div className="flex justify-between items-center border-b border-slate-800/10 pb-4 mb-5 select-none">
              <div>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${
                  isWhiteTheme ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  Core Neural Parameters
                </span>
                <h3 className={`text-lg font-black mt-0.5 ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                  {selectedModel.name}
                </h3>
              </div>

              <button
                onClick={() => handleToggleStatus(selectedModel.id)}
                className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedModel.status === 'Active'
                    ? 'bg-red-500/15 text-red-500 border-red-500/20 hover:bg-red-500/25'
                    : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/25'
                }`}
              >
                {selectedModel.status === 'Active' ? 'Deactivate Model' : 'Activate Model'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Architecture Info */}
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                isWhiteTheme ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/40'
              }`}>
                <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                  <Zap className="w-3.5 h-3.5 text-purple-400" /> Deep Learning Spec
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                    <span className="text-slate-500">Model Version</span>
                    <span className={`font-semibold ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{selectedModel.version}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                    <span className="text-slate-500">Framework Backbone</span>
                    <span className={`font-semibold ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{selectedModel.architecture}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/10 pb-1.5">
                    <span className="text-slate-500">Memory Storage Footprint</span>
                    <span className={`font-semibold ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>{selectedModel.size}</span>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500">ROC-AUC Target Accuracy</span>
                    <span className="font-bold text-emerald-500">{selectedModel.accuracy}</span>
                  </div>
                </div>
              </div>

              {/* Slider tuner */}
              <div className={`p-4 rounded-xl border space-y-4 ${
                isWhiteTheme ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/40'
              }`}>
                <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                  <Sliders className="w-3.5 h-3.5" /> Confidence threshold
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Current Cutoff</span>
                    <strong className="text-indigo-400 text-sm font-mono">{selectedModel.threshold}%</strong>
                  </div>

                  <input 
                    type="range" 
                    min="50" 
                    max="99" 
                    value={selectedModel.threshold}
                    onChange={(e) => handleSliderChange(selectedModel.id, parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                  />

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Adjusting this threshold determines the minimum confidence level required for the PACS workstation to auto-flag potential lesions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
