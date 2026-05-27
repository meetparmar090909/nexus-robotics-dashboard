import React, { useState } from 'react';
import { useTelemetry } from './context/TelemetryContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ParticleBackground } from './components/ParticleBackground';

// Pages
import { LoginSystem } from './pages/LoginSystem';
import { Dashboard } from './pages/Dashboard';
import { RobotMonitoring } from './pages/RobotMonitoring';
import { AIAnalytics } from './pages/AIAnalytics';
import { ProductionSystem } from './pages/ProductionSystem';
import { MaintenanceCenter } from './pages/MaintenanceCenter';
import { AIReports } from './pages/AIReports';
import { FactoryCameras } from './pages/FactoryCameras';
import { SystemLogs } from './pages/SystemLogs';
import { Settings } from './pages/Settings';
import { UserManagement } from './pages/UserManagement';

const App: React.FC = () => {
  const { user } = useTelemetry();
  const [activePage, setActivePage] = useState<string>('dashboard');

  if (!user) {
    return <LoginSystem />;
  }

  // Map active ID to readable header titles
  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard': return 'Operational Control Panel';
      case 'robot-monitoring': return 'Robotic Fleet Telemetry';
      case 'ai-analytics': return 'Acoustics & ML Diagnostics';
      case 'production-system': return 'Assembly Line Flow Map';
      case 'maintenance-center': return 'Predictive Maintenance';
      case 'ai-reports': return 'Neural Analytics Export';
      case 'factory-cameras': return 'Computer Vision Surveillance';
      case 'system-logs': return 'System Event Log';
      case 'settings': return 'Core System Thresholds';
      case 'user-management': return 'Operator Session Controls';
      default: return 'Nexus Systems Core';
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'robot-monitoring': return <RobotMonitoring />;
      case 'ai-analytics': return <AIAnalytics />;
      case 'production-system': return <ProductionSystem />;
      case 'maintenance-center': return <MaintenanceCenter />;
      case 'ai-reports': return <AIReports />;
      case 'factory-cameras': return <FactoryCameras />;
      case 'system-logs': return <SystemLogs />;
      case 'settings': return <Settings />;
      case 'user-management': return <UserManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-[#02040a] text-slate-100 min-h-screen relative font-rajdhani selection:bg-cyan-500/30 selection:text-white">
      {/* HUD scanlines and visual grid background */}
      <div className="hud-scanline"></div>
      <div className="absolute inset-0 matrix-bg opacity-[0.04] pointer-events-none"></div>

      {/* Global animated ambient lights */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      {/* Interactive canvas particle background */}
      <ParticleBackground />

      {/* Expanded Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Core Workstation Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <Header pageTitle={getPageTitle(activePage)} />
        
        {/* Dynamic page content container */}
        <main className="flex-1 relative overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
