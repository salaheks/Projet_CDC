import { Handle, Position } from 'reactflow';
import { Router, Server, Shield, SwitchCamera, Globe, Wifi, Database, Cloud } from 'lucide-react';
import type { DeviceData } from '../../stores/editorStore';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; ring: string }> = {
  router:   { icon: Router,       color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',   ring: 'ring-blue-500' },
  switch:   { icon: SwitchCamera, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-500' },
  firewall: { icon: Shield,       color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',    ring: 'ring-red-500' },
  server:   { icon: Server,       color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-200',  ring: 'ring-slate-500' },
  internet: { icon: Globe,        color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200', ring: 'ring-indigo-500' },
  wireless: { icon: Wifi,         color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200', ring: 'ring-purple-500' },
  database: { icon: Database,     color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',  ring: 'ring-amber-500' },
  cloud:    { icon: Cloud,        color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-sky-200',    ring: 'ring-sky-500' },
};

export default function CustomNode({ data, selected }: { data: DeviceData; selected?: boolean }) {
  const cfg = typeConfig[data.type] || typeConfig.server;
  const Icon = cfg.icon;

  return (
    <div
      className={`
        relative rounded-2xl border-2 shadow-lg bg-white group
        transition-all duration-200 min-w-[110px]
        ${cfg.border}
        ${selected ? `ring-2 ${cfg.ring} ring-offset-2 shadow-xl` : 'hover:shadow-xl hover:-translate-y-0.5'}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-white !border-2 !border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity !top-[-6px]"
      />

      <div className="flex flex-col items-center gap-2 p-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.border} border shadow-sm`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>

        <div className="text-center">
          <div className="text-xs font-bold text-slate-800 truncate max-w-[90px]">{data.label}</div>
          {data.type && (
            <div className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${cfg.color}`}>{data.type}</div>
          )}
        </div>

        {(data.ip || data.vlan) && (
          <div className="w-full border-t border-slate-100 pt-2 space-y-0.5">
            {data.ip && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400 font-medium">IP</span>
                <span className="text-[9px] text-slate-600 font-mono">{data.ip}</span>
              </div>
            )}
            {data.vlan && (
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400 font-medium">VLAN</span>
                <span className={`text-[9px] font-mono font-semibold ${cfg.color}`}>{data.vlan}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white !border-2 !border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity !bottom-[-6px]"
      />

      {/* Left & Right handles */}
      <Handle
        type="source"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity !left-[-6px]"
        id="left"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white !border-2 !border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity !right-[-6px]"
        id="right"
      />
    </div>
  );
}
