import { useState } from 'react';
import { Search, Filter, Folder, MoreHorizontal, FileText, CheckCircle, Clock } from 'lucide-react';

export default function ProjectsView() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const allProjects = [
    { id: '1', name: 'Architecture PME', type: 'Cloud', updated: 'Il y a 2h', status: 'En cours', author: 'Jean Dupont' },
    { id: '2', name: 'Refonte SI', type: 'On-Premise', updated: 'Hier', status: 'En revue', author: 'Marie Curie' },
    { id: '3', name: 'Migration Cloud AWS', type: 'Cloud', updated: 'Il y a 3j', status: 'Terminé', author: 'Jean Dupont' },
    { id: '4', name: 'Réseau IoT Factory', type: 'Edge', updated: 'Il y a 1 sem', status: 'En cours', author: 'Lucas Blanc' },
    { id: '5', name: 'Backend Microservices', type: 'Cloud', updated: 'Il y a 2 sem', status: 'Terminé', author: 'Marie Curie' },
  ];

  const filtered = allProjects.filter(p => {
    const matchFilter = filter === 'all'
      || (filter === 'in-progress' && p.status === 'En cours')
      || (filter === 'completed' && p.status === 'Terminé');
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusStyle = (status: string) => {
    if (status === 'Terminé') return 'bg-emerald-50 text-emerald-700';
    if (status === 'En revue') return 'bg-amber-50 text-amber-700';
    return 'bg-blue-50 text-blue-700';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mes Projets</h2>
          <p className="text-slate-500 mt-1 text-sm">Gérez tous vos schémas d'architecture ici.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Filtrer</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-slate-100 gap-1">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'in-progress', label: 'En cours' },
          { key: 'completed', label: 'Terminés' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              filter === f.key
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Desktop: Table | Mobile: Cards */}
      {/* Cards (always visible on mobile, hidden on md+) */}
      <div className="space-y-3 md:hidden">
        {filtered.map(project => (
          <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
              <Folder className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{project.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{project.author} · {project.updated}</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusStyle(project.status)}`}>
              {project.status === 'Terminé' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {project.status}
            </span>
          </div>
        ))}
      </div>

      {/* Table (hidden on mobile, visible on md+) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Nom du projet</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Dernière modif.</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold">Auteur</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(project => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Folder className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-800">{project.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      <FileText className="w-3 h-3" /> {project.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{project.updated}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(project.status)}`}>
                      {project.status === 'Terminé' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">{project.author}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Folder className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun projet trouvé</p>
        </div>
      )}
    </div>
  );
}
