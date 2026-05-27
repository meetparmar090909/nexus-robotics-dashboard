import React, { useState } from 'react';
import { Wrench, Calendar, AlertTriangle, ShieldCheck, Plus, Terminal } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

interface MaintenanceTicket {
  id: string;
  robotId: string;
  component: string;
  type: 'preventive' | 'corrective' | 'calibration';
  scheduledDate: string;
  technician: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export const MaintenanceCenter: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    { id: 'TKT-901', robotId: 'R-05', component: 'Welding Nozzle J3', type: 'corrective', scheduledDate: '2026-05-25', technician: 'M. Patel', status: 'in_progress' },
    { id: 'TKT-902', robotId: 'R-03', component: 'Hydraulic Seals', type: 'preventive', scheduledDate: '2026-05-28', technician: 'S. Cooper', status: 'pending' },
    { id: 'TKT-903', robotId: 'R-01', component: 'Base Bearing Ring', type: 'calibration', scheduledDate: '2026-05-30', technician: 'A. Chen', status: 'pending' }
  ]);

  const [newTicket, setNewTicket] = useState<{
    robotId: string;
    component: string;
    type: 'preventive' | 'corrective' | 'calibration';
    scheduledDate: string;
    technician: string;
  }>({
    robotId: 'R-01',
    component: '',
    type: 'preventive',
    scheduledDate: '',
    technician: ''
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.component || !newTicket.scheduledDate) return;

    const ticket: MaintenanceTicket = {
      id: `TKT-${Math.floor(Math.random() * 900) + 100}`,
      robotId: newTicket.robotId,
      component: newTicket.component,
      type: newTicket.type,
      scheduledDate: newTicket.scheduledDate,
      technician: newTicket.technician || 'Auto Assign',
      status: 'pending'
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({
      robotId: 'R-01',
      component: '',
      type: 'preventive',
      scheduledDate: '',
      technician: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'in_progress': return 'text-amber-400 bg-amber-500/10 border-amber-500/30 animate-pulse';
      case 'pending': return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
      default: return 'text-slate-400 bg-slate-800';
    }
  };

  // Robot failure risks descending order
  const highRiskRobots = [...telemetry.robots].sort((a, b) => b.failureRisk - a.failureRisk);

  return (
    <div className="p-6 space-y-6 text-left">
      {/* 1. Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">PREDICTIVE HARDWARE SERVICE</span>
          <h2 className="text-lg font-orbitron font-extrabold text-white uppercase">Maintenance Hub</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Side: Wear risk table (2 columns span) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
            <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block">
              PREDICTIVE WEAR DIAGNOSTICS FLEET INDEX
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-tech border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[9px]">
                    <th className="pb-3">Robot Name</th>
                    <th className="pb-3">Ident</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Wear Index</th>
                    <th className="pb-3 text-right">RUL Estimate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {highRiskRobots.map(robot => (
                    <tr key={robot.id} className="hover:bg-slate-950/20">
                      <td className="py-3 font-orbitron font-bold text-white uppercase">{robot.name}</td>
                      <td className="py-3 text-slate-400">{robot.id}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded border text-[9.5px] uppercase font-semibold
                          ${robot.status === 'operational' 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/30'}`}>
                          {robot.status}
                        </span>
                      </td>
                      <td className="py-3 w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-grow h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900 p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-300
                                ${robot.failureRisk > 60 
                                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                                  : robot.failureRisk > 30
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'}`}
                              style={{ width: `${robot.failureRisk}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${robot.failureRisk > 60 ? 'text-rose-400' : 'text-slate-300'}`}>
                            {robot.failureRisk}%
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 text-right font-bold ${robot.failureRisk > 60 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                        {robot.status === 'offline' 
                          ? 'IMMEDIATE' 
                          : `${Math.max(Math.round(100 - robot.failureRisk * 1.1), 1)} Days`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Job Tickets list */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
            <span className="text-[10px] text-purple-400 font-mono-tech tracking-wider uppercase block">
              SCHEDULED REPAIRS INDEX
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tickets.map(tkt => (
                <div key={tkt.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-cyan-400 font-mono-tech font-bold uppercase">{tkt.id}</span>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-mono-tech uppercase font-semibold ${getStatusColor(tkt.status)}`}>
                      {tkt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-orbitron font-extrabold text-white uppercase">{tkt.component}</div>
                    <div className="text-[10px] text-slate-400 font-mono-tech">UNIT ID: {tkt.robotId} • TYPE: {tkt.type.toUpperCase()}</div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono-tech text-slate-400 pt-2.5 border-t border-slate-900">
                    <div className="flex items-center gap-1"><Calendar size={12} /> <span>{tkt.scheduledDate}</span></div>
                    <div className="text-right">{tkt.technician}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Log Repair Ticket Form (1 column) */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wrench size={16} className="text-cyan-400" />
            <span className="text-sm font-orbitron font-bold text-white uppercase">Log Repair Ticket</span>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-mono-tech text-slate-400">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Robot Node</label>
              <select
                value={newTicket.robotId}
                onChange={e => setNewTicket(prev => ({ ...prev, robotId: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
              >
                {telemetry.robots.map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-950 text-white">
                    {r.name} ({r.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Component Area</label>
              <input
                type="text"
                required
                value={newTicket.component}
                onChange={e => setNewTicket(prev => ({ ...prev, component: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="e.g. Servo Motor Gear #4"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Maintenance Class</label>
              <div className="grid grid-cols-3 gap-2">
                {(['preventive', 'corrective', 'calibration'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewTicket(prev => ({ ...prev, type }))}
                    className={`py-1.5 rounded border text-[9.5px] uppercase font-semibold cursor-pointer
                      ${newTicket.type === type 
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                        : 'bg-transparent border-slate-800 text-slate-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Schedule Target Date</label>
              <input
                type="date"
                required
                value={newTicket.scheduledDate}
                onChange={e => setNewTicket(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Field Technician</label>
              <input
                type="text"
                value={newTicket.technician}
                onChange={e => setNewTicket(prev => ({ ...prev, technician: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="e.g. M. Patel"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-futuristic py-2 text-xs font-bold mt-2 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              LOG WORK ORDER
            </button>
          </form>

          {/* Diagnostic status checklist */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <span className="text-[9.5px] text-slate-500 font-mono-tech uppercase block">SERVICE HEALTH CHECKLIST</span>
            <div className="space-y-1.5 text-[10.5px] font-mono-tech text-slate-300">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span>Hydraulics Oil Index: Normal</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span>Core Bus Bus Volts: 48.0V</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> <span>Welder Thermal Seal: Replace</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
