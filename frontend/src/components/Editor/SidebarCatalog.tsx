import { Router, Server, Shield, SwitchCamera } from 'lucide-react';

const catalog = [
  { type: 'router', label: 'Routeur', icon: Router, desc: 'Routage IP' },
  { type: 'switch', label: 'Switch', icon: SwitchCamera, desc: 'Commutation L2/L3' },
  { type: 'firewall', label: 'Firewall', icon: Shield, desc: 'Sécurité réseau' },
  { type: 'server', label: 'Serveur', icon: Server, desc: 'Hébergement' },
];

export default function SidebarCatalog() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto z-10 shadow-sm relative">
      <h2 className="font-semibold mb-4 text-sm text-slate-500 uppercase tracking-wider">Catalogue</h2>
      <div className="space-y-3">
        {catalog.map((item) => (
          <div
            key={item.type}
            className="p-3 bg-white border border-slate-200 rounded shadow-sm cursor-grab hover:border-blue-400 hover:shadow flex items-start gap-3 transition-all"
            draggable
            onDragStart={(e) => onDragStart(e, item.type, item.label)}
          >
            <div className="mt-0.5">
              <item.icon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
