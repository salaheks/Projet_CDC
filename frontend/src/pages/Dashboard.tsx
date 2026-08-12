import { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Layers, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  Menu,
  X
} from 'lucide-react';

import OverviewView from '../components/Dashboard/OverviewView';
import ProjectsView from '../components/Dashboard/ProjectsView';
import TemplatesView from '../components/Dashboard/TemplatesView';
import TeamView from '../components/Dashboard/TeamView';
import SettingsView from '../components/Dashboard/SettingsView';

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'projects', label: 'Mes Projets', icon: FolderOpen },
    { id: 'templates', label: 'Modèles', icon: Layers },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    setSidebarOpen(false);
  };

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':  return <OverviewView />;
      case 'projects':   return <ProjectsView />;
      case 'templates':  return <TemplatesView />;
      case 'team':       return <TeamView />;
      case 'settings':   return <SettingsView />;
      default:           return <OverviewView />;
    }
  };

  const SidebarContent = () => (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 pointer-events-none" />
      <div className="p-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ArchiFlow
          </h1>
        </div>
        {/* Close button – mobile only */}
        <button
          className="md:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 relative z-10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? 'bg-white/10 text-white shadow-lg shadow-black/20 backdrop-blur-md'
                  : 'hover:bg-white/5 hover:text-white text-slate-400'}`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && <div className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 relative z-10">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">

      {/* ── Mobile Overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop: always visible | mobile: drawer) ── */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[80px] translate-x-1/3 -translate-y-1/4 pointer-events-none" />

        {/* ── Top Header ── */}
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200/60 bg-white/60 backdrop-blur-xl relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger – mobile only */}
            <button
              className="md:hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search bar – hidden on smallest screens */}
            <div className="relative group hidden sm:block w-48 md:w-72 lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-all group-hover:-translate-y-0.5">
                JD
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Jean Dupont</p>
                <p className="text-xs text-slate-500">Architecte Logiciel</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {renderActiveView()}
          </div>
        </div>

        {/* ── Bottom Navigation (mobile only) ── */}
        <nav className="md:hidden border-t border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-around px-2 py-2 safe-area-inset-bottom flex-shrink-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
