import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, Server, RefreshCw } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

interface GeneratedReport {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'PDF' | 'CSV' | 'XLSX';
  author: string;
}

export const AIReports: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [lineFilter, setLineFilter] = useState('All');
  const [robotFilter, setRobotFilter] = useState('All');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilingStep, setCompilingStep] = useState('');
  const [compileProgress, setCompileProgress] = useState(0);

  const [reportsList, setReportsList] = useState<GeneratedReport[]>([
    { id: 'REP-701', name: 'Fleet Mechanical Stress Index (Q1)', date: '2026-05-20', size: '2.4 MB', type: 'PDF', author: 'Nexus System' },
    { id: 'REP-702', name: 'Electrical Power Optimization log', date: '2026-05-18', size: '840 KB', type: 'CSV', author: 'Grid AI Model' },
    { id: 'REP-703', name: 'Robot Calibration Audits Log', date: '2026-05-15', size: '1.2 MB', type: 'PDF', author: 'A. Chen' }
  ]);

  const runCompilerSimulation = async (reportName: string, format: 'PDF' | 'CSV') => {
    if (isCompiling) return;
    setIsCompiling(true);
    setErrorMsg('');

    const steps = [
      'QUERYING FACTORY DATABASE TELEMETRY...',
      'AGGREGATING 15-MINUTE DURATION BINNINGS...',
      'RUNNING ANOMALY DETECTION VECTOR FILTERS...',
      'COMPILING GRAPHIC TELEMETRY ASSETS...',
      'GENERATING EXPORT COMPILATION DATA...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setCompilingStep(steps[i]);
      const targetProg = Math.round(((i + 1) / steps.length) * 100);
      for (let p = compileProgress; p <= targetProg; p += 10) {
        setCompileProgress(p);
        await new Promise(r => setTimeout(r, 60));
      }
    }

    await new Promise(r => setTimeout(r, 300));
    setIsCompiling(false);
    setCompileProgress(0);
    setCompilingStep('');

    // Add generated report to the list
    const newRep: GeneratedReport = {
      id: `REP-${Math.floor(Math.random() * 900) + 100}`,
      name: reportName,
      date: new Date().toISOString().split('T')[0],
      size: format === 'PDF' ? '1.8 MB' : '450 KB',
      type: format,
      author: 'Operator Admin'
    };
    setReportsList([newRep, ...reportsList]);
  };

  const [errorMsg, setErrorMsg] = useState('');

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">AUTOMATED DATA ANALYSIS EXPORT</span>
          <h2 className="text-lg font-orbitron font-extrabold text-white uppercase">Neural System Reports</h2>
        </div>
      </div>

      {/* Compiler Loader Screen overlay if active */}
      {isCompiling && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-400/30 bg-slate-950/90 text-left font-mono-tech max-w-lg mx-auto">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
            <RefreshCw size={16} className="text-cyan-400 animate-spin" />
            <span className="text-xs text-white font-orbitron font-extrabold uppercase">Compiling System Report</span>
          </div>
          <div className="text-xs text-cyan-400/80 mb-4 h-12 flex items-center">{compilingStep}</div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-cyan-400 transition-all duration-150" style={{ width: `${compileProgress}%` }}></div>
          </div>
        </div>
      )}

      {!isCompiling && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Left Side: Filter and Templates (2 columns) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Filter controls */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
                <Filter size={14} />
                <span className="text-xs font-orbitron font-bold uppercase tracking-wider">Telemetry Export Filters</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-tech text-slate-400">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase block">Assembly Line Selector</label>
                  <select
                    value={lineFilter}
                    onChange={e => setLineFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
                  >
                    <option value="All">All Lines (A, B, C)</option>
                    <option value="A">Line A (Main Chassis)</option>
                    <option value="B">Line B (Electronics)</option>
                    <option value="C">Line C (Sorting)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase block">Robot Node Filter</label>
                  <select
                    value={robotFilter}
                    onChange={e => setRobotFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
                  >
                    <option value="All">All Nodes (R-01 to R-06)</option>
                    {telemetry.robots.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase block">Telemetry Resolution</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white">
                    <option value="15">15-Minute Intervals</option>
                    <option value="60">Hourly Aggregate</option>
                    <option value="daily">Daily High-water Marks</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Template lists */}
            <div className="space-y-4">
              <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block">
                CHOOSE ANALYTICAL REPORT TEMPLATE
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 flex flex-col justify-between h-44">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <FileText className="w-8 h-8 text-cyan-400" />
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-[8.5px] font-mono-tech text-cyan-400 font-bold uppercase">PDF TEMPLATE</span>
                    </div>
                    <div className="text-sm font-orbitron font-extrabold text-white uppercase mt-2">Energy & Grid draw optimizations</div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed m-0">Plots mechanical thermal friction losses against electric power indices to suggest schedule efficiency gains.</p>
                  </div>
                  <button
                    onClick={() => runCompilerSimulation('Energy & Grid Draw Optimizations', 'PDF')}
                    className="btn-futuristic py-1.5 text-[10px] font-bold mt-3 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download size={12} />
                    GENERATE REPORT
                  </button>
                </div>

                {/* Card 2 */}
                <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 flex flex-col justify-between h-44">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <FileSpreadsheet className="w-8 h-8 text-purple-400" />
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-[8.5px] font-mono-tech text-purple-400 font-bold uppercase">CSV RAW DATA</span>
                    </div>
                    <div className="text-sm font-orbitron font-extrabold text-white uppercase mt-2">Fleet Calibration & Stress Matrix</div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed m-0">Full numeric matrix file exporting 3D joints angles deviations, wear margins, and failure metrics per node.</p>
                  </div>
                  <button
                    onClick={() => runCompilerSimulation('Fleet Calibration & Stress Matrix', 'CSV')}
                    className="btn-futuristic py-1.5 text-[10px] font-bold mt-3 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download size={12} />
                    GENERATE REPORT
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Archive of Generated Reports (1 column) */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Server size={14} className="text-cyan-400" />
              <span className="text-xs font-orbitron font-bold text-white uppercase">Historical Archives</span>
            </div>

            <div className="space-y-3">
              {reportsList.map(rep => (
                <div key={rep.id} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs font-mono-tech space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-orbitron font-bold text-white uppercase truncate max-w-[70%]">{rep.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${rep.type === 'PDF' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      {rep.type}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                    <span>DATE: {rep.date} ({rep.size})</span>
                    <button 
                      onClick={() => alert(`DOWNLOADING ${rep.name}.${rep.type.toLowerCase()}...`)}
                      className="text-cyan-400 hover:text-white cursor-pointer"
                      title="Download Archive File"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
