import { Handle, Position } from 'reactflow';
import {
  Cloud, Server, Shield, Database, GitBranch, Globe,
  ArrowUpDown, Route, Zap, ShieldCheck, FolderArchive,
  SwitchCamera, Router, LayoutGrid,
} from 'lucide-react';
import type { DeviceData } from '../../stores/editorStore';

const ICON_MAP: Record<string, React.ElementType> = {
  // Cloud resource types
  vpc: Cloud, subnet: LayoutGrid,
  'internet-gateway': Globe, 'nat-gateway': ArrowUpDown,
  'route-table': Route,
  'virtual-machine': Server, 'container-cluster': Server,
  'serverless-function': Zap,
  'security-group': Shield, firewall: ShieldCheck, waf: ShieldCheck,
  'relational-database': Database, 'nosql-database': Database,
  'object-storage': FolderArchive, 'block-storage': Database,
  'load-balancer': GitBranch, cdn: Globe, 'dns-zone': Globe,
  'vpn-gateway': Shield,
  // On-premise
  'physical-router': Router, 'physical-switch': SwitchCamera,
  'physical-server': Server,
  // Legacy
  router: Router, switch: SwitchCamera, server: Server,
};

const PROVIDER_BG: Record<string, string> = {
  aws: 'bg-gradient-to-br from-orange-50 to-white border-orange-200',
  gcp: 'bg-gradient-to-br from-blue-50 to-white border-blue-200',
  azure: 'bg-gradient-to-br from-cyan-50 to-white border-cyan-200',
  'on-premise': 'bg-gradient-to-br from-slate-50 to-white border-slate-300',
};

const ICON_COLOR: Record<string, string> = {
  aws: 'text-orange-600',
  gcp: 'text-blue-600',
  azure: 'text-cyan-600',
  'on-premise': 'text-slate-700',
};

export default function CustomNode({ data, selected }: { data: DeviceData; selected?: boolean }) {
  const IconComp = ICON_MAP[data.type] || Server;
  const provider = data.provider || 'aws';
  const bgClass = PROVIDER_BG[provider] || PROVIDER_BG['on-premise'];
  const iconColor = ICON_COLOR[provider] || 'text-slate-700';

  return (
    <div className={`
      ${bgClass}
      border rounded-xl shadow-md w-36
      flex flex-col items-center justify-center p-3 relative
      group transition-all duration-150
      ${selected ? 'ring-2 ring-indigo-500 shadow-lg scale-105' : 'hover:shadow-lg'}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <div className="mb-1.5 p-1.5 rounded-lg bg-white/70 shadow-sm">
        <IconComp className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="text-xs font-semibold text-center truncate w-full text-slate-800">
        {data.label}
      </div>
      {Boolean(data.properties?.cidr) && (
        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
          {String(data.properties!.cidr)}
        </div>
      )}
      {Boolean(data.properties?.ip) && (
        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
          {String(data.properties!.ip)}
        </div>
      )}
      {Boolean(data.properties?.instanceType) && (
        <div className="text-[10px] text-indigo-500 mt-0.5 font-mono">
          {String(data.properties!.instanceType)}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}
