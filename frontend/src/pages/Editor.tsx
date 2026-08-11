import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SidebarCatalog from '../components/Editor/SidebarCatalog';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import NetworkCanvas from '../components/Editor/NetworkCanvas';
import EditorToolbar from '../components/Editor/EditorToolbar';
import ExportModal from '../components/Editor/ExportModal';
import { useEditorStore } from '../stores/editorStore';

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const projectId = id || '';
  const loadArchitecture = useEditorStore((state) => state.loadArchitecture);
  const isLoading = useEditorStore((state) => state.isLoading);

  useEffect(() => {
    if (projectId) {
      loadArchitecture(projectId);
    }
  }, [projectId, loadArchitecture]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Chargement du projet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden">
      <EditorToolbar />
      <div className="flex-1 flex overflow-hidden relative">
        <SidebarCatalog />
        <main className="flex-1 relative bg-slate-50" id="reactflow-canvas">
          <NetworkCanvas />
        </main>
        <PropertiesPanel />
      </div>
      <ExportModal />
    </div>
  );
}
