import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  robotId?: string;
  acknowledged: boolean;
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SYSTEM';
  source: string;
  message: string;
  timestamp: string;
  details?: string;
}

export interface Robot {
  id: string;
  name: string;
  type: 'arm' | 'drone' | 'humanoid' | 'rover';
  status: 'operational' | 'maintenance' | 'offline' | 'calibrating';
  temperature: number;
  battery: number;
  joints: number[];
  load: number;
  efficiency: number;
  coordinates: { x: number; y: number; z: number };
  lastMaintenance: string;
  failureRisk: number;
}

export interface ConveyorItem {
  id: string;
  type: string;
  progress: number;
  status: 'passed' | 'inspecting' | 'rejected' | 'assembled' | 'held';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface TelemetryData {
  factoryThroughput: number;
  systemLoad: number;
  conveyorSpeed: number;
  energyConsumption: number;
  activeRobotsCount: number;
  totalRobots: number;
  alerts: Alert[];
  robots: Robot[];
  conveyorItems: ConveyorItem[];
  historicalPower: { time: string; power: number; prediction: number }[];
  historicalThroughput: { time: string; target: number; actual: number }[];
  acousticsData: number[];
  chatbotMessages: ChatMessage[];
  manualRobotArmJoints: number[];
  robotArmMode: 'auto' | 'manual';
  systemLogs: SystemLog[];
}

interface TelemetryContextType {
  user: { name: string; role: string; token: string } | null;
  telemetry: TelemetryData;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
  updateConveyorSpeed: (speed: number) => void;
  overrideRobotJoint: (robotId: string, jointIndex: number, value: number) => void;
  rebootRobot: (robotId: string) => void;
  sendChatMessage: (text: string) => void;
  setRobotArmMode: (mode: 'auto' | 'manual') => void;
  setManualRobotArmJoints: React.Dispatch<React.SetStateAction<number[]>>;
  toggleHoldItem: (id: string) => void;
  ejectItem: (id: string) => void;
  addConveyorItem: (type: string) => void;
  clearLogs: () => void;
  addLog: (level: SystemLog['level'], source: string, message: string, details?: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const tsISO = () => new Date().toISOString();

// ── Load persisted logs from localStorage ──
const loadPersistedLogs = (): SystemLog[] => {
  try {
    const raw = localStorage.getItem('nexus_system_logs');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
};

const initialRobots: Robot[] = [
  { id: 'R-01', name: 'KUKA Titan-X1', type: 'arm', status: 'operational', temperature: 42.5, battery: 100, joints: [0, 45, 90, 0, 45, 0], load: 180, efficiency: 98.4, coordinates: { x: 12.4, y: 5.2, z: 1.5 }, lastMaintenance: '2026-05-10', failureRisk: 2.4 },
  { id: 'R-02', name: 'UR10 Cobot', type: 'arm', status: 'operational', temperature: 38.1, battery: 100, joints: [10, -30, 45, 10, -45, 90], load: 8.5, efficiency: 95.8, coordinates: { x: 14.8, y: 5.2, z: 1.2 }, lastMaintenance: '2026-05-15', failureRisk: 4.1 },
  { id: 'R-03', name: 'Boston Spot v4', type: 'rover', status: 'operational', temperature: 45.2, battery: 74, joints: [0, 15, -15, 0, 0, 0], load: 12.0, efficiency: 92.1, coordinates: { x: 22.1, y: 15.4, z: 0.0 }, lastMaintenance: '2026-04-20', failureRisk: 12.8 },
  { id: 'R-04', name: 'Tesla Optimus Gen-II', type: 'humanoid', status: 'operational', temperature: 39.8, battery: 89, joints: [5, 10, 0, 20, 10, 5], load: 5.0, efficiency: 97.2, coordinates: { x: 18.2, y: 10.1, z: 0.0 }, lastMaintenance: '2026-05-01', failureRisk: 8.3 },
  { id: 'R-05', name: 'Fanuc Welding-M', type: 'arm', status: 'maintenance', temperature: 68.4, battery: 100, joints: [90, 10, -20, 180, 0, 0], load: 45.0, efficiency: 64.2, coordinates: { x: 8.2, y: 4.8, z: 1.8 }, lastMaintenance: '2026-03-12', failureRisk: 84.5 },
  { id: 'R-06', name: 'DJI Matrice Cargo', type: 'drone', status: 'offline', temperature: 24.0, battery: 0, joints: [0, 0, 0, 0, 0, 0], load: 0, efficiency: 0, coordinates: { x: 30.0, y: 2.0, z: 10.5 }, lastMaintenance: '2026-05-22', failureRisk: 0.5 },
];

const initialAlerts: Alert[] = [
  { id: 'A-101', severity: 'warning', message: 'Fanuc Welding-M joint #3 thermal spike: 68.4°C', timestamp: ts(), robotId: 'R-05', acknowledged: false },
  { id: 'A-102', severity: 'info', message: 'Optimus battery charge state: 89% (Optimal)', timestamp: ts(), robotId: 'R-04', acknowledged: true },
];

const bootstrapLogs = (): SystemLog[] => {
  const persisted = loadPersistedLogs();
  const bootstrap: SystemLog[] = [
    { id: 'L-001', level: 'SYSTEM', source: 'NexusCore', message: 'System boot sequence initiated. Loading kernel modules...', timestamp: tsISO() },
    { id: 'L-002', level: 'INFO',   source: 'Auth',      message: 'Authentication subsystem online. JWT token service ready.', timestamp: tsISO() },
    { id: 'L-003', level: 'INFO',   source: 'TelemetryWS', message: 'WebSocket telemetry stream connected. Interval: 1500ms.', timestamp: tsISO() },
    { id: 'L-004', level: 'WARN',   source: 'R-05',      message: 'Thermal threshold exceeded: Joint #3 at 68.4°C (limit: 65°C).', timestamp: tsISO(), details: 'Unit: Fanuc Welding-M | Sector: E3 | Action: maintenance lock applied' },
    { id: 'L-005', level: 'ERROR',  source: 'R-06',      message: 'Drone unit offline. Battery at 0%. Last known position: [30.0, 2.0, 10.5].', timestamp: tsISO(), details: 'Unit: DJI Matrice Cargo | Cause: power depletion' },
    { id: 'L-006', level: 'INFO',   source: 'Conveyor',  message: 'Assembly line belt initialized at 1.8 m/s. Items in transit: 4.', timestamp: tsISO() },
    { id: 'L-007', level: 'DEBUG',  source: 'ML-Engine', message: 'Acoustic anomaly model v2.4.1 loaded. Frequency bands: 32. Baseline calibrated.', timestamp: tsISO() },
    { id: 'L-008', level: 'INFO',   source: 'Camera',    message: 'Computer vision feeds online: 8 cameras active. CV model: YOLOv8-Industrial.', timestamp: tsISO() },
    { id: 'L-009', level: 'SYSTEM', source: 'NexusCore', message: 'All subsystems nominal. Dashboard ready for operator session.', timestamp: tsISO() },
  ];
  // Merge: persisted first (most recent), then bootstrap
  const combined = [...persisted, ...bootstrap];
  // De-duplicate by id
  const seen = new Set<string>();
  return combined.filter(l => { if (seen.has(l.id)) return false; seen.add(l.id); return true; }).slice(0, 200);
};

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; role: string; token: string } | null>(() => {
    const saved = localStorage.getItem('studio_robotics_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [telemetry, setTelemetry] = useState<TelemetryData>(() => {
    const historicalPower = Array.from({ length: 15 }).map((_, i) => {
      const base = 280 + Math.sin(i / 2) * 30 + Math.random() * 15;
      return { time: `${15 - i}m ago`, power: parseFloat(base.toFixed(1)), prediction: parseFloat((base + Math.sin((i + 1) / 2) * 5 + (Math.random() - 0.5) * 5).toFixed(1)) };
    });
    const historicalThroughput = Array.from({ length: 15 }).map((_, i) => {
      const actual = 115 + Math.sin(i / 3) * 8 + (Math.random() - 0.5) * 6;
      return { time: `${15 - i}m ago`, target: 120, actual: parseFloat(actual.toFixed(0)) };
    });

    return {
      factoryThroughput: 118,
      systemLoad: 64.2,
      conveyorSpeed: 1.8,
      energyConsumption: 295.4,
      activeRobotsCount: 4,
      totalRobots: 6,
      alerts: initialAlerts,
      robots: initialRobots,
      conveyorItems: [
        { id: 'Item-0', type: 'Chassis', progress: 85, status: 'inspecting' },
        { id: 'Item-1', type: 'Battery Pack', progress: 55, status: 'assembled' },
        { id: 'Item-2', type: 'Control Module', progress: 30, status: 'assembled' },
        { id: 'Item-3', type: 'Upper Hull', progress: 5, status: 'passed' },
      ],
      historicalPower,
      historicalThroughput,
      acousticsData: Array.from({ length: 32 }).map(() => Math.floor(Math.random() * 60) + 10),
      chatbotMessages: [
        { id: 'msg-1', sender: 'ai', text: 'AI Autonomous Systems Controller online. All telemetry streams nominal. Awaiting directive.', timestamp: ts() },
      ],
      manualRobotArmJoints: [0, 0, 0, 0, 0, 0],
      robotArmMode: 'auto',
      systemLogs: bootstrapLogs(),
    };
  });

  const telemetryRef = useRef(telemetry);
  telemetryRef.current = telemetry;

  // ── Persist logs to localStorage whenever they change ──
  useEffect(() => {
    try {
      localStorage.setItem('nexus_system_logs', JSON.stringify(telemetry.systemLogs.slice(0, 200)));
    } catch { /* quota exceeded – ignore */ }
  }, [telemetry.systemLogs]);

  // ── Internal log appender ──
  const addLogInternal = (level: SystemLog['level'], source: string, message: string, details?: string) => {
    const entry: SystemLog = {
      id: `L-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
      level,
      source,
      message,
      timestamp: tsISO(),
      details,
    };
    setTelemetry(prev => ({
      ...prev,
      systemLogs: [entry, ...prev.systemLogs].slice(0, 200),
    }));
  };

  const addLog = addLogInternal;

  const clearLogs = () => {
    setTelemetry(prev => ({ ...prev, systemLogs: [] }));
    localStorage.removeItem('nexus_system_logs');
  };

  // ── Auth ──
  const login = async (username: string, pass: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200));
    if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'operator') {
      const loggedUser = {
        name: username.charAt(0).toUpperCase() + username.slice(1),
        role: username.toLowerCase() === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'FIELD OPERATOR',
        token: `JWT_SYS_${Date.now()}_TOK`,
      };
      setUser(loggedUser);
      localStorage.setItem('studio_robotics_user', JSON.stringify(loggedUser));
      addLogInternal('INFO', 'Auth', `User '${loggedUser.name}' authenticated. Role: ${loggedUser.role}. Session token issued.`);
      return true;
    }
    addLogInternal('WARN', 'Auth', `Failed login attempt for username: '${username}'. Invalid credentials.`);
    return false;
  };

  const logout = () => {
    addLogInternal('INFO', 'Auth', `User session terminated. Operator logged out.`);
    setUser(null);
    localStorage.removeItem('studio_robotics_user');
  };

  // ── Alert actions ──
  const acknowledgeAlert = (id: string) => {
    setTelemetry(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
    }));
    addLogInternal('INFO', 'AlertMgr', `Alert ${id} acknowledged by operator.`);
  };

  const clearAlerts = () => {
    setTelemetry(prev => ({ ...prev, alerts: prev.alerts.filter(a => !a.acknowledged) }));
    addLogInternal('INFO', 'AlertMgr', 'All acknowledged alerts cleared from active queue.');
  };

  // ── Conveyor ──
  const updateConveyorSpeed = (speed: number) => {
    setTelemetry(prev => ({ ...prev, conveyorSpeed: speed }));
    addLogInternal('INFO', 'Conveyor', `Belt speed updated to ${speed.toFixed(1)} m/s by operator.`);
  };

  // ── Robot arm mode ──
  const setRobotArmMode = (mode: 'auto' | 'manual') => {
    setTelemetry(prev => ({ ...prev, robotArmMode: mode }));
    addLogInternal('INFO', 'RobotArm', `Arm control mode switched to ${mode.toUpperCase()}. ${mode === 'manual' ? 'Kinematic sync disengaged.' : 'Auto telemetry sync re-engaged.'}`);
  };

  const setManualRobotArmJoints = (joints: number[] | ((prev: number[]) => number[])) => {
    setTelemetry(prev => {
      const next = typeof joints === 'function' ? joints(prev.manualRobotArmJoints) : joints;
      return { ...prev, manualRobotArmJoints: next };
    });
  };

  // ── Joint override ──
  const overrideRobotJoint = (robotId: string, jointIndex: number, value: number) => {
    setTelemetry(prev => ({
      ...prev,
      robots: prev.robots.map(r => {
        if (r.id !== robotId) return r;
        const next = [...r.joints];
        next[jointIndex] = value;
        return { ...r, joints: next };
      }),
    }));
    addLogInternal('DEBUG', robotId, `Joint J${jointIndex + 1} manually overridden to ${value.toFixed(1)}°.`);
  };

  // ── Reboot ──
  const rebootRobot = (robotId: string) => {
    const robot = telemetryRef.current.robots.find(r => r.id === robotId);
    addLogInternal('WARN', robotId, `Reboot sequence initiated for ${robot?.name ?? robotId}. Status → calibrating.`);
    setTelemetry(prev => ({
      ...prev,
      alerts: [{ id: `A-${Date.now()}`, severity: 'info', message: `Initiating system reboot for unit ${robotId}...`, timestamp: ts(), acknowledged: false }, ...prev.alerts],
      robots: prev.robots.map(r => r.id !== robotId ? r : { ...r, status: 'calibrating', temperature: 28.0, battery: Math.max(r.battery, 10), efficiency: 0 }),
    }));
    setTimeout(() => {
      setTelemetry(prev => ({
        ...prev,
        alerts: [{ id: `A-${Date.now()}`, severity: 'info', message: `Reboot successful. Unit ${robotId} status: operational.`, timestamp: ts(), acknowledged: false }, ...prev.alerts],
        robots: prev.robots.map(r => r.id !== robotId ? r : { ...r, status: 'operational', temperature: 36.5, efficiency: 95.0 }),
      }));
      addLogInternal('INFO', robotId, `Reboot complete. ${robot?.name ?? robotId} returned to operational status. Efficiency: 95.0%.`);
    }, 5000);
  };

  // ── Conveyor item actions ──
  const toggleHoldItem = (id: string) => {
    setTelemetry(prev => ({
      ...prev,
      conveyorItems: prev.conveyorItems.map(item =>
        item.id === id ? { ...item, status: item.status === 'held' ? 'inspecting' : 'held' } : item
      ),
    }));
    const item = telemetryRef.current.conveyorItems.find(i => i.id === id);
    const nextStatus = item?.status === 'held' ? 'inspecting' : 'held';
    addLogInternal('INFO', 'Conveyor', `Item ${id} (${item?.type}) status → ${nextStatus}.`);
  };

  const ejectItem = (id: string) => {
    const item = telemetryRef.current.conveyorItems.find(i => i.id === id);
    setTelemetry(prev => ({ ...prev, conveyorItems: prev.conveyorItems.filter(i => i.id !== id) }));
    addLogInternal('WARN', 'Conveyor', `Item ${id} (${item?.type}) ejected from assembly line by operator.`);
  };

  const addConveyorItem = (type: string) => {
    const newItem: ConveyorItem = { id: `Item-${Date.now()}`, type, progress: 0, status: 'passed' };
    setTelemetry(prev => ({ ...prev, conveyorItems: [newItem, ...prev.conveyorItems] }));
    addLogInternal('INFO', 'Conveyor', `New item injected: ${type} (ID: ${newItem.id}) at position 0%.`);
  };

  // ── AI Chatbot ──
  const sendChatMessage = (text: string) => {
    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, sender: 'user', text, timestamp: ts() };
    setTelemetry(prev => ({ ...prev, chatbotMessages: [...prev.chatbotMessages, userMsg] }));
    addLogInternal('DEBUG', 'AI-Chat', `Operator query: "${text}"`);

    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = '';

      if (q.includes('status') || q.includes('system') || q.includes('how are things')) {
        const active = telemetryRef.current.robots.filter(r => r.status === 'operational').length;
        const total = telemetryRef.current.robots.length;
        reply = `System check complete. ${active}/${total} units fully operational. Conveyor at ${telemetryRef.current.conveyorSpeed} m/s. Throughput: ${telemetryRef.current.factoryThroughput} P/M. Load: ${telemetryRef.current.systemLoad.toFixed(1)}%.`;
      } else if (q.includes('power') || q.includes('energy')) {
        reply = `Grid consumption: ${telemetryRef.current.energyConsumption.toFixed(1)} kW. ML diagnostics project stable levels. Recommendation: service R-05 to reduce thermal friction losses.`;
      } else if (q.includes('optimus') || q.includes('r-04')) {
        const opt = telemetryRef.current.robots.find(r => r.id === 'R-04');
        reply = `Optimus Gen-II (R-04): Battery ${opt?.battery}%, Temp ${opt?.temperature}°C, Efficiency ${opt?.efficiency}%. Location: [${opt?.coordinates.x}, ${opt?.coordinates.y}].`;
      } else if (q.includes('spot') || q.includes('r-03')) {
        const spot = telemetryRef.current.robots.find(r => r.id === 'R-03');
        reply = `Boston Spot v4 (R-03): Battery ${spot?.battery}%, Temp ${spot?.temperature}°C. Patrol active in Warehouse Sector C.`;
      } else if (q.includes('welding') || q.includes('r-05') || q.includes('fanuc')) {
        reply = `ALERT: Fanuc Welding-M (R-05) — Joint #3 critical at 68.4°C. Wear risk: 84.5%. Immediate reboot or service recommended.`;
      } else if (q.includes('robot') || q.includes('fleet')) {
        reply = `Fleet telemetry: 6 nodes registered. R-01 KUKA, R-02 UR10, R-03 Spot, R-04 Optimus, R-05 Fanuc (maintenance), R-06 DJI (offline). Override controls available on Robot Monitoring panel.`;
      } else if (q.includes('throughput') || q.includes('conveyor') || q.includes('speed')) {
        reply = `Belt speed: ${telemetryRef.current.conveyorSpeed} m/s. Assembly rate: ${telemetryRef.current.factoryThroughput} P/M. Adjust speed via controls or Production System page.`;
      } else if (q.includes('maintenance') || q.includes('risk') || q.includes('predictive')) {
        const highRisk = telemetryRef.current.robots.filter(r => r.failureRisk > 50);
        reply = highRisk.length > 0
          ? `Predictive analytics flagged ${highRisk.length} high-risk units: ${highRisk.map(r => `${r.name} (${r.failureRisk}% risk)`).join(', ')}.`
          : 'All wear indexes below threshold. Next scheduled maintenance in 48 hours.';
      } else if (q.includes('log') || q.includes('logs')) {
        const count = telemetryRef.current.systemLogs.length;
        reply = `System log buffer contains ${count} entries. Navigate to System Logs page for full event timeline, filtering, and export options.`;
      } else if (q.includes('help') || q.includes('commands')) {
        reply = `Available queries: 'status', 'power', 'robot [name]', 'maintenance', 'conveyor', 'logs'. Ask anything about the factory floor.`;
      } else {
        reply = `Acknowledged: "${text}". Neural-net query processed. All systems within telemetry parameters. Specify a robot ID, subsystem, or metric for detailed analysis.`;
      }

      setTelemetry(prev => ({
        ...prev,
        chatbotMessages: [...prev.chatbotMessages, { id: `msg-${Date.now()}`, sender: 'ai', text: reply, timestamp: ts() }],
      }));
      addLogInternal('DEBUG', 'AI-Chat', `AI response generated for query: "${text.slice(0, 40)}..."`);
    }, 900);
  };

  // ── Simulated WebSocket telemetry stream ──
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        // Conveyor movement
        const nextConveyorItems = prev.conveyorItems.map(item => {
          if (item.status === 'held') return item;
          let p = item.progress + prev.conveyorSpeed * 1.5;
          let s = item.status;
          let t = item.type;
          if (p >= 100) {
            p = 0;
            const types = ['Chassis', 'Battery Pack', 'Control Module', 'Upper Hull', 'Wiring Harness', 'Sensor Array'];
            t = types[Math.floor(Math.random() * types.length)];
            s = 'passed';
          } else if (p > 45 && p < 55) {
            s = 'inspecting';
          } else if (p > 55 && item.status === 'inspecting') {
            s = Math.random() > 0.06 ? 'assembled' : 'rejected';
          }
          return { ...item, type: t, progress: p, status: s };
        });

        // Alerts for high conveyor speed
        const nextAlerts = [...prev.alerts];
        if (prev.conveyorSpeed > 2.5 && Math.random() > 0.9) {
          nextAlerts.unshift({
            id: `A-${Date.now()}`,
            severity: 'warning',
            message: `High belt speed: ${prev.conveyorSpeed.toFixed(1)} m/s — potential inspection errors.`,
            timestamp: ts(),
            acknowledged: false,
          });
        }

        // Metrics fluctuation
        const loadFluc = (Math.random() - 0.5) * 4;
        const nextLoad = Math.min(Math.max(prev.systemLoad + loadFluc, 40), 95);
        const nextThroughput = Math.round(prev.conveyorSpeed * 65 + (Math.random() - 0.5) * 8);
        const nextEnergy = parseFloat((150 + prev.conveyorSpeed * 70 + nextLoad * 1.2 + (Math.random() - 0.5) * 5).toFixed(1));

        // Robot jitter
        const t = Date.now();
        const nextRobots = prev.robots.map(r => {
          if (r.status === 'operational') {
            const nextTemp = parseFloat(Math.min(Math.max(r.temperature + (Math.random() - 0.5) * 0.8, 35), 48).toFixed(1));
            const nextBattery = Math.max(r.battery - (Math.random() > 0.97 ? 1 : 0), 5);
            let nextCoords = { ...r.coordinates };
            if (r.type === 'drone') {
              nextCoords.x = parseFloat((r.coordinates.x + (Math.random() - 0.5) * 0.4).toFixed(1));
              nextCoords.y = parseFloat((r.coordinates.y + (Math.random() - 0.5) * 0.4).toFixed(1));
              nextCoords.z = parseFloat(Math.min(Math.max(r.coordinates.z + (Math.random() - 0.5) * 0.2, 5), 15).toFixed(1));
            } else if (r.type === 'rover') {
              nextCoords.x = parseFloat((r.coordinates.x + (Math.random() - 0.5) * 0.2).toFixed(1));
              nextCoords.y = parseFloat((r.coordinates.y + (Math.random() - 0.5) * 0.2).toFixed(1));
            }
            let nextJoints = [...r.joints];
            if (r.id === 'R-01' && prev.robotArmMode === 'auto') {
              nextJoints = [
                parseFloat((Math.sin(t / 4000) * 75).toFixed(1)),
                parseFloat((20 + Math.cos(t / 3000) * 35).toFixed(1)),
                parseFloat((55 + Math.sin(t / 2000) * 35).toFixed(1)),
                parseFloat((Math.sin(t / 1500) * 90).toFixed(1)),
                parseFloat((Math.cos(t / 2500) * 45).toFixed(1)),
                parseFloat((Math.sin(t / 1000) * 60).toFixed(1)),
              ];
            } else if (r.id === 'R-02') {
              nextJoints = [parseFloat((Math.sin(t / 3500) * 50).toFixed(1)), parseFloat((-15 + Math.cos(t / 2800) * 20).toFixed(1)), parseFloat((40 + Math.sin(t / 2200) * 25).toFixed(1)), parseFloat((Math.sin(t / 1800) * 60).toFixed(1)), parseFloat((Math.cos(t / 2000) * 30).toFixed(1)), parseFloat((Math.sin(t / 1200) * 80).toFixed(1))];
            } else if (r.id === 'R-03') {
              nextJoints = [parseFloat((Math.sin(t / 300) * 12).toFixed(1)), parseFloat((15 + Math.cos(t / 300) * 25).toFixed(1)), parseFloat((-15 + Math.sin(t / 300) * 25).toFixed(1)), 0, 0, 0];
            } else if (r.id === 'R-04') {
              nextJoints = [parseFloat((5 + Math.sin(t / 600) * 8).toFixed(1)), parseFloat((10 + Math.cos(t / 600) * 12).toFixed(1)), parseFloat((Math.sin(t / 600) * 15).toFixed(1)), parseFloat((20 + Math.cos(t / 600) * 10).toFixed(1)), 10, 5];
            } else if (r.id === 'R-05') {
              nextJoints = [parseFloat((90 + Math.sin(t / 1500) * 30).toFixed(1)), parseFloat((10 + Math.cos(t / 1200) * 15).toFixed(1)), parseFloat((-20 + Math.sin(t / 1000) * 20).toFixed(1)), 180, 0, 0];
            }
            return { ...r, temperature: nextTemp, battery: nextBattery, coordinates: nextCoords, joints: nextJoints };
          } else if (r.status === 'maintenance') {
            return { ...r, temperature: parseFloat((r.temperature + (Math.random() - 0.5) * 1.5).toFixed(1)) };
          }
          return r;
        });

        // Historical charts
        const nextHistPower = [...prev.historicalPower.slice(1), { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), power: nextEnergy, prediction: parseFloat((nextEnergy + Math.sin(Date.now() / 10000) * 12).toFixed(1)) }];
        const nextHistThroughput = [...prev.historicalThroughput.slice(1), { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), target: 120, actual: nextThroughput }];
        const nextAcoustics = prev.acousticsData.map(v => Math.min(Math.max(v + Math.floor((Math.random() - 0.5) * 15), 5), 95));
        const activeCount = nextRobots.filter(r => r.status === 'operational' || r.status === 'calibrating').length;

        return {
          ...prev,
          conveyorItems: nextConveyorItems,
          alerts: nextAlerts.slice(0, 50),
          systemLoad: nextLoad,
          factoryThroughput: nextThroughput,
          energyConsumption: nextEnergy,
          robots: nextRobots,
          historicalPower: nextHistPower,
          historicalThroughput: nextHistThroughput,
          acousticsData: nextAcoustics,
          activeRobotsCount: activeCount,
        };
      });
    }, 1500);

    // Periodic system log entries (every 15s)
    const logInterval = setInterval(() => {
      const cur = telemetryRef.current;
      const sources = ['TelemetryWS', 'ML-Engine', 'Conveyor', 'Camera', 'NexusCore'];
      const msgs: [SystemLog['level'], string, string][] = [
        ['DEBUG', 'TelemetryWS', `Heartbeat OK. Active nodes: ${cur.activeRobotsCount}/${cur.totalRobots}. Latency: ${Math.floor(Math.random() * 20 + 5)}ms.`],
        ['INFO',  'ML-Engine',  `Predictive model cycle. Throughput: ${cur.factoryThroughput} P/M. Load: ${cur.systemLoad.toFixed(1)}%.`],
        ['DEBUG', 'Conveyor',   `Belt tick. Items in transit: ${cur.conveyorItems.length}. Speed: ${cur.conveyorSpeed.toFixed(1)} m/s.`],
        ['INFO',  'Camera',     `CV inference cycle. FPS: ${Math.floor(Math.random() * 10 + 25)}. Anomalies detected: ${Math.random() > 0.85 ? 1 : 0}.`],
        ['DEBUG', 'NexusCore',  `Memory usage: ${Math.floor(Math.random() * 20 + 60)}%. CPU: ${cur.systemLoad.toFixed(1)}%. Uptime: ${Math.floor(Date.now() / 1000 % 86400)}s.`],
      ];
      const pick = msgs[Math.floor(Math.random() * msgs.length)];
      addLogInternal(pick[0], pick[1], pick[2]);

      // Occasional warning logs
      if (cur.robots.find(r => r.failureRisk > 50 && r.status !== 'offline')) {
        const risky = cur.robots.find(r => r.failureRisk > 50 && r.status !== 'offline')!;
        if (Math.random() > 0.6) {
          addLogInternal('WARN', risky.id, `Predictive risk alert: ${risky.name} failure probability at ${risky.failureRisk}%. Maintenance recommended.`, `Temp: ${risky.temperature}°C | Efficiency: ${risky.efficiency}%`);
        }
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(logInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TelemetryContext.Provider value={{
      user, telemetry, login, logout,
      acknowledgeAlert, clearAlerts,
      updateConveyorSpeed, overrideRobotJoint,
      rebootRobot, sendChatMessage,
      setRobotArmMode, setManualRobotArmJoints,
      toggleHoldItem, ejectItem, addConveyorItem,
      clearLogs, addLog,
    }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetry must be used within TelemetryProvider');
  return ctx;
};
