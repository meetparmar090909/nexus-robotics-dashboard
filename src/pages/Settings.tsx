import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Sliders, Bell, Key } from 'lucide-react';

export const Settings: React.FC = () => {
  const [thermalLimit, setThermalLimit] = useState(60);
  const [velocityLimit, setVelocityLimit] = useState(3.0);
  const [aiConfidence, setAiConfidence] = useState(95);
  const [notifyPreferences, setNotifyPreferences] = useState({
    audioAlarm: true,
    emailAlerts: false,
    securityLockout: true,
    syslogLogs: true
  });
  const [themeMode, setThemeMode] = useState('cyan');
  const [apiKey, setApiKey] = useState('NEX_SECURE_8803_KEY_SH5');

  const handleTogglePreference = (key: 'audioAlarm' | 'emailAlerts' | 'securityLockout' | 'syslogLogs') => {
    setNotifyPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('SYSTEM CONFIGURATION WRITE: SUCCESSFUL.');
  };

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">CORE SYSTEM CONFIGURATION</span>
          <h2 className="text-lg font-orbitron font-extrabold text-white uppercase">System Settings</h2>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Side: Parameters sliders & preferences (2 columns span) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Sliders thresholds */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-5">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
              <Sliders size={14} />
              <span className="text-xs font-orbitron font-bold uppercase tracking-wider">Alarm & Sensor Bounds</span>
            </div>

            <div className="space-y-4 text-xs font-mono-tech text-slate-400">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Critical Joint Temperature Limit</span>
                  <span className="text-white font-bold">{thermalLimit}°C</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="90" 
                  value={thermalLimit} 
                  onChange={e => setThermalLimit(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Maximum Conveyor Belt Velocity</span>
                  <span className="text-white font-bold">{velocityLimit.toFixed(1)} m/s</span>
                </div>
                <input 
                  type="range" 
                  min="2.0" 
                  max="4.5" 
                  step="0.1"
                  value={velocityLimit} 
                  onChange={e => setVelocityLimit(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Minimum AI Model Confidence Filter</span>
                  <span className="text-white font-bold">{aiConfidence}%</span>
                </div>
                <input 
                  type="range" 
                  min="80" 
                  max="99" 
                  value={aiConfidence} 
                  onChange={e => setAiConfidence(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Preferences checkboxes */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-5">
            <div className="flex items-center gap-2 text-purple-400 border-b border-slate-800 pb-3">
              <Bell size={14} />
              <span className="text-xs font-orbitron font-bold uppercase tracking-wider">Warning Dispatch Preferences</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono-tech text-slate-400">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-900 cursor-pointer hover:border-purple-400/30">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-bold">Sound Wave Alarms</span>
                  <span className="text-[10px] text-slate-500 leading-snug">Acoustic horn trigger at workstation</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyPreferences.audioAlarm}
                  onChange={() => handleTogglePreference('audioAlarm')}
                  className="accent-purple-400 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-900 cursor-pointer hover:border-purple-400/30">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-bold">Field Engineer Logs</span>
                  <span className="text-[10px] text-slate-500 leading-snug">Auto dispatch email diagnostics report</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyPreferences.emailAlerts}
                  onChange={() => handleTogglePreference('emailAlerts')}
                  className="accent-purple-400 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-900 cursor-pointer hover:border-purple-400/30">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-bold">Security Lockout</span>
                  <span className="text-[10px] text-slate-500 leading-snug">Halt conveyor upon critical welder alarm</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyPreferences.securityLockout}
                  onChange={() => handleTogglePreference('securityLockout')}
                  className="accent-purple-400 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-900 cursor-pointer hover:border-purple-400/30">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white font-bold">Syslog Console Logs</span>
                  <span className="text-[10px] text-slate-500 leading-snug">Keep local database logging buffers</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifyPreferences.syslogLogs}
                  onChange={() => handleTogglePreference('syslogLogs')}
                  className="accent-purple-400 w-3.5 h-3.5"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Security API Tokens & Theme (1 column) */}
        <div className="space-y-6 xl:col-span-1">
          {/* API keys */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
              <Key size={14} />
              <span className="text-xs font-orbitron font-bold uppercase tracking-wider">Access Tokens</span>
            </div>

            <div className="space-y-3 text-xs font-mono-tech text-slate-400">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase block">Telemetry API key</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase block">Model Endpoint URL</label>
                <input 
                  type="text"
                  disabled
                  value="https://api.nexus-robotics.io/v1/inference"
                  className="w-full bg-slate-950 border border-slate-850 opacity-55 rounded-lg py-2 px-3 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Theme customizers */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
            <div className="flex items-center gap-2 text-purple-400 border-b border-slate-800 pb-3">
              <Shield size={14} />
              <span className="text-xs font-orbitron font-bold uppercase tracking-wider">Theme Matrix Color</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech">
              {(['cyan', 'purple', 'carbon'] as const).map(theme => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setThemeMode(theme)}
                  className={`py-2 rounded border uppercase font-bold tracking-wider cursor-pointer
                    ${themeMode === theme 
                      ? theme === 'cyan' 
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                        : theme === 'purple'
                          ? 'bg-purple-500/10 border-purple-400 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.15)]'
                          : 'bg-slate-800 border-white text-white'
                      : 'bg-transparent border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-futuristic py-3 text-xs tracking-widest font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.1)]"
          >
            <SettingsIcon size={14} />
            COMMIT SYSTEM SETTINGS
          </button>
        </div>
      </form>
    </div>
  );
};
