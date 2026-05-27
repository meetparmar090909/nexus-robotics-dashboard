import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Terminal, Download, Trash2, Filter, Search, RefreshCw, ChevronDown, ChevronRight, AlertTriangle, Info, Bug, Cpu, Zap } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';
import type { SystemLog } from '../context/TelemetryContext';

const LEVEL_CONFIG: Record<SystemLog['level'], { color: string; bg: string; border: string; icon: React.ReactNode; glow: string }> = {
  SYSTEM: { color: 'text-purple-300', bg: 'bg-purple-900/20', border: 'border-purple-500/30', icon: <Cpu size={11} />, glow: 'shadow-[0_0_6px_rgba(168,85,247,0.3)]' },
  INFO:   { color: 'text-cyan-300',   bg: 'bg-cyan-900/15',   border: 'border-cyan-500/25',   icon: <Info size={11} />, glow: '' },
  WARN:   { color: 'text-amber-300',  bg: 'bg-amber-900/20',  border: 'border-amber-500/30',  icon: <AlertTriangle size={11} />, glow: 'shadow-[0_0_6px_rgba(245,158,11,0.2)]' },
  ERROR:  { color: 'text-rose-300',   bg: 'bg-rose-900/20',   border: 'border-rose-500/30',   icon: <Zap size={11} />, glow: 'shadow-[0_0_6px_rgba(239,68,68,0.3)]' },
  DEBUG:  { color: 'text-slate-400',  bg: 'bg-slate-900/30',  border: 'border-slate-700/40',  icon: <Bug size={11} />, glow: '' },
};

const LEVELS: SystemLog['level'][] = ['SYSTEM', 'ERROR', 'WARN', 'INFO', 'DEBUG'];

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return iso; }
};

const fmtDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: '2-digit' });
  } catch { return ''; }
};

export const SystemLogs: React.FC = () => {
  const { telemetry, clearLogs } = useTelemetry();
  const logs = telemetry.systemLogs;

  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState<SystemLog['level'] | 'ALL'>('ALL');
  const [activeSource, setActiveSource] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new logs arrive
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [logs.length, autoScroll]);

  // All unique sources
  const allSources = useMemo(() => {
    const s = new Set(logs.map(l => l.source));
    return ['ALL', ...Array.from(s).sort()];
  }, [logs]);

  // Filtered logs
  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (activeLevel !== 'ALL' && l.level !== activeLevel) return false;
      if (activeSource !== 'ALL' && l.source !== activeSource) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!l.message.toLowerCase().includes(q) && !l.source.toLowerCase().includes(q) && !(l.details?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [logs, activeLevel, activeSource, search]);

  // Stats
  const stats = useMemo(() => ({
    total: logs.length,
    error: logs.filter(l => l.level === 'ERROR').length,
    warn:  logs.filter(l => l.level === 'WARN').length,
    info:  logs.filter(l => l.level === 'INFO').length,
    debug: logs.filter(l => l.level === 'DEBUG').length,
    system: logs.filter(l => l.level === 'SYSTEM').length,
  }), [logs]);

  // Export as JSON
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as plain text
  const handleExportTXT = () => {
    const lines = filtered.map(l =>
      `[${fmtDate(l.timestamp)} ${fmtTime(l.timestamp)}] [${l.level}] [${l.source}] ${l.message}${l.details ? `\n  ↳ ${l.details}` : ''}`
    ).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-logs-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 text-left min-h-screen">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'TOTAL ENTRIES', value: stats.total, color: 'text-white', border: 'border-slate-700' },
          { label: 'SYSTEM', value: stats.system, color: 'text-purple-300', border: 'border-purple-500/25' },
          { label: 'ERRORS', value: stats.error, color: 'text-rose-300', border: 'border-rose-500/25' },
          { label: 'WARNINGS', value: stats.warn, color: 'text-amber-300', border: 'border-amber-500/25' },
          { label: 'INFO', value: stats.info, color: 'text-cyan-300', border: 'border-cyan-500/25' },
          { label: 'DEBUG', value: stats.debug, color: 'text-slate-400', border: 'border-slate-700' },
        ].map(s => (
          <div key={s.label} className={`glass-panel p-3 rounded-xl border ${s.border} flex flex-col gap-1`}>
            <span className="text-[9px] text-slate-500 font-mono-tech tracking-widest uppercase">{s.label}</span>
            <span className={`text-xl font-orbitron font-extrabold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Controls Row ── */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="text-slate-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="bg-transparent flex-1 text-xs text-white placeholder-slate-600 focus:outline-none font-mono-tech"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-500 hover:text-white cursor-pointer text-xs">✕</button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-mono-tech uppercase tracking-wider cursor-pointer transition-all
                ${autoScroll ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'}`}
              title="Toggle auto-scroll to latest"
            >
              <RefreshCw size={11} className={autoScroll ? 'animate-spin' : ''} />
              LIVE
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 text-[10px] font-mono-tech uppercase tracking-wider cursor-pointer transition-all"
            >
              <Download size={11} />
              JSON
            </button>

            {/* Export TXT */}
            <button
              onClick={handleExportTXT}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 text-[10px] font-mono-tech uppercase tracking-wider cursor-pointer transition-all"
            >
              <Download size={11} />
              .LOG
            </button>

            {/* Clear */}
            {showClearConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { clearLogs(); setShowClearConfirm(false); }}
                  className="px-3 py-2 rounded-lg border border-rose-500/50 bg-rose-900/20 text-rose-400 text-[10px] font-mono-tech uppercase cursor-pointer hover:bg-rose-900/40 transition-all"
                >
                  CONFIRM CLEAR
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-500 text-[10px] font-mono-tech cursor-pointer hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/25 bg-rose-950/10 hover:border-rose-500/50 text-rose-400/70 hover:text-rose-400 text-[10px] font-mono-tech uppercase tracking-wider cursor-pointer transition-all"
              >
                <Trash2 size={11} />
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Level + Source filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={11} className="text-slate-600" />
          <span className="text-[9px] text-slate-600 font-mono-tech uppercase tracking-widest mr-1">Level:</span>
          {(['ALL', ...LEVELS] as const).map(lvl => {
            const cfg = lvl !== 'ALL' ? LEVEL_CONFIG[lvl] : null;
            return (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`px-2.5 py-1 rounded border text-[9px] font-mono-tech uppercase tracking-wider cursor-pointer transition-all
                  ${activeLevel === lvl
                    ? (cfg ? `${cfg.bg} ${cfg.border} ${cfg.color} ${cfg.glow}` : 'bg-white/10 border-white/20 text-white')
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
              >
                {lvl}
              </button>
            );
          })}

          <div className="w-px h-4 bg-slate-800 mx-1" />

          <span className="text-[9px] text-slate-600 font-mono-tech uppercase tracking-widest mr-1">Source:</span>
          <div className="relative">
            <select
              value={activeSource}
              onChange={e => setActiveSource(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-mono-tech rounded px-2 py-1 cursor-pointer focus:outline-none hover:border-slate-600 appearance-none pr-5"
            >
              {allSources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
          </div>

          <span className="ml-auto text-[9px] text-slate-600 font-mono-tech">
            {filtered.length} / {logs.length} ENTRIES
          </span>
        </div>
      </div>

      {/* ── Log Terminal ── */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col" style={{ height: '56vh', minHeight: '400px' }}>
        {/* Terminal header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-cyan-400" />
            <span className="text-[10px] text-slate-400 font-mono-tech uppercase tracking-widest">NEXUS SYSTEM EVENT LOG — LIVE STREAM</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
            <span className="text-[9px] text-emerald-400 font-mono-tech">STREAMING</span>
          </div>
        </div>

        {/* Log list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono-tech text-[11px]"
          style={{ background: 'rgba(2, 6, 14, 0.95)' }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
              <Terminal size={32} className="opacity-30" />
              <span className="text-xs font-mono-tech">No log entries match the current filter.</span>
            </div>
          ) : (
            filtered.map((log) => {
              const cfg = LEVEL_CONFIG[log.level];
              const isExpanded = expandedId === log.id;

              return (
                <div
                  key={log.id}
                  className={`rounded border ${cfg.border} ${cfg.bg} transition-all cursor-pointer select-none`}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  {/* Main line */}
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    {/* Expand icon */}
                    <span className="text-slate-700 shrink-0">
                      {log.details ? (isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />) : <span className="w-[10px]" />}
                    </span>

                    {/* Timestamp */}
                    <span className="text-slate-600 shrink-0 w-16 text-right">
                      {fmtTime(log.timestamp)}
                    </span>

                    {/* Level badge */}
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${cfg.border} ${cfg.bg} ${cfg.color} shrink-0 w-[62px] justify-center`}>
                      {cfg.icon}
                      <span className="text-[9px] font-bold">{log.level}</span>
                    </span>

                    {/* Source */}
                    <span className="text-slate-500 shrink-0 w-24 truncate">[{log.source}]</span>

                    {/* Message */}
                    <span className={`flex-1 truncate ${cfg.color} leading-relaxed`}>
                      {log.message}
                    </span>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && log.details && (
                    <div className="px-10 pb-2 pt-1 border-t border-slate-800/60">
                      <div className="bg-slate-950/70 rounded p-2 text-slate-400 text-[10px] leading-relaxed whitespace-pre-wrap">
                        <span className="text-slate-600">↳ DETAILS: </span>{log.details}
                      </div>
                      <div className="mt-1 text-[9px] text-slate-700">
                        LOG ID: {log.id} | FULL TIMESTAMP: {log.timestamp}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Terminal footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-t border-slate-800">
          <span className="text-[9px] text-slate-600 font-mono-tech">
            BUFFER: {logs.length}/200 ENTRIES | FILTERED: {filtered.length} | CLICK ROW TO EXPAND
          </span>
          <span className="text-[9px] text-slate-600 font-mono-tech">
            SESSION: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
