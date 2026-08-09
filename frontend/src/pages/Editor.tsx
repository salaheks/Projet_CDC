import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SidebarCatalog from '../components/Editor/SidebarCatalog';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import NetworkCanvas from '../components/Editor/NetworkCanvas';
import { useEditorStore } from '../stores/editorStore';
import { exportCanvasToPDF } from '../utils/pdfExport';

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const projectId = id || '1'; // Default project ID for demo
  const loadArchitecture = useEditorStore((state) => state.loadArchitecture);
  const saveArchitecture = useEditorStore((state) => state.saveArchitecture);
  const isLoading = useEditorStore((state) => state.isLoading);

  useEffect(() => {
    loadArchitecture(projectId);
  }, [projectId, loadArchitecture]);

  const handleSave = () => {
    saveArchitecture(projectId);
  };

  const handleExportPDF = () => {
    exportCanvasToPDF('reactflow-canvas', `Architecture_${projectId}`);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-20 relative">
        <h1 className="font-semibold text-lg text-blue-900 tracking-tight">Plateforme Architecture</h1>
        <div className="flex items-center gap-3">
          {isLoading && <span className="text-sm text-slate-500">En cours...</span>}
          <button 
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-medium transition-colors shadow-sm"
          >
            Exporter PDF
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 rounded shadow-sm font-medium transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden relative">
        <SidebarCatalog />
        <main className="flex-1 relative bg-slate-50" id="reactflow-canvas">
          <NetworkCanvas />
        </main>
        <PropertiesPanel />
      </div>
    </div>
  );
}
