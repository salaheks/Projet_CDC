import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, Network, LogOut, Clock, FolderOpen,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  updatedAt: string;
  owner: { name: string };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', provider: 'aws' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    try {
      const { data } = await api.post('/projects', newProject);
      setShowNewProject(false);
      setNewProject({ name: '', description: '', provider: 'aws' });
      navigate(`/editor/${data.id}`);
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer ce projet définitivement ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-600',
    IN_REVIEW: 'bg-amber-100 text-amber-700',
    VALIDATED: 'bg-green-100 text-green-700',
    ARCHIVED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">ArchPlatform</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Mes Projets</h2>
            <p className="text-sm text-slate-500 mt-1">
              {projects.length} projet{projects.length !== 1 ? 's' : ''} d'architecture
            </p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 font-medium text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau projet
          </button>
        </div>

        {/* New project form */}
        {showNewProject && (
          <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-lg">
            <h3 className="font-semibold text-slate-800 mb-4">Nouveau projet</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nom du projet"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
              <input
                type="text"
                placeholder="Description (optionnel)"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
              <select
                value={newProject.provider}
                onChange={(e) => setNewProject({ ...newProject, provider: e.target.value })}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              >
                <option value="aws">AWS</option>
                <option value="gcp">Google Cloud</option>
                <option value="azure">Azure</option>
                <option value="on-premise">On-Premise</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewProject(false)}
                className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                onClick={createProject}
                disabled={!newProject.name.trim()}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-all"
              >
                Créer
              </button>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            Chargement...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <FolderOpen className="w-12 h-12 mb-3 text-slate-300" />
            <p className="text-lg font-medium text-slate-500">Aucun projet</p>
            <p className="text-sm mt-1">Créez votre premier projet d'architecture</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/editor/${project.id}`)}
                className="group p-5 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:shadow-xl hover:border-indigo-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Network className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${STATUS_COLORS[project.status] || STATUS_COLORS.DRAFT}`}>
                      {project.status}
                    </span>
                    <button
                      onClick={(e) => deleteProject(project.id, e)}
                      className="p-1 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 text-base mb-1 truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-slate-500 truncate mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {new Date(project.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
