
import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import BingoRoom from './views/BingoRoom';
import AdminPanel from './views/AdminPanel';
import { LayoutGrid, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';

const MainApp: React.FC = () => {
  const { config, setUser, user } = useGame();
  const [view, setView] = useState<'player' | 'admin' | 'login'>('login');

  const handleLogin = (isAdmin: boolean) => {
    setUser({
      id: isAdmin ? 'admin-1' : 'user-' + Math.floor(Math.random() * 1000),
      name: isAdmin ? 'Administrador' : 'Jogador Demo',
      whatsapp: '5511999999999',
      balance: 0.0, // Saldo inicial zerado como solicitado
      isFake: false
    });
    setView(isAdmin ? 'admin' : 'player');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 w-full max-w-md p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl text-center">
          <img src={config.logoUrl} alt="Logo" className="w-24 h-24 mx-auto mb-6 rounded-3xl object-cover shadow-lg border-2 border-slate-700" />
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">{config.bingoName}</h1>
          <p className="text-slate-500 mb-10 text-sm">Entre para jogar ou gerenciar a plataforma</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin(false)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-[0_8px_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3"
            >
              <UserIcon className="w-6 h-6" /> ENTRAR COMO JOGADOR
            </button>
            <button 
              onClick={() => handleLogin(true)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
            >
              <ShieldCheck className="w-5 h-5" /> ACESSO DIRETORIA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 inset-x-0 h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('player')}>
          <img src={config.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl" />
          <span className="font-black text-white italic tracking-tight hidden md:block">{config.bingoName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('player')}
            className={`p-2 rounded-lg transition-all ${view === 'player' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('admin')}
            className={`p-2 rounded-lg transition-all ${view === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-2" />
          <button 
            onClick={() => setView('login')}
            className="p-2 text-slate-400 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {view === 'player' ? <BingoRoom /> : <AdminPanel />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
};

export default App;
