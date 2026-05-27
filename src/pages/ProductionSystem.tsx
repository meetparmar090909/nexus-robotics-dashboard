import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Hammer, Eye, Package, RotateCw, 
  TrendingUp, Settings, ChevronRight, CheckCircle2,
  Plus, Trash2
} from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

export const ProductionSystem: React.FC = () => {
  const { telemetry, updateConveyorSpeed, toggleHoldItem, ejectItem, addConveyorItem } = useTelemetry();
  const [conveyorRunning, setConveyorRunning] = useState(true);
  const [totalAssembledToday, setTotalAssembledToday] = useState(14820);
  const [totalRejectedToday, setTotalRejectedToday] = useState(154);
  const [customItemName, setCustomItemName] = useState('');

  // Increment assembled counters slowly based on current throughput
  useEffect(() => {
    if (!conveyorRunning) return;
    const interval = setInterval(() => {
      setTotalAssembledToday(prev => prev + 1);
      // occasional rejection
      if (Math.random() > 0.96) {
        setTotalRejectedToday(prev => prev + 1);
      }
    }, (60 / telemetry.factoryThroughput) * 1000);

    return () => clearInterval(interval);
  }, [conveyorRunning, telemetry.factoryThroughput]);

  const toggleConveyor = () => {
    if (conveyorRunning) {
      updateConveyorSpeed(0);
      setConveyorRunning(false);
    } else {
      updateConveyorSpeed(1.8);
      setConveyorRunning(true);
    }
  };

  const handleInjectCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;
    addConveyorItem(customItemName.trim());
    setCustomItemName('');
  };

  const linePhases = [
    { name: 'Stage 1: Chassis Mount', desc: 'Raw chassis loading', icon: Hammer, status: 'Active' },
    { name: 'Stage 2: Core Electronics', desc: 'Wiring & module drop', icon: Settings, status: 'Active' },
    { name: 'Stage 3: Robotic Welding', desc: 'High-precision titanium welding', icon: RotateCw, status: 'Active' },
    { name: 'Stage 4: CV Quality Scan', desc: 'Neural network inspection check', icon: Eye, status: 'Active' },
    { name: 'Stage 5: Sorting & Vault', desc: 'Cargo sorting and packaging', icon: Package, status: 'Ready' }
  ];

  const passYield = parseFloat(((totalAssembledToday / (totalAssembledToday + totalRejectedToday)) * 100).toFixed(2));

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Schematic Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">FACTORY LINE DIGITAL MAP</span>
          <h2 className="text-lg font-orbitron font-extrabold text-white uppercase">Production Core Systems</h2>
        </div>

        {/* Line speed & control */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <button
            onClick={toggleConveyor}
            className={`px-3 py-1.5 rounded-lg font-orbitron text-xs font-bold tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors
              ${conveyorRunning 
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}
          >
            {conveyorRunning ? <Pause size={12} /> : <Play size={12} />}
            {conveyorRunning ? 'HALT ASSEMBLY' : 'RUN ASSEMBLY'}
          </button>

          <div className="w-[1px] h-6 bg-slate-800"></div>

          <div className="text-xs font-mono-tech text-slate-300 flex items-center gap-2">
            <span>BELT SPEED:</span>
            <span className="text-cyan-400 font-bold">{telemetry.conveyorSpeed.toFixed(1)} M/S</span>
          </div>
        </div>
      </div>

      {/* Assembly line phases schematic (Horizontal layout) */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/10 relative overflow-hidden">
        {/* Ambient Grid overlay */}
        <div className="absolute inset-0 matrix-bg opacity-5 pointer-events-none"></div>

        <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block mb-6">
          ASSEMBLY STAGES SCHEMATIC
        </span>

        {/* Phase boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative">
          {linePhases.map((phase, idx) => {
            const PhaseIcon = phase.icon;
            const isLast = idx === linePhases.length - 1;
            return (
              <React.Fragment key={idx}>
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3 relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="w-6 h-6 rounded bg-slate-900 border border-slate-700/50 flex items-center justify-center font-mono-tech text-xs text-cyan-400">
                      {idx + 1}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono-tech uppercase font-semibold
                      ${phase.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'}`}>
                      {phase.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-1.5">
                    <PhaseIcon className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-orbitron font-bold text-white uppercase">{phase.name.split(': ')[1]}</span>
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans leading-normal m-0">{phase.desc}</p>
                </div>

                {!isLast && (
                  <div className="hidden lg:flex items-center justify-center text-cyan-500/40">
                    <ChevronRight size={24} className="animate-pulse" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Conveyor Belt Override Console */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">WORKPIECE INJECTION & HOLD OVERRIDES</span>
            <span className="text-sm font-orbitron font-bold text-white uppercase">Live Conveyor Control Cockpit</span>
          </div>

          {/* Form to inject custom workpiece */}
          <form onSubmit={handleInjectCustomItem} className="flex gap-2 text-xs font-mono-tech">
            <input
              type="text"
              value={customItemName}
              onChange={e => setCustomItemName(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-505 focus:outline-none focus:border-cyan-400 w-44 md:w-56"
              placeholder="Custom workpiece name..."
            />
            <button
              type="submit"
              className="btn-futuristic px-3.5 py-2 font-bold cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={12} />
              INJECT
            </button>
          </form>
        </div>

        {/* The Live Conveyor Belt */}
        <div className="relative h-20 bg-slate-950/80 rounded-xl border border-slate-900 overflow-hidden p-2 flex items-center shadow-inner">
          <div className="absolute inset-x-0 h-[2px] bg-slate-800 top-1/2 -translate-y-1/2 border-dashed border-t border-slate-700/60 opacity-60"></div>
          
          {telemetry.conveyorItems.map(item => (
            <div
              key={item.id}
              className="absolute -translate-y-1/2 top-1/2 transition-all duration-300 ease-linear"
              style={{ left: `${item.progress}%` }}
            >
              <div className={`px-2.5 py-1 rounded border text-[10px] font-mono-tech select-none flex flex-col items-center gap-0.5 shadow-md
                ${item.status === 'held'
                  ? 'bg-amber-950/60 border-amber-500/70 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse'
                  : item.status === 'inspecting'
                    ? 'bg-blue-950/40 border-blue-500/50 text-blue-300'
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
          {telemetry.conveyorItems.length === 0 && (
            <div className="mx-auto text-xs text-slate-500 font-mono-tech uppercase">CONVEYOR EMPTY // AWAITING INJECTION</div>
          )}
        </div>

        {/* List of active workpieces with override actions */}
        <div className="space-y-3">
          <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block">
            ACTIVE WORKPIECES ROSTER
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {telemetry.conveyorItems.map(item => (
              <div 
                key={item.id} 
                className={`p-3 rounded-xl border flex justify-between items-center bg-slate-900/40 transition-all
                  ${item.status === 'held' ? 'border-amber-500/40 bg-amber-950/5' : 'border-slate-800'}`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-orbitron font-extrabold text-white uppercase flex items-center gap-2">
                    {item.type}
                    {item.status === 'held' && (
                      <span className="text-[8px] font-mono-tech bg-amber-500/10 border border-amber-500/30 px-1 rounded text-amber-400">HELD</span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono-tech">
                    ID: {item.id.substring(0, 10)} • PROGRESS: {item.progress.toFixed(0)}%
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleHoldItem(item.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono-tech font-bold tracking-wider cursor-pointer border transition-colors
                      ${item.status === 'held'
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'}`}
                  >
                    {item.status === 'held' ? 'RESUME' : 'HOLD'}
                  </button>
                  <button
                    onClick={() => ejectItem(item.id)}
                    className="p-1 rounded text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500/60 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Eject Workpiece (Hold Out)"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono-tech">
        {/* Yield Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
          <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block">
            DAILY QUALITY PASS RATE
          </span>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-orbitron font-extrabold text-white">{passYield}%</h2>
              <span className="text-[10px] font-mono-tech text-slate-500 uppercase">QA SCAN CLASSIFICATION</span>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Spinning circular border */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/25 animate-spin"></div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${passYield}%` }}></div>
          </div>
        </div>

        {/* Daily Assembled Parts */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
          <span className="text-[10px] text-blue-400 font-mono-tech tracking-wider uppercase block">
            TOTAL ASSEMBLED PARTS
          </span>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-orbitron font-extrabold text-white">{totalAssembledToday.toLocaleString()}</h2>
              <span className="text-[10px] font-mono-tech text-slate-500 uppercase">TARGET DAILY: 20,000 PARTS</span>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>

          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(totalAssembledToday / 20000) * 100}%` }}></div>
          </div>
        </div>

        {/* Rejected parts */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
          <span className="text-[10px] text-rose-400 font-mono-tech tracking-wider uppercase block">
            DEFECT REJECTS COUNTER
          </span>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-orbitron font-extrabold text-rose-400">{totalRejectedToday}</h2>
              <span className="text-[10px] font-mono-tech text-slate-500 uppercase">REJECT RATIO: {(100 - passYield).toFixed(2)}%</span>
            </div>
            <div className="w-10 h-10 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <span className="text-xs font-mono-tech text-rose-400">QA_FLG</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${Math.min(((totalRejectedToday / 300) * 100), 100)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
