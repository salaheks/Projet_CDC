import { User, Bell, Shield, Key } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Paramètres</h2>
        <p className="text-slate-500 mt-1">Configurez votre compte et vos préférences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 p-4 space-y-1">
          {[
            { id: 'profile', label: 'Profil', icon: User, active: true },
            { id: 'notifications', label: 'Notifications', icon: Bell, active: false },
            { id: 'security', label: 'Sécurité', icon: Shield, active: false },
            { id: 'api', label: 'Clés API', icon: Key, active: false },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${tab.active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <tab.icon className={`w-4 h-4 ${tab.active ? 'text-indigo-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Informations du Profil</h3>
          
          <form className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                JD
              </div>
              <div>
                <button type="button" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                  Changer l'avatar
                </button>
                <p className="text-xs text-slate-500 mt-2">JPG, GIF ou PNG. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Prénom</label>
                <input type="text" defaultValue="Jean" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nom</label>
                <input type="text" defaultValue="Dupont" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input type="email" defaultValue="jean.dupont@entreprise.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Rôle (Affichage public)</label>
                <input type="text" defaultValue="Architecte Logiciel" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
              </div>
            </div>

            <div className="pt-6">
              <button type="button" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                Sauvegarder les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
