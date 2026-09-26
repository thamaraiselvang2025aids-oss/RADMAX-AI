import { useState, useRef, useEffect } from 'react';
import { Send, Bot, RefreshCw, MessageSquare, Terminal } from 'lucide-react';
import { MedicalScan } from '../types';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface AIChatBotProps {
  activeScan: MedicalScan;
}

export default function AIChatBot({ activeScan }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: `Hello! I am the MedVision AI Clinical Co-Pilot. I am synchronized with ${activeScan.patientName}'s clinical file under review.\n\nHow can I support your assessment of this ${activeScan.modality} study today?` 
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Quick prompt presets requested by the user
  const chatPresets = [
    { label: `Explain ${activeScan.modality}`, prompt: `Analyze this ${activeScan.modality} of ${activeScan.bodyPart}. Explain typical pathology signs.` },
    { label: 'Summarize Findings', prompt: 'Summarize the current AI diagnostic findings and key anatomical points.' },
    { label: 'Suggest Follow-up', prompt: 'Suggest clinical follow-up recommendations and next imaging procedures for this patient.' },
    { label: 'Suggest Codes', prompt: 'What are the recommended ICD-10 diagnostic coding suggestions for this case?' }
  ];

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/clinical-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages,
          scanId: activeScan.id
        })
      });

      const data = await response.json();
      const botMsg: Message = { sender: 'bot', text: data.text };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Co-pilot chat failed:", error);
      const errorMsg: Message = { 
        sender: 'bot', 
        text: "Error synchronizing with AI Core. Please check clinical network gateways." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-chat-copilot-container" className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[500px] shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
              Clinical Co-Pilot
            </h3>
            <p className="text-[10px] text-emerald-400 font-mono font-medium">● ACTIVE INTEGRATION</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ sender: 'bot', text: `Chat cache cleared. Synchronized with ${activeScan.patientName}'s ${activeScan.modality} study.` }])}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Reset Discussion Cache"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/20">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            )}
            <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-900 border border-slate-800/80 text-slate-300 rounded-tl-none font-sans'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5 max-w-[80%] items-center text-xs text-indigo-400 font-medium">
            <Bot className="w-4 h-4 animate-spin text-purple-400" />
            Co-Pilot compiling clinical response...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pre-formatted prompt suggestions */}
      <div className="px-4 py-2 border-t border-slate-800/50 flex gap-2 overflow-x-auto bg-slate-950/10 custom-scrollbar select-none">
        {chatPresets.map((preset, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(preset.prompt)}
            className="shrink-0 text-[10px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
        className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2"
      >
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask clinical co-pilot (e.g. 'explain tumor margins')..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button 
          type="submit"
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors cursor-pointer"
          disabled={!input.trim() || isLoading}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
