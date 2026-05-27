import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Cpu, Server, Wifi } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

interface HeaderProps {
  pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { telemetry, acknowledgeAlert, clearAlerts } = useTelemetry();
  const [time, setTime] = useState(new Date());
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadAlerts = telemetry.alerts.filter(a => !a.acknowledged);

  return (
    <header className="glass-panel border-b border-cyan-500/10 h-[70px] px-6 flex items-center justify-between sticky top-0 z-10 w-full bg-slate-950/85">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-orbitron font-extrabold text-white tracking-wider uppercase m-0 flex items-center gap-2.5">
          <span className="text-cyan-400 font-normal">/ /</span>
          {pageTitle}
        </h1>
      </div>

      {/* Right widgets */}
      <div className="flex items-center gap-6">
        {/* Connection & Load Telemetry HUD (hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-5 border-r border-slate-800/80 pr-5 text-[11px] font-mono-tech">
          {/* CPU indicator */}
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-cyan-400" />
            <span className="text-slate-400">NET_LOAD:</span>
            <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" 
                style={{ width: `${telemetry.systemLoad}%` }}
              ></div>
            </div>
            <span className="text-white font-medium w-8 text-right">{telemetry.systemLoad.toFixed(1)}%</span>
          </div>

          {/* Efficiency indicator */}
          <div className="flex items-center gap-2">
            <Server size={12} className="text-purple-400" />
            <span className="text-slate-400">SYS_GRID:</span>
            <span className="text-purple-400 font-semibold">{telemetry.energyConsumption.toFixed(0)} kW</span>
          </div>

          {/* WS Latency */}
          <div className="flex items-center gap-1 text-emerald-400">
            <Wifi size={12} className="animate-pulse" />
            <span>PING: 14ms</span>
          </div>
        </div>

        {/* Live system clock */}
        <div className="text-right font-mono-tech">
          <div className="text-xs text-white tracking-widest">
            {time.toISOString().split('T')[0]}
          </div>
          <div className="text-[10px] text-cyan-400/80">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} UTC
          </div>
        </div>

        {/* Alerts Center Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-400/40 hover:text-cyan-400 text-slate-300 transition-all cursor-pointer"
          >
            <Bell size={16} className={unreadAlerts.length > 0 ? 'animate-bounce text-amber-400' : ''} />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-mono-tech font-bold animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-3 w-80 glass-panel-purple border border-purple-500/20 rounded-xl p-4 shadow-2xl z-30 max-h-[380px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-3">
                <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-purple-400" />
                  Security Alerts
                </span>
                {unreadAlerts.length > 0 && (
                  <button 
                    onClick={clearAlerts}
                    className="text-[10px] font-mono-tech text-purple-400 hover:text-white hover:underline uppercase"
                  >
                    Ack All
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {telemetry.alerts.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono-tech">
                    ALARM LOG EMPTY // ALL SYSTEM CLEAR
                  </div>
                ) : (
                  telemetry.alerts.map(alert => (
                    <div 
                      key={alert.id}
                      onClick={() => !alert.acknowledged && acknowledgeAlert(alert.id)}
                      className={`p-2.5 rounded border text-left cursor-pointer transition-all flex flex-col gap-1
                        ${alert.acknowledged 
                          ? 'bg-slate-900/20 border-slate-900/60 opacity-55' 
                          : alert.severity === 'critical'
                            ? 'bg-rose-950/20 border-rose-500/30 text-rose-300 hover:bg-rose-950/30'
                            : alert.severity === 'warning'
                              ? 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:bg-amber-950/30'
                              : 'bg-blue-950/20 border-blue-500/30 text-blue-300 hover:bg-blue-950/30'
                        }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono-tech uppercase">
                        <span className={`font-semibold ${alert.acknowledged ? 'text-slate-400' : 'glow-text-' + alert.severity}`}>
                          {alert.severity} • {alert.id}
                        </span>
                        <span className="text-slate-500">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-200 line-clamp-2 m-0 leading-tight">
                        {alert.message}
                      </p>
                      {!alert.acknowledged && (
                        <span className="text-[8px] font-mono-tech text-cyan-400/80 mt-1 uppercase">
                          Click to Acknowledge
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
