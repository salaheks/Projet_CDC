import { useEditorStore } from '../../stores/editorStore';

export default function PropertiesPanel() {
  const selectedNode = useEditorStore((state) => state.selectedNode);
  const updateNodeData = useEditorStore((state) => state.updateNodeData);

  if (!selectedNode) {
    return (
      <aside className="w-72 bg-white border-l border-slate-200 p-4 z-10 shadow-sm relative">
        <h2 className="font-semibold mb-4 text-sm text-slate-500 uppercase tracking-wider">Propriétés</h2>
        <div className="text-sm text-slate-500 flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded">
          Sélectionnez un équipement
        </div>
      </aside>
    );
  }

  const { data, id } = selectedNode;

  return (
    <aside className="w-72 bg-white border-l border-slate-200 p-4 z-10 shadow-sm relative">
      <h2 className="font-semibold mb-4 text-sm text-slate-500 uppercase tracking-wider">Propriétés</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Type d'équipement</label>
          <div className="px-3 py-2 bg-slate-100 rounded text-sm font-medium capitalize text-slate-700">{data.type}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Nom (Label)</label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Adresse IP</label>
          <input
            type="text"
            value={data.ip || ''}
            placeholder="ex: 192.168.1.1"
            onChange={(e) => updateNodeData(id, { ip: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">VLAN</label>
          <input
            type="text"
            value={data.vlan || ''}
            placeholder="ex: 10"
            onChange={(e) => updateNodeData(id, { vlan: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
      </div>
    </aside>
  );
}
