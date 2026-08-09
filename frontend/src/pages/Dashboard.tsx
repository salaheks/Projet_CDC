import { useNavigate } from 'react-router-dom';
import { PlusCircle, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900">
      <header className="mb-8 flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Plateforme d'Architecture</h1>
      </header>
      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Mes Projets</h2>
          <button 
            onClick={() => navigate('/editor')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Nouveau projet
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/editor/1')}
            className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2">Architecture PME (Démo)</h3>
            <p className="text-sm text-slate-500">Modifié aujourd'hui</p>
          </div>
        </div>
      </main>
    </div>
  );
}
