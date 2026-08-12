import { Copy, Server, Database, Shield, Layout, ArrowUpRight } from 'lucide-react';

export default function TemplatesView() {
  const templates = [
    { id: '1', title: 'Architecture AWS Basique', category: 'Cloud', icon: Server, color: 'text-orange-500', bg: 'bg-orange-50', desc: 'VPC, EC2, RDS, et Load Balancer configurés avec les meilleures pratiques de sécurité.' },
    { id: '2', title: 'Microservices Azure', category: 'Cloud', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-50', desc: 'AKS, Cosmos DB, et API Management prêts à être déployés.' },
    { id: '3', title: 'Cluster Base de Données', category: 'Data', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Architecture haute disponibilité pour bases de données relationnelles.' },
    { id: '4', title: 'Réseau Zéro Trust', category: 'Sécurité', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Modèle de sécurité réseau avec segmentation et vérification stricte.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Modèles d'Architecture</h2>
          <p className="text-slate-500 mt-1">Démarrez rapidement avec des modèles pré-configurés.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div key={tpl.id} className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${tpl.bg} ${tpl.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                  {tpl.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{tpl.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">{tpl.desc}</p>
              
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-indigo-600 rounded-xl font-medium group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Copy className="w-4 h-4" />
                Utiliser ce modèle
                <ArrowUpRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
