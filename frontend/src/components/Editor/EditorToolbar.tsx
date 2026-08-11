import { useEditorStore } from '../../stores/editorStore';
import {
  Save, CheckCircle, FileCode, AlertTriangle, Loader2,
} from 'lucide-react';

export default function EditorToolbar() {
  const {
    isDirty, isSaving, isValidating, isExporting,
    saveArchitecture, runValidation, exportIaC,
    validationReport,
    aiAuditReport, isAiAuditing, runAiAudit,
    aiSuggestions, isAiSuggesting, getAiSuggestions,
  } = useEditorStore();

  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 relative shadow-sm">
      {/* Left: Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">
          Éditeur d'Architecture
        </span>
        {isSaving && (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Sauvegarde...
          </span>
        )}
        {!isSaving && isDirty && (
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Non sauvegardé
          </span>
        )}
        {!isSaving && !isDirty && (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <CheckCircle className="w-3 h-3" />
            Synchronisé
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Save */}
        <button
          onClick={() => saveArchitecture()}
          disabled={!isDirty || isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          Sauvegarder
        </button>

        {/* Validate */}
        <button
          onClick={() => runValidation()}
          disabled={isValidating}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
            ${validationReport?.status === 'FAILED'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : validationReport?.status === 'PASSED'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }
            disabled:opacity-40 disabled:cursor-not-allowed
          `}
        >
          {isValidating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : validationReport?.status === 'FAILED' ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          Valider
          {validationReport && (
            <span className="ml-1 font-mono">
              ({validationReport.issues.length})
            </span>
          )}
        </button>

        {/* AI Audit */}
        <button
          onClick={() => runAiAudit()}
          disabled={isAiAuditing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 disabled:opacity-40 transition-all"
        >
          {isAiAuditing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          Audit IA
        </button>

        {/* AI Suggestions */}
        <button
          onClick={() => getAiSuggestions()}
          disabled={isAiSuggesting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-40 transition-all"
        >
          {isAiSuggesting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          Suggestions IA
        </button>

        {/* Export Terraform */}
        <button
          onClick={() => exportIaC('terraform')}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileCode className="w-3.5 h-3.5" />
          )}
          Exporter Terraform
        </button>
      </div>

      {/* AI Modals (Simple MVP) */}
      {aiAuditReport && (
        <div className="absolute top-14 right-4 w-96 bg-white shadow-xl rounded-xl border border-purple-200 p-4 z-50">
          <h3 className="font-bold text-purple-800 flex justify-between">
            Audit Sécurité IA (Score: {aiAuditReport.score})
            <button onClick={() => useEditorStore.setState({ aiAuditReport: null })} className="text-slate-400 hover:text-slate-600">×</button>
          </h3>
          <p className="text-sm text-slate-600 my-2">{aiAuditReport.summary}</p>
          <div className="max-h-64 overflow-y-auto mt-2">
            {aiAuditReport.recommendations?.map((rec: any, idx: number) => (
              <div key={idx} className="mb-2 p-2 bg-purple-50 rounded text-xs">
                <strong className="text-purple-700">[{rec.severity}] {rec.title}</strong>
                <p className="text-slate-700 mt-1">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiSuggestions && aiSuggestions.length > 0 && (
        <div className="absolute top-14 right-4 w-96 bg-white shadow-xl rounded-xl border border-blue-200 p-4 z-50">
          <h3 className="font-bold text-blue-800 flex justify-between">
            Suggestions IA
            <button onClick={() => useEditorStore.setState({ aiSuggestions: null })} className="text-slate-400 hover:text-slate-600">×</button>
          </h3>
          <div className="max-h-64 overflow-y-auto mt-2">
            {aiSuggestions.map((sug: any, idx: number) => (
              <div key={idx} className="mb-2 p-2 bg-blue-50 rounded text-xs">
                <strong className="text-blue-700">{sug.provider} / {sug.type}</strong>
                <p className="text-slate-700 mt-1">{sug.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
