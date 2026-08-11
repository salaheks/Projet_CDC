import { useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import { X, Copy, Check, FileCode } from 'lucide-react';

export default function ExportModal() {
  const exportedFiles = useEditorStore((s) => s.exportedFiles);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!exportedFiles || exportedFiles.length === 0) return null;

  const activeFile = exportedFiles[activeTab];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    useEditorStore.setState({ exportedFiles: null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-800">
              Code Terraform Généré
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* File tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4">
          {exportedFiles.map((file, idx) => (
            <button
              key={file.filename}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
                ${activeTab === idx
                  ? 'border-indigo-500 text-indigo-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {file.filename}
            </button>
          ))}
        </div>

        {/* Code content */}
        <div className="flex-1 overflow-auto relative">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white/90 backdrop-blur border border-slate-200 rounded-lg hover:bg-slate-100 transition-all shadow-sm z-10"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier
              </>
            )}
          </button>
          <pre className="p-4 text-sm font-mono text-slate-700 whitespace-pre overflow-x-auto bg-slate-50 min-h-[300px]">
            {activeFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
