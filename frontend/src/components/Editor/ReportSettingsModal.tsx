import { X, Settings2, Save } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';
import { useState, useEffect } from 'react';

type ReportSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ReportSettingsModal({ isOpen, onClose }: ReportSettingsModalProps) {
  const reportSettings = useEditorStore((state) => state.reportSettings);
  const updateReportSettings = useEditorStore((state) => state.updateReportSettings);

  const [clientName, setClientName] = useState(reportSettings.clientName);
  const [logoUrl, setLogoUrl] = useState(reportSettings.logoUrl);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setClientName(reportSettings.clientName);
      setLogoUrl(reportSettings.logoUrl);
    }
  }, [isOpen, reportSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateReportSettings({ clientName, logoUrl });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">Paramètres du Rapport</h2>
                <p className="text-sm text-slate-500">Personnalisation de l'export PDF</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Nom du Client / Projet</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Société Générale"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all"
              />
              <p className="text-xs text-slate-500">Apparaîtra dans l'en-tête de la documentation technique.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">URL du Logo Client (optionnel)</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemple.com/logo.png"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all"
              />
            </div>

            {logoUrl && (
              <div className="mt-4 p-4 border border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
                <img 
                  src={logoUrl} 
                  alt="Aperçu logo" 
                  className="max-h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
