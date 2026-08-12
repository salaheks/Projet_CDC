import { ArrowUpRight, Clock, FolderOpen, MoreVertical, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OverviewView() {
  const navigate = useNavigate();

  const recentProjects = [
    { id: '1', name: 'Architecture PME', date: 'Modifié il y a 2h', status: 'En cours', color: 'bg-blue-500' },
    { id: '2', name: 'Refonte SI', date: 'Modifié hier', status: 'Revue', color: 'bg-purple-500' },
    { id: '3', name: 'Migration Cloud', date: 'Modifié il y a 3j', status: 'Terminé', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bonjour, Jean! 👋</h2>
          <p className="text-slate-500 mt-1 text-lg">Voici un aperçu de vos projets d'architecture.</p>
        </div>
        <button 
          onClick={() => navigate('/editor')}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouveau projet
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Projets actifs', value: '12', trend: '+2 cette semaine', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Diagrammes créés', value: '48', trend: '+15 ce mois', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Heures collaborées', value: '124h', trend: '+12h cette semaine', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
                <h3 className={`text-4xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                <ArrowUpRight className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">Projets Récents</h3>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
            Voir tout
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProjects.map((project) => (
            <div 
              key={project.id}
              onClick={() => navigate(`/editor/${project.id}`)}
              className="group flex flex-col p-6 bg-white rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${project.color} group-hover:scale-110 transition-transform duration-300`}>
                  <FolderOpen className="w-6 h-6" />
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <h4 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{project.name}</h4>
              
              <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  {project.date}
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-medium text-xs">
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
