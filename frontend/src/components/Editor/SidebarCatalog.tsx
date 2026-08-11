import { useEffect, useState } from 'react';
import {
  Cloud, Server, Shield, Database, GitBranch, Globe,
  ArrowUpDown, Route, Zap, ShieldCheck, FolderArchive,
  SwitchCamera, Router, LayoutGrid, Search, ChevronDown, ChevronRight,
} from 'lucide-react';
import api from '../../utils/api';
import type { CatalogComponentDTO } from '../../stores/editorStore';

interface CatalogCategory {
  id: string;
  name: string;
  icon: string | null;
  components: CatalogComponentDTO[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Cloud, Server, Shield, Database, GitBranch, Globe,
  ArrowUpDown, Route, Zap, ShieldCheck, FolderArchive,
  SwitchCamera, Router, LayoutGrid, Network: Cloud, Container: Server,
};

const PROVIDER_COLORS: Record<string, string> = {
  aws: 'bg-orange-50 border-orange-200 text-orange-700',
  gcp: 'bg-blue-50 border-blue-200 text-blue-700',
  azure: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  'on-premise': 'bg-gray-50 border-gray-200 text-gray-700',
};

const PROVIDER_LABELS: Record<string, string> = {
  aws: 'AWS',
  gcp: 'GCP',
  azure: 'Azure',
  'on-premise': 'On-Prem',
};

export default function SidebarCatalog() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalog();
  }, [selectedProvider]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const params = selectedProvider ? { provider: selectedProvider } : {};
      const { data } = await api.get('/catalog', { params });
      setCategories(data);
      // Expand all categories by default
      setExpandedCategories(new Set(data.map((c: CatalogCategory) => c.id)));
    } catch (error) {
      console.error('Failed to load catalog', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onDragStart = (event: React.DragEvent, component: CatalogComponentDTO) => {
    const payload = JSON.stringify({
      type: component.type,
      label: component.name,
      provider: component.provider,
      catalogItemId: component.id,
      propertySchema: component.propertySchema,
    });
    event.dataTransfer.setData('application/reactflow', payload);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      components: cat.components.filter((c) =>
        searchQuery
          ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.type.toLowerCase().includes(searchQuery.toLowerCase())
          : true,
      ),
    }))
    .filter((cat) => cat.components.length > 0);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden z-10 shadow-sm relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">
          Catalogue
        </h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Provider filter */}
        <div className="flex gap-1 flex-wrap">
          {['', 'aws', 'gcp', 'on-premise'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all
                ${selectedProvider === p
                  ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {p ? PROVIDER_LABELS[p] : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {/* Categories list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Chargement...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Aucun composant trouvé
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            return (
              <div key={category.id} className="mb-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:bg-slate-50 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  {category.name}
                  <span className="ml-auto text-slate-400 text-[10px] font-normal normal-case">
                    {category.components.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-1.5 mt-1 ml-1">
                    {category.components.map((comp) => {
                      const IconComp = ICON_MAP[comp.icon || 'Server'] || Server;
                      const providerColor = PROVIDER_COLORS[comp.provider] || PROVIDER_COLORS['on-premise'];
                      return (
                        <div
                          key={comp.id}
                          className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab hover:border-indigo-400 hover:shadow-md flex items-start gap-2.5 transition-all active:scale-[0.97]"
                          draggable
                          onDragStart={(e) => onDragStart(e, comp)}
                        >
                          <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <IconComp className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm text-slate-800 truncate">
                              {comp.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {comp.description}
                            </div>
                            <span className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded border font-medium ${providerColor}`}>
                              {PROVIDER_LABELS[comp.provider] || comp.provider}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
