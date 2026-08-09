import SidebarCatalog from '../components/Editor/SidebarCatalog';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import NetworkCanvas from '../components/Editor/NetworkCanvas';

export default function Editor() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-20 relative">
        <h1 className="font-semibold text-lg text-blue-900 tracking-tight">Plateforme Architecture</h1>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-medium transition-colors shadow-sm">
            Exporter PDF
          </button>
          <button className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm font-medium transition-colors">
            Sauvegarder
          </button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden relative">
        <SidebarCatalog />
        <main className="flex-1 relative bg-slate-50">
          <NetworkCanvas />
        </main>
        <PropertiesPanel />
      </div>
    </div>
  );
}
