# 🤖 NEXUS-ROBOTICS — AI Robotics Management Dashboard

> **Ultra-premium, cinematic AI factory control system** built with React + TypeScript + Vite. Designed to replicate a real enterprise SCADA / robotics OS used by top-tier companies like Tesla, Boston Dynamics, NVIDIA AI Labs, and SpaceX Mission Control.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation & Run

```bash
# 1. Navigate to the project folder
cd "Your_Folder _Path"

# 2. Install all dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🔐 Login Credentials

The system has two built-in operator accounts:

| Username   | Password     | Role                  |
|------------|--------------|-----------------------|
| `admin`    | *(any text)* | System Administrator  |
| `operator` | *(any text)* | Field Operator        |

> Password field accepts any value — authentication is simulated for demo purposes.

---

## 📐 Project Structure

```
src/
├── components/
│   ├── RobotArm3D.tsx        # Three.js 3D digital twin (ABB IRB 6700 style)
│   ├── Sidebar.tsx           # Collapsible navigation panel
│   ├── Header.tsx            # Top HUD bar with alerts + user info
│   ├── ParticleBackground.tsx # Canvas particle animation
│   └── CameraCVFeed.tsx      # Simulated CV camera feed component
│
├── context/
│   └── TelemetryContext.tsx  # Global state + simulated WebSocket stream + logs
│
├── pages/
│   ├── LoginSystem.tsx       # Futuristic login screen
│   ├── Dashboard.tsx         # Main control panel (3D arm + charts + chatbot)
│   ├── RobotMonitoring.tsx   # Fleet telemetry + joint override controls
│   ├── AIAnalytics.tsx       # Acoustic ML diagnostics + frequency analysis
│   ├── ProductionSystem.tsx  # Assembly line flow + conveyor tracking
│   ├── MaintenanceCenter.tsx # Predictive maintenance + wear analytics
│   ├── AIReports.tsx         # Report generation + export
│   ├── FactoryCameras.tsx    # Computer vision surveillance feeds
│   ├── SystemLogs.tsx        # ⬅ Full live event log terminal
│   ├── Settings.tsx          # System thresholds + configuration
│   └── UserManagement.tsx    # Operator session controls
│
├── index.css                 # Design system (Tailwind v4 + custom CSS)
└── App.tsx                   # Root routing + layout
```

---

## 🖥️ Dashboard Pages — How to Use

### 1. 🏠 Dashboard (Main Control Panel)
The primary operational view. Contains:

- **4 KPI Cards** — Fleet state, throughput, energy draw, unresolved alarms
- **3D Robot Arm Viewer** — Real-time ABB IRB 6700 digital twin (Three.js)
  - Drag to rotate the view
  - Auto mode: syncs with live telemetry data
  - Manual mode: use the sliders on the right to control each joint axis
- **Conveyor Belt Tracker** — Live sliding items with status badges (assembled / inspecting / rejected)
  - Drag the velocity slider to change belt speed in real time
- **Power Draw Chart** — Area chart showing kW consumption vs ML prediction
- **Thermal Heatmap** — 5×5 factory floor sector grid. Hover any cell for temperature data.
- **AI Command Assistant** — Type natural language queries like:
  - `status` — overall system health
  - `power` — energy consumption analysis
  - `R-05 temperature` — specific robot diagnostics
  - `maintenance` — predictive wear report
  - `logs` — log buffer summary

---

### 2. 🤖 Robot Fleet (Robot Monitoring)
Detailed per-robot diagnostic cockpit.

- **Fleet List** — Click any robot card to select it
- **Telemetry Metrics** — Efficiency, payload, wear factor, last calibration date
- **Spatial Vector Location** — Live XYZ coordinates (updates every 1.5s)
- **Active Alarms** — Filtered alerts for the selected unit
- **Joint Axis Sliders** — Override any of the 6 joint angles in real time
- **Console Log** — Shows system events for the selected unit
- **CALIBRATE / REBOOT** — Triggers a 5-second reboot + recalibration cycle
- **HALT UNIT** — Emergency shutdown signal

---

### 3. 📊 AI Analytics
Acoustic and ML diagnostic analysis.

- **Frequency Spectrum** — 32-bar live acoustic anomaly waveform
- **System Load Gauge** — Real-time CPU/GPU draw percentage
- **ML Model Status** — Inference health indicators
- **Anomaly Detection Feed** — Pattern deviations flagged by the neural net

---

### 4. ⚙️ Production System
Assembly line management.

- **Conveyor Flow Diagram** — Real-time belt item tracking
- **Speed Control** — Adjust belt velocity (0.5 – 3.5 m/s)
- **Hold / Eject Controls** — Click any item to hold it on the belt or eject it
- **Add Item** — Inject new assembly items into the line
- **Throughput Chart** — Live actual vs target production rate

---

### 5. 🔧 Maintenance Center
Predictive maintenance and wear analytics.

- **Risk Ranking Table** — All robots sorted by failure probability
- **Wear Gauges** — Visual indicators for joint wear, thermal stress, uptime
- **Schedule Maintenance** — Mark units for service
- **Historical Failure Prediction** — Time-series forecast chart

---

### 6. 📁 Neural Reports
Report generation and export.

- **Summary Dashboard** — Aggregated KPI export view
- **Filter by Date / Robot / Metric** — Custom report scoping
- **Export as PDF / CSV** — One-click data exports (simulated)

---

### 7. 📷 CV Cameras
Computer vision surveillance feeds.

- **8 live camera feeds** — Simulated with animated scanner overlays
- **Object detection badges** — Real-time anomaly detection labels
- **Camera feed controls** — Toggle feeds, zoom, status indicators

---

### 8. 📟 System Logs *(New)*
Full live event terminal for all system activity.

- **Real-time log streaming** — New entries appear every ~15 seconds automatically
- **Log levels**: `SYSTEM` | `ERROR` | `WARN` | `INFO` | `DEBUG`
- **Filter by Level** — Click any badge to filter by log severity
- **Filter by Source** — Dropdown to isolate logs from specific subsystems
- **Search** — Full-text search across message content and details
- **Expand rows** — Click any log entry to reveal detailed metadata
- **Export JSON** — Download filtered logs as structured JSON
- **Export .LOG** — Download as plain-text `.log` file (timestamped)
- **Clear** — Wipe the log buffer (with confirmation prompt)
- **Persistence** — Logs survive page refresh via `localStorage`
- **Auto-scroll** — Toggle LIVE mode to auto-scroll to newest entries

**Log Sources include:**
| Source      | Description                                    |
|-------------|------------------------------------------------|
| `NexusCore` | OS kernel and boot events                      |
| `Auth`      | Login / logout and session events              |
| `TelemetryWS` | WebSocket heartbeats and data stream events  |
| `R-01…R-06` | Per-robot diagnostic events                   |
| `Conveyor`  | Assembly line item movements                   |
| `AlertMgr`  | Alert acknowledgement and clear events         |
| `AI-Chat`   | Chatbot queries and responses                  |
| `ML-Engine` | Machine learning model inference cycles        |
| `Camera`    | CV feed status and anomaly events              |
| `RobotArm`  | Arm mode switches and joint overrides          |

---

### 9. ⚙️ System Settings
Configure system thresholds and preferences.

- **Temperature limits** — Critical/warning thresholds per unit
- **Conveyor speed limits** — Safe operating bounds
- **Notification preferences** — Alert sensitivity controls
- **Theme toggle** — (visual customization options)

---

### 10. 👥 User Management
Operator access control panel.

- **Active session list** — Currently logged-in operators
- **Role assignment** — Admin / Operator / Viewer roles
- **Session history** — Login/logout audit trail
- **Create / Revoke access** — Operator account management

---

## 🎮 Keyboard Shortcuts

| Key         | Action                              |
|-------------|-------------------------------------|
| `Enter`     | Submit AI chatbot message           |
| Mouse drag  | Rotate 3D robot arm in Dashboard    |

---

## 🛠️ Tech Stack

| Technology        | Purpose                                      |
|-------------------|----------------------------------------------|
| **React 18**      | UI framework                                 |
| **TypeScript**    | Type-safe development                        |
| **Vite 6**        | Ultra-fast HMR dev server + build tool       |
| **Tailwind CSS v4** | Utility-first styling (via `@tailwindcss/vite`) |
| **Three.js**      | 3D robot arm digital twin renderer           |
| **Recharts**      | Area charts, radar charts, telemetry graphs  |
| **Lucide React**  | Icon library                                 |
| **Framer Motion** | Smooth UI animations (available for use)     |
| **LocalStorage**  | Log persistence across sessions              |

---

## 🎨 Design System

The dashboard uses a custom CSS design system defined in `src/index.css`:

| Class                  | Usage                                      |
|------------------------|--------------------------------------------|
| `.glass-panel`         | Glassmorphism card (cyan accent)           |
| `.glass-panel-purple`  | Glassmorphism card (purple accent)         |
| `.glow-text-cyan`      | Neon cyan text glow                        |
| `.glow-text-red`       | Neon red alert glow                        |
| `.btn-futuristic`      | Clip-path shimmer CTA button               |
| `.font-orbitron`       | Display / heading font                     |
| `.font-mono-tech`      | Share Tech Mono — HUD data font            |
| `.hud-scanline`        | Fullscreen CRT scanline overlay            |
| `.matrix-bg`           | Subtle animated grid lines                 |
| `.scanner-bar`         | Animated scan line for camera feeds        |
| `.animate-blink`       | Status indicator pulse                     |
| `.animate-float`       | Gentle floating animation                  |

**Color Palette:**

| Variable                | Value          | Usage                  |
|-------------------------|----------------|------------------------|
| `--color-neon-cyan`     | `#00f2fe`      | Primary accent         |
| `--color-neon-blue`     | `#4facfe`      | Secondary accent       |
| `--color-neon-purple`   | `#7f00ff`      | Tertiary / AI elements |
| `--color-neon-green`    | `#00e676`      | Success / operational  |
| `--color-neon-red`      | `#ff3b30`      | Critical / error       |
| `--color-bg-darker`     | `#02040a`      | Background             |

---

## 📡 Simulated Telemetry

All data is simulated client-side — no backend required. The `TelemetryContext` runs:

- **1.5s WebSocket simulation** — Robot positions, temperatures, joint angles, conveyor items, power draw, and acoustic data update every 1.5 seconds
- **15s Log emitter** — Periodic system log entries from subsystems
- **AI chatbot NLP** — Pattern-matched responses with live telemetry values
- **Predictive analytics** — Failure risk scores calculated from temperature + efficiency data

To connect to a **real backend**, replace the `setInterval` in `TelemetryContext.tsx` with a native WebSocket connection to your data source.

---

## 📄 License

MIT — Free to use, modify, and distribute.

---

*Built with ❤️ by I Studio Project — powered by React + Three.js + Tailwind CSS v4*
