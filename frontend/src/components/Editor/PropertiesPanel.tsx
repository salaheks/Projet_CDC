import { useEditorStore } from '../../stores/editorStore';
import { Router, Server, Shield, SwitchCamera, Globe, Wifi, Database, Cloud, Trash2, X, Layers } from 'lucide-react';

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  router:   { label: 'Routeur',         icon: Router,       color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  switch:   { label: 'Switch',          icon: SwitchCamera, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  firewall: { label: 'Firewall',        icon: Shield,       color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200' },
  server:   { label: 'Serveur',         icon: Server,       color: 'text-slate-700',   bg: 'bg-slate-100',  border: 'border-slate-200' },
  internet: { label: 'Internet',        icon: Globe,        color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  wireless: { label: 'Wi-Fi AP',        icon: Wifi,         color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200' },
  database: { label: 'Base de données', icon: Database,     color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  cloud:    { label: 'Cloud',           icon: Cloud,        color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'border-sky-200' },
};

const Field = ({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white transition-all"
    />
  </div>
);

export default function PropertiesPanel({ className = '' }: { className?: string }) {
  const selectedNode = useEditorStore((state) => state.selectedNode);
  const updateNodeData = useEditorStore((state) => state.updateNodeData);
  const setSelectedNode = useEditorStore((state) => state.setSelectedNode);
  const nodes = useEditorStore((state) => state.nodes);
  const edges = useEditorStore((state) => state.edges);

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    useEditorStore.setState({
      nodes: nodes.filter(n => n.id !== selectedNode.id),
      edges: edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id),
      selectedNode: null,
    });
  };

  // If no node is selected, show global diagram stats
  if (!selectedNode) {
    return (
      <aside className={`w-full md:w-72 bg-white border-l border-slate-200/80 flex flex-col z-10 h-full ${className}`}>
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Propriétés</p>
        </div>
        <div className="flex-1 p-5 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-600 font-medium mb-1">Aucun nœud sélectionné</h3>
          <p className="text-sm text-slate-400 max-w-[200px]">
            Cliquez sur un composant pour voir et éditer ses propriétés
          </p>
          
          {/* General Stats */}
          <div className="mt-8 w-full space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Composants</span>
              <span className="text-lg font-bold text-slate-700">{nodes.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Connexions</span>
              <span className="text-lg font-bold text-slate-700">{edges.length}</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const { data, id } = selectedNode;
  const cfg = typeConfig[data.type] || typeConfig.server;
  const Icon = cfg.icon;

  return (
    <aside className={`w-full md:w-72 bg-white border-l border-slate-200/80 flex flex-col z-10 h-full ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Propriétés</p>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Node Identity */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}>
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <Icon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div>
            <div className="font-bold text-slate-800">{data.label}</div>
            <div className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</div>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <Field
          label="Nom (Label)"
          value={data.label}
          placeholder="Nom de l'équipement"
          onChange={(v) => updateNodeData(id, { label: v })}
        />
        <Field
          label="Adresse IP"
          value={data.ip || ''}
          placeholder="ex: 192.168.1.1"
          onChange={(v) => updateNodeData(id, { ip: v })}
        />
        <Field
          label="VLAN"
          value={data.vlan || ''}
          placeholder="ex: 10, 20..."
          onChange={(v) => updateNodeData(id, { vlan: v })}
        />

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">Type</label>
          <div className={`w-full px-3 py-2.5 ${cfg.bg} border ${cfg.border} rounded-xl text-sm font-semibold ${cfg.color} capitalize`}>
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleDeleteNode}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer cet équipement
        </button>
      </div>
    </aside>
  );
}
