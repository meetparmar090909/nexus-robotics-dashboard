import React, { useState } from 'react';
import { 
  Play, Pause, Sliders, Settings, MessageSquare, Send, 
  Activity, Zap, ShieldAlert, Cpu, Workflow, BarChart3, Clock
} from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';
import { RobotArm3D } from '../components/RobotArm3D';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { telemetry, updateConveyorSpeed, overrideRobotJoint, sendChatMessage, setRobotArmMode, setManualRobotArmJoints } = useTelemetry();
  const [chatInput, setChatInput] = useState('');
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const activeAlerts = telemetry.alerts.filter(a => !a.acknowledged);

  // Radar data mapping robot efficiencies
  const radarData = telemetry.robots.map(r => ({
    subject: r.name.split(' ')[1] || r.name,
    efficiency: r.efficiency,
    failureRisk: r.failureRisk,
    fullMark: 100,
  }));

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleConveyorSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConveyorSpeed(parseFloat(e.target.value));
  };

  const handleManualJointChange = (idx: number, val: number) => {
    setManualRobotArmJoints(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6 text-left">
      {/* 1. Hero Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status card */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/10 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center neon-border-cyan shrink-0">
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-cyan-400 font-mono-tech uppercase tracking-wider">SYSTEM FLEET STATE</p>
            <h2 className="text-xl font-orbitron font-extrabold text-white m-0">OPERATIONAL</h2>
            <p className="text-[10px] text-slate-400 font-mono-tech mt-0.5">{telemetry.activeRobotsCount} / {telemetry.totalRobots} NODES ACTIVE</p>
          </div>
        </div>

        {/* Throughput card */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/10 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
            <Workflow className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-blue-400 font-mono-tech uppercase tracking-wider">LINE THROUGHPUT</p>
            <h2 className="text-xl font-orbitron font-extrabold text-white m-0">{telemetry.factoryThroughput} P/M</h2>
            <p className="text-[10px] text-slate-400 font-mono-tech mt-0.5">SPEED: {telemetry.conveyorSpeed.toFixed(1)} M/S</p>
          </div>
        </div>

        {/* Energy card */}
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/10 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-400/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-purple-400 font-mono-tech uppercase tracking-wider">ELECTRICAL GRID DRAW</p>
            <h2 className="text-xl font-orbitron font-extrabold text-white m-0">{telemetry.energyConsumption} kW</h2>
            <p className="text-[10px] text-slate-400 font-mono-tech mt-0.5">DIAGNOSTIC FACTOR: 98%</p>
          </div>
        </div>

        {/* Warnings Card */}
        <div className={`glass-panel p-4 rounded-xl border flex items-center gap-4 relative overflow-hidden transition-all
          ${activeAlerts.length > 0 
            ? 'border-rose-500/30 bg-rose-950/5' 
            : 'border-cyan-500/10'}`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shrink-0
            ${activeAlerts.length > 0
              ? 'bg-rose-500/20 border-rose-400/40 animate-pulse'
              : 'bg-slate-900/80 border-slate-800'}`}>
            <ShieldAlert className={`w-6 h-6 ${activeAlerts.length > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-[10px] font-mono-tech uppercase tracking-wider text-rose-400">UNRESOLVED ALARMS</p>
            <h2 className="text-xl font-orbitron font-extrabold text-white m-0">{activeAlerts.length}</h2>
            <p className="text-[10px] text-slate-400 font-mono-tech mt-0.5">CRITICAL STATES CHECKED</p>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: 3D Twin & Control Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Visualizer Canvas (Left/Center span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5 rounded-2xl relative border border-cyan-500/10">
            <RobotArm3D />
          </div>

          {/* Conveyor Belt Tracker Panel */}
          <div className="glass-panel p-5 rounded-2xl relative border border-cyan-500/10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">CONVEYOR TRACKING AND METRICS</span>
                <span className="text-sm font-orbitron font-bold text-white uppercase">Active Assembly Line Belt</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono-tech">Belt Velocity:</span>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.5" 
                  step="0.1"
                  value={telemetry.conveyorSpeed}
                  onChange={handleConveyorSpeedChange}
                  className="w-32 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-xs text-white font-mono-tech font-medium w-12">{telemetry.conveyorSpeed.toFixed(1)} m/s</span>
              </div>
            </div>

            {/* Conveyor belt graphic path */}
            <div className="relative h-20 bg-slate-950/80 rounded-xl border border-slate-900 overflow-hidden p-2 flex items-center shadow-inner">
              {/* Conveyor line marks */}
              <div className="absolute inset-x-0 h-[2px] bg-slate-800 top-1/2 -translate-y-1/2 border-dashed border-t border-slate-700/60 opacity-60"></div>
              
              {/* Live Sliding conveyor items */}
              {telemetry.conveyorItems.map(item => (
                <div
                  key={item.id}
                  className="absolute -translate-y-1/2 top-1/2 transition-all duration-300 ease-linear"
                  style={{ left: `${item.progress}%` }}
                >
                  <div className={`px-2.5 py-1 rounded border text-[10px] font-mono-tech select-none flex flex-col items-center gap-0.5 shadow-md
                    ${item.status === 'inspecting'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 animate-pulse'
                      : item.status === 'rejected'
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                        : item.status === 'assembled'
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                >
                    <span className="font-semibold uppercase">{item.type}</span>
                    <span className="text-[8px] opacity-75">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Robotic Arm Manual Controls (Right col) */}
        <div className="glass-panel p-5 rounded-2xl relative border border-cyan-500/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">REMOTE OVERRIDE INTERFACE</span>
                <span className="text-sm font-orbitron font-bold text-white uppercase">Joint Angle Controllers</span>
              </div>
              <Sliders size={16} className="text-cyan-400" />
            </div>

            {/* Auto/Manual toggle */}
            <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-1">
              <button
                onClick={() => setRobotArmMode('auto')}
                className={`flex-1 py-1.5 rounded font-orbitron text-xs tracking-wider transition-colors cursor-pointer
                  ${telemetry.robotArmMode === 'auto' 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/25' 
                    : 'text-slate-400 hover:text-white'}`}
              >
                AUTOMATIC RUN
              </button>
              <button
                onClick={() => setRobotArmMode('manual')}
                className={`flex-1 py-1.5 rounded font-orbitron text-xs tracking-wider transition-colors cursor-pointer
                  ${telemetry.robotArmMode === 'manual' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-400/25' 
                    : 'text-slate-400 hover:text-white'}`}
              >
                MANUAL TWIN
              </button>
            </div>

            {/* Sliders grid */}
            <div className="space-y-4 pt-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono-tech">
                    <span className="text-slate-400">AXIS-A{idx + 1} (JOINT)</span>
                    <span className="text-cyan-400 font-bold">
                      {telemetry.manualRobotArmJoints[idx]?.toFixed(1)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={idx === 1 || idx === 2 || idx === 4 ? '-90' : '-180'}
                    max={idx === 1 || idx === 2 || idx === 4 ? '90' : '180'}
                    step="1"
                    disabled={telemetry.robotArmMode === 'auto'}
                    value={telemetry.manualRobotArmJoints[idx] || 0}
                    onChange={(e) => handleManualJointChange(idx, parseInt(e.target.value))}
                    className={`w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer
                      ${telemetry.robotArmMode === 'auto' ? 'opacity-40 cursor-not-allowed' : 'accent-amber-400'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-800 mt-4 text-[10px] font-mono-tech text-slate-500">
            * MANUAL LINK locks kinematics variables. Automatically disconnects from standard conveyor sync loop.
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Charts, Heatmap & AI Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart (Power diagnostics) */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">ELECTRICAL GRID GRID LOAD</span>
              <span className="text-sm font-orbitron font-bold text-white uppercase">Power Draw vs Predictions</span>
            </div>
            <Zap size={16} className="text-cyan-400" />
          </div>

          <div className="h-56 w-full text-xs font-mono-tech">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry.historicalPower}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7f00ff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#7f00ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" tickLine={false} />
                <YAxis stroke="#475569" domain={['auto', 'auto']} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090f1e', borderColor: 'rgba(0, 242, 254, 0.2)', borderRadius: '8px' }} 
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="power" name="Power Draw (kW)" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#colorPower)" />
                <Area type="monotone" dataKey="prediction" name="ML Prediction" stroke="#7f00ff" strokeWidth={1} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorPrediction)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Factory Heatmap Floor Sector representation */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">THERMAL HEATMAP SENSOR</span>
              <span className="text-sm font-orbitron font-bold text-white uppercase">Factory Floor Load Grid</span>
            </div>
            <BarChart3 size={16} className="text-cyan-400" />
          </div>

          {/* 5x5 Sector Heatmap Layout */}
          <div className="grid grid-cols-5 gap-2 my-auto">
            {Array.from({ length: 25 }).map((_, idx) => {
              const sectorId = `SEC-${String.fromCharCode(65 + Math.floor(idx / 5))}${idx % 5 + 1}`;
              // Make sector E3 (welder) and C2 Spot alert states
              let heatColor = 'rgba(0, 242, 254, 0.08)'; // normal cyan
              let borderColor = 'rgba(0, 242, 254, 0.15)';
              let statusText = 'STABLE // 32°C';
              
              if (sectorId === 'SEC-E3') {
                heatColor = 'rgba(239, 68, 68, 0.2)'; // critical welder
                borderColor = 'rgba(239, 68, 68, 0.5)';
                statusText = 'CRITICAL // 68°C';
              } else if (sectorId === 'SEC-C2') {
                heatColor = 'rgba(245, 158, 11, 0.15)'; // warning spot
                borderColor = 'rgba(245, 158, 11, 0.4)';
                statusText = 'WARNING // 45°C';
              } else if (idx % 6 === 0) {
                heatColor = 'rgba(0, 242, 254, 0.15)';
                statusText = 'ACTIVE // 38°C';
              }

              const isHovered = hoveredSector === sectorId;

              return (
                <div
                  key={sectorId}
                  onMouseEnter={() => setHoveredSector(sectorId)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className="aspect-square rounded border transition-all duration-200 cursor-pointer flex items-center justify-center relative group"
                  style={{ 
                    backgroundColor: isHovered ? heatColor.replace('0.08', '0.25').replace('0.15', '0.3') : heatColor, 
                    borderColor: isHovered ? '#00f2fe' : borderColor 
                  }}
                >
                  <span className="text-[10px] font-mono-tech font-bold text-slate-400 group-hover:text-white">
                    {sectorId.split('-')[1]}
                  </span>

                  {/* Tooltip Overlay */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-2 bg-[#090f1e] border border-cyan-500/25 p-2 rounded text-[9px] font-mono-tech text-white whitespace-nowrap z-10 shadow-2xl">
                      <div className="font-semibold text-cyan-400">{sectorId}</div>
                      <div>STATE: {statusText}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-[10px] font-mono-tech text-slate-500 pt-3 border-t border-slate-900">
            Hover over coordinates grid to scan infrared sensory telemetry.
          </div>
        </div>

        {/* AI Assistant Chatbot Console */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4 flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">AI AUTONOMOUS AGENT COMMANDS</span>
              <span className="text-sm font-orbitron font-bold text-white uppercase">Command Assistant Widget</span>
            </div>
            <MessageSquare size={16} className="text-cyan-400" />
          </div>

          {/* Chat history area */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-900 p-4 flex-grow h-44 overflow-y-auto space-y-3 flex flex-col">
            {telemetry.chatbotMessages.map(msg => (
              <div 
                key={msg.id}
                className={`max-w-[85%] rounded-lg p-2.5 text-xs text-left flex flex-col gap-1
                  ${msg.sender === 'user' 
                    ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-100 self-end' 
                    : 'bg-purple-500/10 border border-purple-400/20 text-purple-100 self-start'}`}
              >
                <span className="text-[8px] text-slate-400/80 font-mono-tech uppercase">
                  {msg.sender === 'user' ? 'OPERATOR-HUD' : 'SYS-AI CORE'} • {msg.timestamp}
                </span>
                <p className="m-0 leading-normal">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Chat input box */}
          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              placeholder="Query system (e.g. 'R-05 temperature')"
            />
            <button
              type="submit"
              className="p-2 btn-futuristic rounded-lg shrink-0 flex items-center justify-center cursor-pointer"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
