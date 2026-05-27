import React, { useState } from 'react';
import { Fingerprint, Lock, User, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

export const LoginSystem: React.FC = () => {
  const { login } = useTelemetry();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const runBootDiagnostics = async () => {
    setIsBooting(true);
    const logs = [
      'SECURE ENCLAVE INITIALIZED // LINK_ID: PX-309',
      'CONNECTING TO INDUSTRIAL WS TELEMETRY FEED...',
      'ESTABLISHING WEBGL 3D DIGITAL TWIN SHADERS...',
      'MOUNTING CORE KINEMATICS CONTEXT MODELER...',
      'ACQUIRING NEURAL AUDIOWAVE ACOUSTICS DATA...',
      'SYNCHRONIZING FLEET CONTROL ALARM THRESHOLDS...',
      'SYSTEM AUTHENTICATION: SUCCESS. READY FOR OVERLORD.'
    ];

    for (let i = 0; i < logs.length; i++) {
      setBootLogs(prev => [...prev, `[OK] ${logs[i]}`]);
      // Increment progress bar smoothly
      const targetProg = Math.round(((i + 1) / logs.length) * 100);
      for (let p = bootProgress; p <= targetProg; p += 5) {
        setBootProgress(p);
        await new Promise(r => setTimeout(r, 60));
      }
    }

    await new Promise(r => setTimeout(r, 400));
    // Finalise login
    const success = await login(username, password);
    if (!success) {
      setErrorMsg('SYS_ERROR: DECRYPT_CREDENTIALS_FAILED');
      setIsBooting(false);
      setScanStatus('idle');
      setBootLogs([]);
      setBootProgress(0);
    }
  };

  const handleFingerprintScan = async () => {
    if (isScanning || isBooting) return;
    setIsScanning(true);
    setScanStatus('scanning');
    setErrorMsg('');

    // Simulate fingerprint analysis scan
    await new Promise(r => setTimeout(r, 2000));

    if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'operator') {
      setScanStatus('success');
      setIsScanning(false);
      // Run bootstrap diagnostic screens
      runBootDiagnostics();
    } else {
      setScanStatus('failed');
      setIsScanning(false);
      setErrorMsg('SYS_ERROR: FINGERPRINT_NOT_RECOGNIZED');
      setTimeout(() => setScanStatus('idle'), 3000);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBooting) return;
    setErrorMsg('');

    setIsScanning(true);
    setScanStatus('scanning');

    // Simulate database lookup
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'operator') {
      setScanStatus('success');
      setIsScanning(false);
      runBootDiagnostics();
    } else {
      setScanStatus('failed');
      setIsScanning(false);
      setErrorMsg('SYS_ERROR: INVALID_CREDENTIALS_SIGNATURE');
      setTimeout(() => setScanStatus('idle'), 3000);
    }
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative font-mono-tech select-none">
        {/* Futuristic scan grid */}
        <div className="absolute inset-0 matrix-bg-animated opacity-15"></div>
        <div className="hud-scanline"></div>

        <div className="glass-panel w-full max-w-xl p-8 relative rounded-xl border border-cyan-500/20 text-left">
          <div className="flex items-center gap-3 border-b border-cyan-500/10 pb-4 mb-6">
            <Terminal size={20} className="text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-orbitron font-extrabold text-white tracking-widest uppercase m-0">NEXUS SYSTEM BOOT SEQUENCE</h2>
          </div>

          {/* Console logs */}
          <div className="bg-slate-950/90 rounded-lg p-5 border border-slate-800 h-56 overflow-y-auto mb-6 flex flex-col gap-2.5 text-xs text-cyan-400/80">
            {bootLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2 items-start leading-relaxed">
                <span className="text-[9px] text-cyan-500/40">[{(idx + 1).toString().padStart(2, '0')}]</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="w-1.5 h-4 bg-cyan-400 animate-blink self-start mt-0.5"></div>
          </div>

          {/* Loading bar progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-orbitron text-slate-300">
              <span>DECRYPTING TELEMETRY ENVIRONMENT</span>
              <span className="text-cyan-400 font-bold">{bootProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                style={{ width: `${bootProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6 relative font-rajdhani select-none">
      {/* Sci-fi matrix particle network */}
      <div className="absolute inset-0 matrix-bg opacity-15"></div>
      <div className="hud-scanline"></div>

      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[450px] relative">
        <div className="glass-panel p-8 rounded-2xl relative border border-cyan-500/15 sci-fi-corners">
          {/* Inner corners helper */}
          <div className="corner-bottom-left"></div>
          <div className="corner-bottom-right"></div>

          {/* Header logo */}
          <div className="text-center mb-8">
            <h1 className="font-orbitron font-extrabold text-2xl tracking-widest text-white m-0 uppercase flex items-center justify-center gap-2">
              <span className="text-cyan-400 text-3xl font-light">N</span>EXUS
            </h1>
            <p className="text-[10px] text-cyan-400/80 font-mono-tech tracking-widest uppercase mt-1">AI ROBOTICS MANAGEMENT SUITE</p>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono-tech flex items-center gap-2.5">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fingerprint Scanner visual */}
          <div className="flex flex-col items-center mb-7">
            <button
              onClick={handleFingerprintScan}
              disabled={isScanning}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center border cursor-pointer transition-all duration-300 shadow-inner
                ${scanStatus === 'scanning' 
                  ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                  : scanStatus === 'success'
                    ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : scanStatus === 'failed'
                      ? 'border-rose-400 bg-rose-950/20 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-bounce'
                      : 'border-slate-800 bg-slate-900/60 hover:border-cyan-400/50 hover:bg-cyan-950/5'
                }`}
            >
              <Fingerprint 
                size={40} 
                className={`transition-colors duration-300
                  ${scanStatus === 'scanning' 
                    ? 'text-cyan-400 animate-pulse' 
                    : scanStatus === 'success'
                      ? 'text-emerald-400'
                      : scanStatus === 'failed'
                        ? 'text-rose-400'
                        : 'text-slate-400 hover:text-cyan-400'
                  }`}
              />

              {/* Bouncing laser line scanner overlay */}
              {scanStatus === 'scanning' && (
                <div className="absolute w-full h-[2px] bg-cyan-400 left-0 animate-scan shadow-[0_0_8px_rgba(6,182,212,0.8)] pointer-events-none"></div>
              )}
            </button>
            <span className="text-[10px] font-mono-tech text-slate-400 tracking-wider mt-3 uppercase">
              {scanStatus === 'scanning' 
                ? 'COMPARING BIOMETRIC ID...' 
                : scanStatus === 'success'
                  ? 'ID RECOGNIZED // BOOTING'
                  : scanStatus === 'failed'
                    ? 'ACCESS DENIED // FINGERPRINT MISMATCH'
                    : 'TAP SENSOR FOR FAST BIOMETRIC ID'}
            </span>
          </div>

          <div className="relative flex items-center justify-center my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <span className="relative px-3 text-[10px] font-mono-tech text-slate-500 bg-[#080d19] uppercase">OR SECURITY PASSCODE</span>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider block">Operator Node ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono-tech"
                  placeholder="e.g., admin"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider block">Decrypt Security Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono-tech"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="w-full btn-futuristic py-2.5 text-xs tracking-widest font-bold mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} />
              AUTHORIZE ACCESS
            </button>
          </form>

          {/* Footer credentials advice */}
          <div className="mt-6 text-center">
            <span className="text-[9px] font-mono-tech text-slate-500">
              DEFAULT SEED OPERATOR: <span className="text-cyan-400">admin</span> // KEY: <span className="text-cyan-400">password</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
