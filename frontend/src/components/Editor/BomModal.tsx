import { X, Receipt, Download, FileText } from 'lucide-react';
import { useEditorStore } from '../../stores/editorStore';

type BomModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Mock prices for demo purposes
const MOCK_PRICES: Record<string, number> = {
  router: 1250,
  switch: 800,
  firewall: 2500,
  server: 4500,
  wireless: 350,
  database: 0, // usually software
  cloud: 0, // variable
  internet: 0, // service
};

export default function BomModal({ isOpen, onClose }: BomModalProps) {
  const nodes = useEditorStore((state) => state.nodes);

  if (!isOpen) return null;

  // Calculate BOM
  const inventory = nodes.reduce((acc, node) => {
    const type = node.data.type || 'server';
    if (!acc[type]) {
      acc[type] = {
        label: node.data.type === 'router' ? 'Routeur' : 
               node.data.type === 'switch' ? 'Switch' : 
               node.data.type === 'firewall' ? 'Firewall' : 
               node.data.type === 'wireless' ? 'Point d\'accès Wi-Fi' : 
               node.data.type === 'server' ? 'Serveur physique' : node.data.type,
        count: 0,
        unitPrice: MOCK_PRICES[type] || 0,
      };
    }
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { label: string; count: number; unitPrice: number }>);

  const bomItems = Object.values(inventory).filter(item => item.count > 0 && item.unitPrice > 0);
  const totalCost = bomItems.reduce((total, item) => total + (item.count * item.unitPrice), 0);

  const handleExportCSV = () => {
    let csv = 'Equipement,Quantite,Prix Unitaire (EUR),Total (EUR)\n';
    bomItems.forEach(item => {
      csv += `${item.label},${item.count},${item.unitPrice},${item.count * item.unitPrice}\n`;
    });
    csv += `Total,,,${totalCost}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'nomenclature.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 leading-tight">Nomenclature & Coûts</h2>
                <p className="text-sm text-slate-500">Estimation basée sur l'architecture actuelle</p>
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
          <div className="p-6 overflow-y-auto">
            {bomItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucun équipement matériel facturable dans l'architecture.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Équipement</th>
                      <th className="px-4 py-3 text-center">Quantité</th>
                      <th className="px-4 py-3 text-right">Prix Unitaire</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bomItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800 capitalize">{item.label}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{item.count}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{item.unitPrice.toLocaleString()} €</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-800">{(item.count * item.unitPrice).toLocaleString()} €</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-800">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right">Total Estimé (HT)</td>
                      <td className="px-4 py-3 text-right text-indigo-600 text-base">{totalCost.toLocaleString()} €</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              <strong>Note :</strong> Ces prix sont des estimations purement indicatives (mockées) pour les besoins de démonstration. Les licences logicielles et coûts d'intégration ne sont pas inclus.
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handleExportCSV}
              disabled={bomItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exporter (CSV)
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
