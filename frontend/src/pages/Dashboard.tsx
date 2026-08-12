import { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Layers, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell
} from 'lucide-react';

import OverviewView from '../components/Dashboard/OverviewView';
import ProjectsView from '../components/Dashboard/ProjectsView';
import TemplatesView from '../components/Dashboard/TemplatesView';
import TeamView from '../components/Dashboard/TeamView';
import SettingsView from '../components/Dashboard/SettingsView';

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'projects', label: 'Mes Projets', icon: FolderOpen },
    { id: 'templates', label: 'Modèles', icon: Layers },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <OverviewView />;
      case 'projects':
        return <ProjectsView />;
      case 'templates':
        return <TemplatesView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar - Glassmorphism style */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 relative shadow-2xl z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 pointer-events-none" />
        
        <div className="p-6 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ArchiFlow
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-md' 
                    : 'hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 relative z-10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[80px] translate-x-1/3 -translate-y-1/4" />

        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200/60 bg-white/50 backdrop-blur-xl relative z-10">
          <div className="relative group w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un projet, modèle..."
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all duration-300 shadow-sm hover:shadow-md"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-sm ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
                JD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Jean Dupont</p>
                <p className="text-xs text-slate-500">Architecte Logiciel</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Dashboard Content */}
        <div className="flex-1 overflow-auto p-8 relative z-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {renderActiveView()}
          </div>
        </div>
      </main>
    </div>
  );
}
