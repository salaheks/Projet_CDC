import { Handle, Position } from 'reactflow';
import { Router, Server, Shield, SwitchCamera } from 'lucide-react';
import type { DeviceData } from '../../stores/editorStore';

const iconMap: Record<string, React.ReactNode> = {
  router: <Router className="w-6 h-6 text-blue-600" />,
  switch: <SwitchCamera className="w-6 h-6 text-green-600" />,
  firewall: <Shield className="w-6 h-6 text-red-600" />,
  server: <Server className="w-6 h-6 text-slate-700" />,
};

export default function CustomNode({ data }: { data: DeviceData }) {
  return (
    <div className="bg-white border border-slate-300 rounded shadow-md w-32 flex flex-col items-center justify-center p-3 relative group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="mb-2">{iconMap[data.type] || <Server className="w-6 h-6" />}</div>
      <div className="text-xs font-semibold text-center truncate w-full">{data.label}</div>
      {data.ip && <div className="text-[10px] text-slate-500 mt-0.5">{data.ip}</div>}
      {data.vlan && <div className="text-[10px] text-indigo-500 mt-0.5">VLAN: {data.vlan}</div>}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
