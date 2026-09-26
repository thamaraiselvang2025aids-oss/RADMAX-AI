import React, { useState } from 'react';
import { 
  Brain, ShieldAlert, Key, Mail, Fingerprint, ChevronRight, CheckSquare, Sparkles 
} from 'lucide-react';
import { DEMO_USERS } from '../data';

interface LoginViewProps {
  onLoginSuccess: (user: typeof DEMO_USERS[0]) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  // Login flow states
  const [email, setEmail] = useState<string>('dr.chen@medvision.org');
  const [password, setPassword] = useState<string>('*********');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otpCode, setOtpCode] = useState<string>('');
  const [selectedDemoUser, setSelectedDemoUser] = useState<typeof DEMO_USERS[0]>(DEMO_USERS[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Forgot password mockup
  const handleForgotPassword = () => {
    alert("In a production enterprise ecosystem, this triggers an encrypted JWT-based password reset link sent to your registered institutional FHIR email directory.");
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate server-side access control audit checking
    setTimeout(() => {
      setLoading(false);
      setStep('otp'); // Go to 2FA / OTP stage
    }, 800);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedDemoUser.username,
          password: password || 'default_pass'
        })
      });
      const data = await response.json();
      setLoading(false);
      if (data.user) {
        onLoginSuccess(data.user);
      } else {
        onLoginSuccess(selectedDemoUser);
      }
    } catch (err) {
      console.error("Login verification failed:", err);
      setLoading(false);
      onLoginSuccess(selectedDemoUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Premium Glassmorphic Ambient Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/30 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-950/20 blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[350px] h-[350px] rounded-full bg-blue-950/20 blur-[130px] pointer-events-none" />

      {/* Main Container Grid */}
      <div className="w-full max-w-5xl bg-slate-950/60 border border-slate-800/80 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl backdrop-blur-xl relative z-10">
        
        {/* Left Column: Platform Branding / Decorative Showcase */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 p-8 flex flex-col justify-between border-r border-slate-800/40 relative">
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

          {/* Logo Brand */}
          <div className="flex items-center gap-3 relative z-10 select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-white tracking-wider leading-none text-base">MedVision AI</h2>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5 block">Enterprise Platform</span>
            </div>
          </div>

          {/* Feature highlights slider simulation */}
          <div className="my-12 relative z-10 select-none">
            <span className="text-[10px] bg-indigo-900/40 border border-indigo-700/40 text-indigo-400 py-1 px-3 rounded-full font-bold uppercase tracking-wider">
              Clinical Release V2.4
            </span>
            <h3 className="text-xl font-black text-white mt-4 tracking-tight leading-snug">
              Explainable Medical Intelligence & Diagnostics PACS
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Real-time deep learning segmentation, GradCAM saliency overlays, and Gemini clinical co-pilots integrated directly into institutional healthcare workflows.
            </p>
          </div>

          {/* Footnotes */}
          <div className="text-[10px] text-slate-500 relative z-10 flex items-center gap-1.5 select-none font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> HIPAA & DICOM COMPLIANT SECURE HUB
          </div>
        </div>

        {/* Right Column: Dynamic Form Stage */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center bg-slate-950/40">
          
          {step === 'credentials' ? (
            /* Credentials submission card */
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-1.5 tracking-tight">
                  <Fingerprint className="w-5 h-5 text-indigo-400" /> Institution Gateway
                </h3>
                <p className="text-xs text-slate-400 mt-1">Provide your verified institutional credentials to enter the secure hub.</p>
              </div>

              {/* Demo profile quick selector */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-2 select-none">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Select Platform Portal
                </span>
                <p className="text-[10px] text-slate-500 mb-2">Choose your authorized portal account:</p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_USERS.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedDemoUser(user);
                        setEmail(user.email);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all truncate flex items-center justify-between cursor-pointer ${
                        selectedDemoUser.id === user.id
                          ? 'bg-indigo-900/50 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                          : 'bg-slate-950/40 text-slate-400 border-slate-800/60 hover:text-white hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="truncate">
                        <span className="block font-bold">{user.role === 'RADIOLOGIST' ? 'Radiologist' : 'Patient Portal'}</span>
                        <span className="block text-[9px] text-slate-400 font-normal truncate">{user.username.replace('dr_', 'Dr. ')}</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${user.role === 'RADIOLOGIST' ? 'bg-indigo-400' : 'bg-purple-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard inputs */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Institutional Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. dr.chen@medvision.org"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Security Password</label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      Forgot Key?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Key className="w-4 h-4" />
                    </span>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 select-none">
                  <input 
                    type="checkbox" 
                    id="remember-me-chk" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-indigo-500 rounded border-slate-800 bg-slate-950 cursor-pointer"
                  />
                  <label htmlFor="remember-me-chk" className="text-[10px] text-slate-400 font-medium cursor-pointer">
                    Remember my institutional terminal session
                  </label>
                </div>

                {/* Submit trigger */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
                  disabled={loading}
                >
                  {loading ? 'Authenticating Gate...' : 'Generate 2FA Token'} <ChevronRight className="w-4 h-4" />
                </button>

              </form>
            </div>
          ) : (
            /* Multi-factor Authenticator token verification */
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-1.5 tracking-tight">
                  <Fingerprint className="w-5 h-5 text-purple-400 animate-pulse" /> 2FA Multi-Factor Lock
                </h3>
                <p className="text-xs text-slate-400 mt-1">An institutional verification SMS containing your 2FA OTP security token has been dispatched.</p>
              </div>

              {/* Demo Hint Helper */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-center gap-2 select-none">
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Entering clinical simulator: any digits (e.g. <strong>123456</strong>) will satisfy local gateway verification checking.</span>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Security Token Code</label>
                  <input 
                    type="text" 
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP code..."
                    className="w-full text-center bg-slate-950 border border-slate-800 rounded-xl py-3 text-lg font-black tracking-[0.25em] text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Haven't received?</span>
                  <button type="button" className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer">
                    Re-dispatch code
                  </button>
                </div>

                {/* CTA actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/10"
                    disabled={loading}
                  >
                    {loading ? 'Decrypting Key...' : 'Verify & Enter'}
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
