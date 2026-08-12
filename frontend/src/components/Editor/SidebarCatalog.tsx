import { Router, Server, Shield, SwitchCamera, Globe, Wifi, Database, Cloud, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const categories = [
  {
    id: 'network',
    label: 'Réseau',
    items: [
      { type: 'router',   label: 'Routeur',   icon: Router,       desc: 'Routage IP L3',    color: 'text-blue-600',    bg: 'bg-blue-50' },
      { type: 'switch',   label: 'Switch',    icon: SwitchCamera, desc: 'Commutation L2/L3', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { type: 'firewall', label: 'Firewall',  icon: Shield,       desc: 'Sécurité réseau',   color: 'text-red-600',     bg: 'bg-red-50' },
      { type: 'wireless', label: 'Wi-Fi AP',  icon: Wifi,         desc: 'Point d\'accès',    color: 'text-purple-600',  bg: 'bg-purple-50' },
      { type: 'internet', label: 'Internet',  icon: Globe,        desc: 'Réseau WAN/public', color: 'text-indigo-600',  bg: 'bg-indigo-50' },
    ],
  },
  {
    id: 'infra',
    label: 'Infrastructure',
    items: [
      { type: 'server',   label: 'Serveur',   icon: Server,   desc: 'Hébergement serveur',   color: 'text-slate-700',   bg: 'bg-slate-100' },
      { type: 'database', label: 'Base de données', icon: Database, desc: 'Stockage structuré', color: 'text-amber-600', bg: 'bg-amber-50' },
      { type: 'cloud',    label: 'Cloud',     icon: Cloud,    desc: 'Ressource cloud',       color: 'text-sky-600',     bg: 'bg-sky-50' },
    ],
  },
];

export default function SidebarCatalog({ className = '' }: { className?: string }) {
  const [openCats, setOpenCats] = useState<string[]>(['network', 'infra']);

  const toggleCat = (id: string) => {
    setOpenCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className={`w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col z-10 shadow-sm h-full ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Catalogue</p>
        <p className="text-sm text-slate-600 mt-0.5">Faites glisser sur le canvas</p>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {categories.map((cat) => {
          const isOpen = openCats.includes(cat.id);
          return (
            <div key={cat.id} className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/50">
              <button
                onClick={() => toggleCat(cat.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-100/80 transition-colors"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{cat.label}</span>
                {isOpen
                  ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                }
              </button>

              {isOpen && (
                <div className="px-2 pb-2 space-y-1.5">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => onDragStart(e, item.type, item.label)}
                        className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg} group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                          <div className="text-[11px] text-slate-500 truncate">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="px-4 py-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          💡 Glissez un élément sur le canvas pour l'ajouter
        </p>
      </div>
    </aside>
  );
}
