import { useEditorStore, type PropertySchemaItem } from '../../stores/editorStore';
import { Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function PropertiesPanel() {
  const selectedNode = useEditorStore((s) => s.selectedNode);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const updateNodeProperties = useEditorStore((s) => s.updateNodeProperties);
  const deleteSelectedNode = useEditorStore((s) => s.deleteSelectedNode);
  const validationReport = useEditorStore((s) => s.validationReport);

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col z-10 shadow-sm relative">
        <div className="p-4">
          <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-4">Propriétés</h2>
          <div className="text-sm text-slate-400 flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg">
            Sélectionnez un composant
          </div>
        </div>

        {/* Validation summary */}
        {validationReport && (
          <div className="border-t border-slate-100 p-4">
            <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">
              Validation
            </h3>
            <div className={`p-3 rounded-lg text-sm ${
              validationReport.status === 'PASSED'
                ? 'bg-green-50 text-green-700'
                : validationReport.status === 'WARNING'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-red-50 text-red-700'
            }`}>
              {validationReport.status === 'PASSED' && <CheckCircle className="w-4 h-4 inline mr-1" />}
              {validationReport.status === 'WARNING' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
              {validationReport.status === 'FAILED' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
              {validationReport.summary}
            </div>
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {validationReport.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-xs ${
                    issue.severity === 'ERROR' ? 'bg-red-50 text-red-700'
                    : issue.severity === 'WARNING' ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <span className="font-mono font-bold mr-1">[{issue.ruleCode}]</span>
                  {issue.message}
                  {issue.suggestion && (
                    <div className="mt-1 flex items-start gap-1 text-[11px] opacity-80">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {issue.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    );
  }

  const { data, id } = selectedNode;
  const propertySchema: PropertySchemaItem[] = data.propertySchema || [];

  // Get validation issues for this node
  const nodeIssues = validationReport?.issues.filter((i) => i.nodeId === id) || [];

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-y-auto z-10 shadow-sm relative">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Propriétés</h2>
          <button
            onClick={deleteSelectedNode}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type (read-only) */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Type
            </label>
            <div className="px-3 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 capitalize">
              {data.label}
              {data.provider && (
                <span className="ml-2 text-xs text-slate-400 uppercase">
                  ({data.provider})
                </span>
              )}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Nom (Label)
            </label>
            <input
              type="text"
              value={data.label}
              onChange={(e) => updateNodeData(id, { label: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          {/* Dynamic fields from property schema */}
          {propertySchema.length > 0 && (
            <>
              <div className="border-t border-slate-100 pt-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Configuration
                </h3>
              </div>

              {propertySchema.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={data.properties?.[field.key]}
                  onChange={(value) => updateNodeProperties(id, { [field.key]: value })}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Node-specific validation issues */}
      {nodeIssues.length > 0 && (
        <div className="border-t border-slate-100 p-4 mt-auto">
          <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
            Problèmes ({nodeIssues.length})
          </h3>
          <div className="space-y-2">
            {nodeIssues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-xs ${
                  issue.severity === 'ERROR'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                }`}
              >
                <span className="font-mono font-bold">[{issue.ruleCode}]</span>{' '}
                {issue.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Dynamic field renderer ──

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: PropertySchemaItem;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const baseInputClasses =
    'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all';

  switch (field.type) {
    case 'select':
      return (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          <select
            value={String(value ?? field.defaultValue ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          >
            <option value="">— Choisir —</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-500">
            {field.label}
          </label>
          <button
            onClick={() => onChange(!(value ?? field.defaultValue ?? false))}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              (value ?? field.defaultValue) ? 'bg-indigo-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                (value ?? field.defaultValue) ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      );

    case 'number':
      return (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="number"
            value={Number(value ?? field.defaultValue ?? '')}
            min={field.min}
            max={field.max}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className={baseInputClasses}
          />
        </div>
      );

    case 'ip':
    case 'cidr':
    case 'string':
    case 'port':
    default:
      return (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={String(value ?? field.defaultValue ?? '')}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          />
        </div>
      );
  }
}
