import { Mail, Phone, MoreHorizontal, UserPlus } from 'lucide-react';

export default function TeamView() {
  const team = [
    { id: 1, name: 'Jean Dupont', role: 'Architecte Logiciel', email: 'jean.dupont@entreprise.com', initial: 'JD', color: 'from-indigo-500 to-purple-600' },
    { id: 2, name: 'Marie Curie', role: 'Ingénieur Cloud', email: 'marie.curie@entreprise.com', initial: 'MC', color: 'from-pink-500 to-rose-500' },
    { id: 3, name: 'Lucas Blanc', role: 'DevOps', email: 'lucas.blanc@entreprise.com', initial: 'LB', color: 'from-emerald-400 to-teal-500' },
    { id: 4, name: 'Sophie Martin', role: 'Product Owner', email: 'sophie.martin@entreprise.com', initial: 'SM', color: 'from-orange-400 to-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mon Équipe</h2>
          <p className="text-slate-500 mt-1">Gérez les membres de votre espace de travail.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-medium">
          <UserPlus className="w-5 h-5" />
          Ajouter un membre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center relative group">
            <button className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-tr ${member.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {member.initial}
            </div>
            
            <h3 className="text-lg font-bold text-slate-800">{member.name}</h3>
            <p className="text-sm font-medium text-indigo-600 mb-4">{member.role}</p>
            
            <div className="flex justify-center gap-3">
              <button className="p-2.5 bg-slate-50 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
              <button className="p-2.5 bg-slate-50 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
