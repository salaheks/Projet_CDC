import { useState } from 'react';
import { Search, Filter, Folder, MoreHorizontal, FileText, CheckCircle, Clock } from 'lucide-react';

export default function ProjectsView() {
  const [filter, setFilter] = useState('all');

  const allProjects = [
    { id: '1', name: 'Architecture PME', type: 'Cloud', updated: 'Il y a 2h', status: 'En cours', author: 'Jean Dupont' },
    { id: '2', name: 'Refonte SI', type: 'On-Premise', updated: 'Hier', status: 'En revue', author: 'Marie Curie' },
    { id: '3', name: 'Migration Cloud AWS', type: 'Cloud', updated: 'Il y a 3j', status: 'Terminé', author: 'Jean Dupont' },
    { id: '4', name: 'Réseau IoT Factory', type: 'Edge', updated: 'Il y a 1 sem', status: 'En cours', author: 'Lucas Blanc' },
    { id: '5', name: 'Backend Microservices', type: 'Cloud', updated: 'Il y a 2 sem', status: 'Terminé', author: 'Marie Curie' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mes Projets</h2>
          <p className="text-slate-500 mt-1">Gérez tous vos schémas d'architecture ici.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrer</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 p-2 gap-2 bg-slate-50/50">
          {['all', 'in-progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? 'bg-white shadow-sm text-indigo-600 border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {f === 'all' ? 'Tous' : f === 'in-progress' ? 'En cours' : 'Terminés'}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold">Nom du projet</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Dernière modif.</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold">Auteur</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Folder className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-800">{project.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      <FileText className="w-3 h-3" /> {project.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {project.updated}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${project.status === 'Terminé' ? 'bg-emerald-50 text-emerald-700' : project.status === 'En revue' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                      {project.status === 'Terminé' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-medium">
                    {project.author}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
