import React, { useState } from 'react';
import { CameraCVFeed } from '../components/CameraCVFeed';
import { Video, Sliders, Maximize2, ShieldAlert } from 'lucide-react';
import { useTelemetry } from '../context/TelemetryContext';

interface CamNode {
  id: string;
  name: string;
  type: 'cv_detection' | 'thermal' | 'lidar' | 'neural_hud';
  desc: string;
}

export const FactoryCameras: React.FC = () => {
  const { telemetry } = useTelemetry();
  const [selectedCamIdx, setSelectedCamIdx] = useState<number | null>(null);
  const [cvLayers, setCvLayers] = useState({
    boundingBoxes: true,
    thermalHotspots: true,
    hudOverlays: true
  });

  const cams: CamNode[] = [
    { id: 'CAM-LINE-01', name: 'MAIN CONVEYOR CV', type: 'cv_detection', desc: 'Object recognition & QA classifier tracking parts on the primary belt.' },
    { id: 'CAM-JOINT-05', name: 'WELDER THERMAL NODE', type: 'thermal', desc: 'Infrared motor thermal load tracking for mechanical stress diagnostic checks.' },
    { id: 'CAM-AERIAL-02', name: 'DRONE LIDAR MAPPER', type: 'lidar', desc: 'Volumetric point cloud modeling of factory clearance paths.' },
    { id: 'CAM-ROBOT-01', name: 'KUKA ARM HUB OVERLAY', type: 'neural_hud', desc: 'Neural target lock diagnostics plotting kinematic angle joints.' }
  ];

  const handleToggleLayer = (layer: 'boundingBoxes' | 'thermalHotspots' | 'hudOverlays') => {
    setCvLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const currentAlerts = telemetry.alerts.filter(a => !a.acknowledged);

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">CCTV COMPUTER VISION CONSOLE</span>
          <h2 className="text-lg font-orbitron font-extrabold text-white uppercase">Factory Cameras</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left Side: CCTV Grid (3 columns span) */}
        <div className="xl:col-span-3 space-y-6">
          {selectedCamIdx === null ? (
            // Grid of 4
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cams.map((cam, idx) => (
                <div 
                  key={cam.id} 
                  className="glass-panel p-3.5 rounded-2xl border border-slate-800 hover:border-cyan-400/40 relative transition-all group"
                >
                  <CameraCVFeed 
                    feedType={
                      cam.type === 'cv_detection' && !cvLayers.boundingBoxes ? 'neural_hud' :
                      cam.type === 'thermal' && !cvLayers.thermalHotspots ? 'neural_hud' :
                      cam.type === 'neural_hud' && !cvLayers.hudOverlays ? 'cv_detection' :
                      cam.type
                    } 
                    camName={cam.name} 
                    camId={cam.id} 
                  />
                  <div className="mt-3.5 flex justify-between items-start text-xs font-mono-tech">
                    <div className="flex flex-col">
                      <span className="font-orbitron font-bold text-white uppercase">{cam.name}</span>
                      <span className="text-[9px] text-slate-500 uppercase mt-0.5">{cam.desc.substring(0, 52)}...</span>
                    </div>
                    <button
                      onClick={() => setSelectedCamIdx(idx)}
                      className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-white cursor-pointer"
                      title="Expand Channel"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Expanded single view
            <div className="glass-panel p-5 rounded-2xl border border-cyan-400/30 space-y-4">
              <div className="relative w-full h-[400px]">
                <CameraCVFeed 
                  feedType={cams[selectedCamIdx].type} 
                  camName={cams[selectedCamIdx].name} 
                  camId={cams[selectedCamIdx].id} 
                />
              </div>

              <div className="flex justify-between items-center text-xs font-mono-tech border-t border-slate-900 pt-3">
                <div className="flex flex-col">
                  <span className="font-orbitron font-extrabold text-white text-sm uppercase">{cams[selectedCamIdx].name}</span>
                  <span className="text-slate-400 mt-1 max-w-xl">{cams[selectedCamIdx].desc}</span>
                </div>
                <button
                  onClick={() => setSelectedCamIdx(null)}
                  className="btn-futuristic py-1.5 px-4 text-[10px] font-bold cursor-pointer"
                >
                  COLLAPSE CHANNELS GRID
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: CV Graphic Controls & Alarms HUD (1 column) */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-6">
          {/* CV Overlays */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders size={14} className="text-cyan-400" />
              <span className="text-xs font-orbitron font-bold text-white uppercase">CV Render Channels</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono-tech text-slate-400">
              <label className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-900 cursor-pointer hover:border-cyan-400/30">
                <span>Bounding Boxes</span>
                <input 
                  type="checkbox" 
                  checked={cvLayers.boundingBoxes}
                  onChange={() => handleToggleLayer('boundingBoxes')}
                  className="accent-cyan-400 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-900 cursor-pointer hover:border-cyan-400/30">
                <span>Thermal Gradients</span>
                <input 
                  type="checkbox" 
                  checked={cvLayers.thermalHotspots}
                  onChange={() => handleToggleLayer('thermalHotspots')}
                  className="accent-cyan-400 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-900 cursor-pointer hover:border-cyan-400/30">
                <span>HUD Diagnostics Text</span>
                <input 
                  type="checkbox" 
                  checked={cvLayers.hudOverlays}
                  onChange={() => handleToggleLayer('hudOverlays')}
                  className="accent-cyan-400 w-3.5 h-3.5"
                />
              </label>
            </div>
          </div>

          {/* CCTV Alarms notification warning board */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert size={14} className="text-rose-400" />
              <span className="text-xs font-orbitron font-bold text-white uppercase">CCTV Alarm Flags</span>
            </div>

            <div className="space-y-2 h-44 overflow-y-auto pr-1">
              {currentAlerts.length === 0 ? (
                <div className="text-center py-8 text-[10px] text-slate-500 font-mono-tech">
                  NO ALARMS DETECTED ON CCTV FEED SCANNER
                </div>
              ) : (
                currentAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className="p-2.5 rounded border border-rose-500/30 bg-rose-950/10 text-[10.5px] font-mono-tech text-rose-300"
                  >
                    <div className="font-bold">{alert.id} • {alert.timestamp}</div>
                    <div className="text-[9.5px] text-slate-200 mt-1 leading-snug">{alert.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
