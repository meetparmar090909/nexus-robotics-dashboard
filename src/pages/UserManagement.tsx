import React, { useState } from 'react';
import { Users, Shield, Plus, Key, Globe, LogOut } from 'lucide-react';

interface Operator {
  id: string;
  name: string;
  role: string;
  clearance: 'SEC_LEVEL_05' | 'SEC_LEVEL_03' | 'SEC_LEVEL_01';
  assignedZone: string;
  status: 'active' | 'suspended';
  lastLogin: string;
}

export const UserManagement: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([
    { id: 'OP-12', name: 'Meet Parmar', role: 'SYSTEM ADMINISTRATOR', clearance: 'SEC_LEVEL_05', assignedZone: 'Control Room A', status: 'active', lastLogin: '2026-05-24 17:09' },
    { id: 'OP-15', name: 'Sarah Cooper', role: 'FIELD OPERATOR', clearance: 'SEC_LEVEL_03', assignedZone: 'Line A (Chassis)', status: 'active', lastLogin: '2026-05-24 14:12' },
    { id: 'OP-18', name: 'Andrew Chen', role: 'MAINTENANCE ENG', clearance: 'SEC_LEVEL_03', assignedZone: 'Welder Sector E3', status: 'active', lastLogin: '2026-05-24 15:45' },
    { id: 'OP-22', name: 'David Miller', role: 'SAFETY OBSERVER', clearance: 'SEC_LEVEL_01', assignedZone: 'Warehouse Sector C', status: 'suspended', lastLogin: '2026-05-20 09:30' }
  ]);

  const [newUser, setNewUser] = useState<{
    name: string;
    role: string;
    clearance: 'SEC_LEVEL_05' | 'SEC_LEVEL_03' | 'SEC_LEVEL_01';
    assignedZone: string;
  }>({
    name: '',
    role: 'FIELD OPERATOR',
    clearance: 'SEC_LEVEL_03',
    assignedZone: ''
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.assignedZone) return;

    const op: Operator = {
      id: `OP-${Math.floor(Math.random() * 80) + 30}`,
      name: newUser.name,
      role: newUser.role,
      clearance: newUser.clearance,
      assignedZone: newUser.assignedZone,
      status: 'active',
      lastLogin: 'Never'
    };

    setOperators([...operators, op]);
    setNewUser({
      name: '',
      role: 'FIELD OPERATOR',
      clearance: 'SEC_LEVEL_03',
      assignedZone: ''
    });
  };

  const toggleUserStatus = (id: string) => {
    setOperators(prev => prev.map(op => {
      if (op.id === id) {
        return {
          ...op,
          status: op.status === 'active' ? 'suspended' : 'active'
        };
      }
      return op;
    }));
  };

  return (
    <div className="p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase">IDENTITY ACCESS MANAGEMENT</span>
          <h2 className="text-lg font-orbitron font-extrabold text-white uppercase">User Controls</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Side: Users list table (2 columns span) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
            <span className="text-[10px] text-cyan-400 font-mono-tech tracking-wider uppercase block">
              OPERATOR ROSTER REGISTRY
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono-tech border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[9px]">
                    <th className="pb-3">Operator Name</th>
                    <th className="pb-3">Ident</th>
                    <th className="pb-3">Security Level</th>
                    <th className="pb-3">Access Zone</th>
                    <th className="pb-3">State</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {operators.map(op => (
                    <tr key={op.id} className="hover:bg-slate-950/20">
                      <td className="py-3 font-orbitron font-bold text-white uppercase flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-600/25 border border-cyan-500/20 flex items-center justify-center font-orbitron font-extrabold text-[10px] text-white">
                          {op.name.charAt(0)}
                        </div>
                        {op.name}
                      </td>
                      <td className="py-3 text-slate-400">{op.id}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold ${op.clearance === 'SEC_LEVEL_05' ? 'text-cyan-400' : 'text-slate-300'}`}>
                          {op.clearance}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">{op.assignedZone}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-semibold
                          ${op.status === 'active' 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse'}`}>
                          {op.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => toggleUserStatus(op.id)}
                          className={`text-[10px] font-bold uppercase hover:underline cursor-pointer
                            ${op.status === 'active' ? 'text-rose-400' : 'text-emerald-400'}`}
                        >
                          {op.status === 'active' ? 'SUSPEND' : 'ACTIVATE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active login sessions diagnostic */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-4">
            <span className="text-[10px] text-purple-400 font-mono-tech tracking-wider uppercase block">
              DIAGNOSTIC SESSION HANDSHAKES
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-tech text-slate-400">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <Globe size={18} className="text-cyan-400 animate-pulse" />
                <div className="space-y-0.5">
                  <div className="text-white font-bold">IP_ADDR: 192.168.10.42</div>
                  <div className="text-[10px] text-slate-500">BROWSER NODE: CHROME_MAC_14.5 • PORT: 5173</div>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <Key size={18} className="text-purple-400" />
                <div className="space-y-0.5">
                  <div className="text-white font-bold">DECRYPTED_TOKEN: SYSLOG_ADMIN_JWT</div>
                  <div className="text-[10px] text-slate-500">EXPIRATION COUNTDOWN: 05:42:12</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Provision new Operator form (1 column) */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/10 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users size={16} className="text-cyan-400" />
            <span className="text-sm font-orbitron font-bold text-white uppercase">Provision Operator</span>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-mono-tech text-slate-400">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Identity Name</label>
              <input
                type="text"
                required
                value={newUser.name}
                onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="e.g. Sarah Connor"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Operative Role</label>
              <select
                value={newUser.role}
                onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
              >
                <option value="FIELD OPERATOR">FIELD OPERATOR</option>
                <option value="MAINTENANCE ENG">MAINTENANCE ENGINEER</option>
                <option value="SAFETY OBSERVER">SAFETY OBSERVER</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Clearance Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['SEC_LEVEL_03', 'SEC_LEVEL_01'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setNewUser(prev => ({ ...prev, clearance: lvl }))}
                    className={`py-1.5 rounded border text-[9px] uppercase font-semibold cursor-pointer
                      ${newUser.clearance === lvl 
                        ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                        : 'bg-transparent border-slate-800 text-slate-400'}`}
                  >
                    {lvl.replace('SEC_LEVEL_', 'LVL ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Assigned Workstation Zone</label>
              <input
                type="text"
                required
                value={newUser.assignedZone}
                onChange={e => setNewUser(prev => ({ ...prev, assignedZone: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 focus:outline-none focus:border-cyan-400 text-white"
                placeholder="e.g. Line A (Welding)"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-futuristic py-2 text-xs font-bold mt-2 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              PROVISION CREDENTIALS
            </button>
          </form>

          {/* Core system roles security notice */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <span className="text-[9.5px] text-slate-500 font-mono-tech uppercase block flex items-center gap-1"><Shield size={12} /> SECURITY POLICIES</span>
            <p className="text-[9px] font-mono-tech leading-relaxed text-slate-500 m-0">
              * Provisioning operator keys broadcasts a decryption certificate to the specified workstation. Handshake timeouts expire session keys after 8 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
