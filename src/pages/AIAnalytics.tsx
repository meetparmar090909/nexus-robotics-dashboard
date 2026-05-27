import React, { useEffect, useRef } from 'react';
import { TrendingUp, Activity, BarChart3, ShieldAlert, Cpu } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, LineChart, Line, CartesianGrid
} from 'recharts';

export const AIAnalytics: React.FC = () => {
  const { telemetry } = useTelemetry();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Acoustic Waveform visualizer canvas sync
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const drawWaveform = () => {
      const w = canvas.width = canvas.clientWidth || 600;
      const h = canvas.height = canvas.clientHeight || 120;

      ctx.clearRect(0, 0, w, h);

      // Background grid lines
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Draw sound bars based on acoustics telemetry data
      const data = telemetry.acousticsData;
      const numBars = data.length;
      const barWidth = (w / numBars) - 2;
      
      for (let i = 0; i < numBars; i++) {
        const barHeight = (data[i] / 100) * (h - 20);
        const x = i * (barWidth + 2);
        const y = h - barHeight - 10;

        // Gradient color for bars (cyan to purple/pink)
        const gradient = ctx.createLinearGradient(x, y, x, h);
        gradient.addColorStop(0, '#ff007f'); // pink tip
        gradient.addColorStop(0.5, '#7f00ff'); // purple middle
        gradient.addColorStop(1, '#00f2fe'); // cyan base

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Subtly mirror bars downwards
        ctx.fillStyle = 'rgba(0, 242, 254, 0.06)';
        ctx.fillRect(x, h - 10, barWidth, barHeight * 0.25);
      }

      // Scanner frequency text
      ctx.fillStyle = '#00f2fe';
      ctx.font = '8px Share Tech Mono';
      ctx.fillText('ACOUSTIC SPECTRUM ANALYSIS [Hz] • 20 - 22,000 Hz', 10, 15);

      animFrameId = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => cancelAnimationFrame(animFrameId);
  }, [telemetry.acousticsData]);

  // Recharts throughput performance curve data
  const accuracyCurve = telemetry.robots.map(r => ({
    name: r.name.split(' ')[1] || r.name,
    vibrationAnomaly: parseFloat((r.failureRisk * 0.85 + Math.random() * 5).toFixed(1)),
    accuracy: parseFloat((r.efficiency * 0.99).toFixed(1)),
    loss: parseFloat((0.02 + r.failureRisk * 0.003).toFixed(3))
  }));

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Top statistics rows */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/10">
          <span className="text-[10px] text-cyan-400 font-mono-tech uppercase block">NEURAL MODEL CLASSIFIER</span>
          <h2 className="text-xl font-orbitron font-extrabold text-white mt-1">99.42%</h2>
          <span className="text-[9px] text-slate-500 font-mono-tech uppercase">CONFIDENCE INDEX NOMINAL</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/10">
          <span className="text-[10px] text-purple-400 font-mono-tech uppercase block">INFERENCE LATENCY</span>
          <h2 className="text-xl font-orbitron font-extrabold text-white mt-1">8.24 ms</h2>
          <span className="text-[9px] text-slate-500 font-mono-tech uppercase">EDGE-ACCELERATION ACTIVE</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/10">
          <span className="text-[10px] text-pink-400 font-mono-tech uppercase block">RUL PREDICTIVE FACTOR</span>
          <h2 className="text-xl font-orbitron font-extrabold text-white mt-1">96.8 %</h2>
          <span className="text-[9px] text-slate-500 font-mono-tech uppercase">REMAINING USEFUL LIFE NOMINAL</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/10">
          <span className="text-[10px] text-emerald-400 font-mono-tech uppercase block">DAILY TRAINING EPOCHS</span>
          <h2 className="text-xl font-orbitron font-extrabold text-white mt-1">420/500</h2>
          <span className="text-[9px] text-slate-500 font-mono-tech uppercase">NEURALWEIGHT SYNC COMPLETED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acoustic Soundwave Panel */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">SOUND-WAVE INFRARED SIGNATURES</span>
              <span className="text-sm font-orbitron font-bold text-white uppercase">Acoustic Machinery Vibration Diagnostics</span>
            </div>
            <Activity size={16} className="text-pink-400 animate-pulse" />
          </div>

          {/* Canvas spectrum */}
          <div className="h-44 bg-slate-950/80 rounded-xl border border-slate-900 flex items-center justify-center p-3">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          <div className="text-[10px] font-mono-tech text-slate-500">
            * High-frequency acoustic sensors pick up bearing micro-chatter in Joint assemblies to predict mechanical wear before it triggers system thermals.
          </div>
        </div>

        {/* Neural Classifier weights */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-400 font-mono-tech tracking-wider uppercase">NEURAL NET LOSS DIAGRAMS</span>
              <span className="text-sm font-orbitron font-bold text-white uppercase">Model Regression Limits</span>
            </div>
            <Cpu size={16} className="text-purple-400" />
          </div>

          <div className="h-44 w-full text-xs font-mono-tech">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyCurve}>
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ backgroundColor: '#090f1e', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="loss" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-mono-tech text-slate-500 border-t border-slate-900 pt-3">
            * Gradient loss factors mapped across the fleet array. Anomaly rate is normalized below 0.05.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Vibration Anomaly Index */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">ANOMALY INDEX BY NODE</span>
              <span className="text-sm font-orbitron font-bold text-white uppercase">Vibration & Temperature Deviations</span>
            </div>
            <BarChart3 size={16} className="text-cyan-400" />
          </div>

          <div className="h-56 w-full text-xs font-mono-tech">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyCurve}>
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" />
                <Tooltip contentStyle={{ backgroundColor: '#090f1e', borderRadius: '8px' }} />
                <Bar dataKey="vibrationAnomaly" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Efficiency scores */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-purple-400 font-mono-tech tracking-wider uppercase">UNIT EFFICIENCY PERCENTAGES</span>
              <span className="text-sm font-orbitron font-bold text-white uppercase">Regression Curve vs Calibration Target</span>
            </div>
            <TrendingUp size={16} className="text-purple-400" />
          </div>

          <div className="h-56 w-full text-xs font-mono-tech">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#475569" />
                <YAxis stroke="#475569" domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#090f1e', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#d946ef" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
