import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Share2, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2,
  Layers,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  Undo2,
  Redo2,
  FilePen,
  Settings2
} from 'lucide-react';
import SidebarCatalog from '../components/Editor/SidebarCatalog';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import NetworkCanvas from '../components/Editor/NetworkCanvas';
import { useEditorStore } from '../stores/editorStore';
import { exportCanvasToPDF, exportCanvasToPNG } from '../utils/pdfExport';

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id || '1';
  
  const loadArchitecture = useEditorStore((state) => state.loadArchitecture);
  const saveArchitecture = useEditorStore((state) => state.saveArchitecture);
  const isLoading = useEditorStore((state) => state.isLoading);
  const nodes = useEditorStore((state) => state.nodes);
  const edges = useEditorStore((state) => state.edges);

  const [showCopiedMsg, setShowCopiedMsg] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [projectName, setProjectName] = useState(`Architecture #${projectId}`);
  const [editingName, setEditingName] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false);

  useEffect(() => {
    loadArchitecture(projectId);
  }, [projectId, loadArchitecture]);

  const handleSave = async () => {
    await saveArchitecture(projectId);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleExportPDF = async () => {
    setIsExportOpen(false);
    setIsExporting(true);
    await exportCanvasToPDF('reactflow-canvas', projectName.replace(/\s+/g, '_'));
    setIsExporting(false);
  };

  const handleExportPNG = async () => {
    setIsExportOpen(false);
    setIsExporting(true);
    await exportCanvasToPNG('reactflow-canvas', projectName.replace(/\s+/g, '_'));
    setIsExporting(false);
  };

  const handleClearCanvas = () => {
    if (confirm('Êtes-vous sûr de vouloir tout effacer ?')) {
      useEditorStore.setState({ nodes: [], edges: [], selectedNode: null });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopiedMsg(true);
    setTimeout(() => setShowCopiedMsg(false), 3000);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden font-sans">
      
      {/* ───── TOP HEADER ───── */}
      <header className="h-14 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 flex items-center justify-between px-4 shadow-sm z-30 relative flex-shrink-0">
        
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all group text-sm font-medium flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          <div className="w-px h-5 bg-slate-200" />

          {/* Editable project name */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            {editingName ? (
              <input
                type="text"
                value={projectName}
                autoFocus
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                className="font-bold text-sm text-slate-800 bg-transparent border-b-2 border-indigo-500 outline-none min-w-0 max-w-[200px]"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="font-bold text-sm text-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-1.5 group truncate"
              >
                <span className="truncate">{projectName}</span>
                <FilePen className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            )}
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 ml-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              Synchronisation...
            </span>
          )}
        </div>

        {/* Center: quick stats */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <span className="font-semibold text-slate-700">{nodes.length}</span> nœuds
          <span className="mx-1.5 text-slate-300">·</span>
          <span className="font-semibold text-slate-700">{edges.length}</span> connexions
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Undo / Redo (placeholders for future feature) */}
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Annuler">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Rétablir">
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Clear */}
          <button
            onClick={handleClearCanvas}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-colors"
            title="Effacer tout"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:inline">Effacer</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
          >
            {showCopiedMsg
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              : <Share2 className="w-4 h-4" />
            }
            <span className="hidden md:inline">{showCopiedMsg ? 'Copié !' : 'Partager'}</span>
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => !isExporting && setIsExportOpen(!isExportOpen)}
              disabled={isExporting}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isExporting
                  ? 'text-indigo-600 bg-indigo-50 cursor-wait'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
              {isExporting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden md:inline">{isExporting ? 'Export...' : 'Exporter'}</span>
            </button>
            {isExportOpen && !isExporting && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsExportOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 z-50">
                  <button
                    onClick={handleExportPNG}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors font-medium"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    Image PNG
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    Document PDF
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 ml-1
              ${savedMsg
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/25 disabled:bg-slate-300 disabled:shadow-none'
              }`}
          >
            {savedMsg ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">{savedMsg ? 'Enregistré !' : 'Enregistrer'}</span>
          </button>
        </div>
      </header>

      {/* ───── TOOLBAR (canvas tools) ───── */}
      <div className="h-9 bg-slate-50 border-b border-slate-200/60 flex items-center px-4 gap-1 z-20 flex-shrink-0">
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mr-3">Outils</span>
        {[
          { icon: ZoomIn, label: 'Zoom avant', action: () => {} },
          { icon: ZoomOut, label: 'Zoom arrière', action: () => {} },
          { icon: LayoutGrid, label: 'Ajuster à l\'écran', action: () => {} },
        ].map((tool, i) => {
          const Icon = tool.icon;
          return (
            <button key={i} title={tool.label} onClick={tool.action}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-md transition-colors">
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Del</kbd>
          <span className="hidden sm:inline">pour supprimer</span>
          
          {/* Mobile toggles */}
          <button 
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600"
            onClick={() => setMobileCatalogOpen(true)}
          >
            <Layers className="w-3.5 h-3.5" />
            Cat.
          </button>
          <button 
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600"
            onClick={() => setMobilePropsOpen(true)}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Prop.
          </button>
        </div>
      </div>

      {/* ───── MAIN CONTENT ───── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile overlay for catalog */}
        {mobileCatalogOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileCatalogOpen(false)} />
        )}
        <div className={`absolute md:relative z-40 h-full transition-transform duration-300 ${mobileCatalogOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <SidebarCatalog className="w-64" />
        </div>

        {/* Canvas */}
        <main
          id="reactflow-canvas"
          className="flex-1 relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.04) 0%, transparent 70%), #f8fafc',
          }}
        >
          <NetworkCanvas />
        </main>

        {/* Mobile overlay for properties */}
        {mobilePropsOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobilePropsOpen(false)} />
        )}
        <div className={`absolute top-0 right-0 md:relative z-40 h-full transition-transform duration-300 ${mobilePropsOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
          <PropertiesPanel className="w-72" />
        </div>
      </div>
    </div>
  );
}
