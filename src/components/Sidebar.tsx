import React, { useState } from 'react';
import { 
  LayoutDashboard, Cpu, TrendingUp, Workflow, Wrench, 
  FileSpreadsheet, Video, Settings, Users, LogOut,
  ChevronLeft, ChevronRight, Activity, ShieldAlert, Terminal
} from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, logout, telemetry } = useTelemetry();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'robot-monitoring', label: 'Robot Fleet', icon: Cpu },
    { id: 'ai-analytics', label: 'AI Analytics', icon: TrendingUp },
    { id: 'production-system', label: 'Production System', icon: Workflow },
    { id: 'maintenance-center', label: 'Maintenance Hub', icon: Wrench },
    { id: 'ai-reports', label: 'Neural Reports', icon: FileSpreadsheet },
    { id: 'factory-cameras', label: 'CV Cameras', icon: Video },
    { id: 'system-logs', label: 'System Logs', icon: Terminal },
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'user-management', label: 'User Controls', icon: Users }
  ];

  // Count unacknowledged warnings/critical alerts
  const alertCount = telemetry.alerts.filter(a => !a.acknowledged).length;

  return (
    <div 
      className={`glass-panel border-r border-cyan-500/10 flex flex-col transition-all duration-300 ease-in-out z-20 h-screen sticky top-0
        ${isExpanded ? 'w-[260px]' : 'w-[80px]'}`}
    >
      {/* Brand logo header */}
      <div className="p-5 flex items-center justify-between border-b border-cyan-500/15">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-cyan-500/10 border border-cyan-400/30 neon-border-cyan animate-pulse">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div className="absolute inset-0 bg-cyan-400/5 rounded blur-sm"></div>
          </div>
          {isExpanded && (
            <div className="flex flex-col select-none">
              <span className="font-orbitron font-extrabold text-sm tracking-wider text-white">NEXUS-ROBOTICS</span>
              <span className="text-[9px] text-cyan-400 font-mono-tech tracking-widest uppercase">CORE OPERATING OS</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded bg-slate-900/60 border border-slate-700/50 text-cyan-400 hover:text-white hover:border-cyan-400/50 transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Connection status tag */}
      {isExpanded && (
        <div className="px-5 py-3 flex items-center justify-between bg-cyan-950/20 border-b border-cyan-500/5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono-tech uppercase">WS://TELEMETRY_LINK:CONNECTED</span>
          </div>
          <span className="text-[9px] font-mono-tech text-slate-400 bg-slate-900 px-1 rounded">V4.8.2-A</span>
        </div>
      )}

      {/* Navigation items list */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-lg font-orbitron text-xs select-none tracking-wide text-left cursor-pointer transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/10 border-l-2 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border-l-2 border-transparent'
                }`}
            >
              <Icon 
                className={`w-4 h-4 transition-transform group-hover:scale-110
                  ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`}
              />
              {isExpanded && (
                <span className="flex-1 capitalize font-medium">{item.label}</span>
              )}
              {isExpanded && item.id === 'factory-cameras' && alertCount > 0 && (
                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[9px] font-mono-tech animate-pulse">
                  <ShieldAlert size={10} />
                  <span>{alertCount}</span>
                </div>
              )}
              {isExpanded && item.id === 'system-logs' && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono-tech">
                  <span>{telemetry.systemLogs.length}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User control card */}
      <div className="p-3 border-t border-cyan-500/15 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-orbitron font-extrabold text-xs text-white">
            {user?.name.charAt(0) || 'U'}
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate font-orbitron">{user?.name || 'Operator-01'}</p>
              <p className="text-[8.5px] text-cyan-400 font-mono-tech truncate uppercase">{user?.role || 'FIELD OPERATOR'}</p>
            </div>
          )}
          <button 
            onClick={logout}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Log Out Security Session"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
