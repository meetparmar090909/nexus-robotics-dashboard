import React, { useState } from 'react';
import { 
  Cpu, RotateCcw, AlertTriangle, ShieldCheck, Thermometer, 
  Battery, Play, Power, Navigation, RefreshCw, Terminal 
} from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

export const RobotMonitoring: React.FC = () => {
  const { telemetry, overrideRobotJoint, rebootRobot } = useTelemetry();
  const [selectedRobotId, setSelectedRobotId] = useState<string>('R-01');

  const selectedRobot = telemetry.robots.find(r => r.id === selectedRobotId) || telemetry.robots[0];

  const handleReboot = () => {
    rebootRobot(selectedRobot.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'maintenance': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'offline': return 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse';
      case 'calibrating': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 animate-pulse';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6 text-left">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Side: Robot List Fleet (1 column) */}
        <div className="space-y-4 xl:col-span-1">
          <div className="flex flex-col mb-1">
            <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">ACTIVE NODE DATABASE</span>
            <h2 className="text-lg font-orbitron font-extrabold text-white uppercase">Fleet Node Listing</h2>
          </div>

          <div className="space-y-3">
            {telemetry.robots.map((robot) => {
              const isSelected = robot.id === selectedRobotId;
              const statusPill = getStatusColor(robot.status);
              
              return (
                <div
                  key={robot.id}
                  onClick={() => setSelectedRobotId(robot.id)}
                  className={`glass-panel p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden
                    ${isSelected 
                      ? 'border-cyan-500 bg-cyan-950/5 shadow-[0_0_15px_rgba(0,242,254,0.1)]' 
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'}`}
                >
                  {/* Glowing vertical selected marker */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-orbitron font-extrabold text-white tracking-wide">{robot.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono-tech uppercase">{robot.id} • TYPE: {robot.type}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-mono-tech uppercase font-semibold ${statusPill}`}>
                      {robot.status}
                    </span>
                  </div>

                  {/* Quick Telemetry metrics */}
                  {robot.status !== 'offline' && (
                    <div className="grid grid-cols-3 gap-3 border-t border-slate-800/60 pt-2.5 text-xs font-mono-tech">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Thermometer size={12} className={robot.temperature > 55 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'} />
                        <span className={robot.temperature > 55 ? 'text-rose-300 font-semibold' : 'text-slate-200'}>
                          {robot.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Battery size={12} className={robot.battery < 20 ? 'text-rose-400 animate-blink' : 'text-emerald-400'} />
                        <span className="text-slate-200">{robot.battery}%</span>
                      </div>
                      <div className="text-right text-slate-400">
                        RISK: <span className={robot.failureRisk > 50 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-200'}>
                          {robot.failureRisk}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Robot Diagnostic Cockpit (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/10 space-y-6 relative overflow-hidden">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 matrix-bg opacity-5 pointer-events-none"></div>

            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center neon-border-cyan">
                  <Cpu className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-orbitron font-extrabold text-white uppercase tracking-wide">{selectedRobot.name}</h2>
                  <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">UNIT SECURITY NODE IDENT: {selectedRobot.id}</span>
                </div>
              </div>

              {/* Action commands */}
              <div className="flex gap-2">
                <button
                  onClick={handleReboot}
                  disabled={selectedRobot.status === 'calibrating'}
                  className="btn-futuristic py-2 px-4 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw size={12} className={selectedRobot.status === 'calibrating' ? 'animate-spin' : ''} />
                  CALIBRATE / REBOOT
                </button>
                <button
                  onClick={() => alert(`EMERGENCY SHUTDOWN NODE ${selectedRobot.id} INITIATED!`)}
                  className="px-4 py-2 bg-rose-500/15 border border-rose-500/35 hover:bg-rose-500/30 text-rose-400 rounded-lg text-xs font-orbitron font-bold tracking-wider cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.15)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                >
                  HALT UNIT
                </button>
              </div>
            </div>

            {/* Main specs table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono-tech">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                <span className="text-slate-500 block mb-1">NODE EFFICIENCY</span>
                <span className="text-base text-cyan-400 font-orbitron font-bold">{selectedRobot.efficiency.toFixed(1)}%</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                <span className="text-slate-500 block mb-1">PAYLOAD LOAD</span>
                <span className="text-base text-white font-orbitron font-bold">{selectedRobot.load} kg</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                <span className="text-slate-500 block mb-1">WEAR FACTOR RATING</span>
                <span className={`text-base font-orbitron font-bold ${selectedRobot.failureRisk > 50 ? 'text-rose-400 glow-text-red' : 'text-emerald-400'}`}>
                  {selectedRobot.failureRisk}%
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                <span className="text-slate-500 block mb-1">LAST CALIBRATION</span>
                <span className="text-base text-slate-300 font-orbitron font-semibold">{selectedRobot.lastMaintenance}</span>
              </div>
            </div>

            {/* 3D joint coordinates & spatial values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Coordinates */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-950/20 space-y-4">
                <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block border-b border-slate-900 pb-2">
                  SPATIAL VECTOR LOCATION
                </span>
                
                <div className="flex justify-around items-center py-4 relative">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-mono-tech">AXIS_X</span>
                    <span className="text-base font-orbitron font-extrabold text-white">{selectedRobot.coordinates.x.toFixed(1)}m</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-mono-tech">AXIS_Y</span>
                    <span className="text-base font-orbitron font-extrabold text-white">{selectedRobot.coordinates.y.toFixed(1)}m</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-mono-tech">AXIS_Z</span>
                    <span className="text-base font-orbitron font-extrabold text-white">{selectedRobot.coordinates.z.toFixed(1)}m</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono-tech text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-900">
                  <Navigation size={12} className="text-cyan-400" />
                  <span>LOCATION: ASSEMBLY WAREHOUSE FLOOR SECTION 4B</span>
                </div>
              </div>

              {/* Active alerts log box */}
              <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-950/20 space-y-3 flex flex-col justify-between">
                <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block border-b border-slate-900 pb-2">
                  ACTIVE CRITICAL ALARMS
                </span>

                <div className="flex-grow flex flex-col justify-center gap-2">
                  {telemetry.alerts.filter(a => a.robotId === selectedRobot.id).length === 0 ? (
                    <div className="text-center py-4 flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono-tech">
                      <ShieldCheck size={16} />
                      <span>NO ALARM DETECTED // HEALTH NOMINAL</span>
                    </div>
                  ) : (
                    telemetry.alerts.filter(a => a.robotId === selectedRobot.id).map(alert => (
                      <div 
                        key={alert.id} 
                        className={`p-2 rounded border text-xs font-mono-tech flex items-start gap-2.5
                          ${alert.severity === 'critical' 
                            ? 'bg-rose-950/30 border-rose-500/35 text-rose-300' 
                            : 'bg-amber-950/30 border-amber-500/35 text-amber-300'}`}
                      >
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <div className="flex-grow">
                          <div className="font-bold uppercase text-[9px] mb-0.5">{alert.severity} ({alert.id})</div>
                          <div className="text-slate-200 text-[10px] leading-snug">{alert.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Slider controls for Selected Robot joints */}
            {selectedRobot.status !== 'offline' && (
              <div className="border-t border-slate-800 pt-5 space-y-4">
                <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block">
                  AXIS JOINT DRIVER OVERRIDES (CALIBRATED ANGLE ADJUSTMENT)
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {selectedRobot.joints.map((joint, jIdx) => (
                    <div key={jIdx} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono-tech">
                        <span className="text-slate-400">AXIS J{jIdx + 1}</span>
                        <span className="text-cyan-400 font-bold">{joint.toFixed(1)}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="1.0"
                        value={joint}
                        onChange={(e) => overrideRobotJoint(selectedRobot.id, jIdx, parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Console Log Terminal */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block flex items-center gap-1.5">
                <Terminal size={12} />
                CONSOLE METRIC PACKETS LOG
              </span>

              <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-900 font-mono-tech text-[10px] text-cyan-500/80 space-y-1 h-32 overflow-y-auto">
                <div>[04:12:09] SYSTEM: Init security handshake for node {selectedRobot.id}. Response latency: 12ms.</div>
                {selectedRobot.status === 'calibrating' && (
                  <>
                    <div className="text-cyan-400">[04:12:12] TELEMETRY: Initiating sensor auto-cal...</div>
                    <div className="text-cyan-400">[04:12:14] TELEMETRY: Aligning kinematic vectors...</div>
                  </>
                )}
                {selectedRobot.status === 'maintenance' && (
                  <div className="text-amber-400">[04:12:10] WARN: Critical joint temperature spike detected. Diagnostic wear limit exceeded!</div>
                )}
                {selectedRobot.status === 'offline' && (
                  <div className="text-rose-400">[04:11:00] ERROR: Lost ping connection. Check emergency bus physical link!</div>
                )}
                <div>[04:12:15] BROADCAST: WS transmission sync complete. Load scale factor: {selectedRobot.load}kg. Efficiency index: {selectedRobot.efficiency.toFixed(2)}%.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
