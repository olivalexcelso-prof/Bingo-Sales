
import React from 'react';
import { WinEvent } from '../types';
import BingoCard from './BingoCard';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface WinnerAnnouncementProps {
  announcement: WinEvent;
  drawnBalls: number[];
}

const WinnerAnnouncement: React.FC<WinnerAnnouncementProps> = ({ announcement, drawnBalls }) => {
  const isBingo = announcement.type === 'BINGO';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Background Dimmer & Blur */}
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-700"></div>
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className={`absolute rounded-full animate-pulse ${isBingo ? 'bg-yellow-400/30' : 'bg-white/20'}`}
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative w-full max-w-2xl text-center animate-in zoom-in-90 duration-700">
        {/* Header Section */}
        <div className="mb-6 md:mb-10">
          <div className={`
            inline-flex items-center justify-center p-5 rounded-full mb-6 shadow-2xl animate-bounce
            ${isBingo ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-blue-600 shadow-blue-600/50'}
          `}>
            {isBingo ? <Sparkles className="w-14 h-14 text-slate-950" /> : <Trophy className="w-14 h-14 text-white" />}
          </div>
          
          <h2 className={`
            text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]
            ${isBingo ? 'text-yellow-500' : 'text-white'}
          `}>
            {isBingo ? 'BINGO! CARTELA CHEIA' : 'TEMOS UM GANHADOR!'}
          </h2>

          <div className="flex items-center justify-center gap-4">
             <Star className="w-6 h-6 text-yellow-500 fill-current animate-spin-slow" />
             <span className={`
               text-2xl md:text-4xl font-black uppercase italic tracking-widest px-8 py-2 rounded-full border-2
               ${isBingo ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-slate-800 border-slate-600 text-slate-200'}
             `}>
               {announcement.type}
             </span>
             <Star className="w-6 h-6 text-yellow-500 fill-current animate-spin-slow" />
          </div>
        </div>

        {/* Winner Card Container */}
        <div className="bg-slate-900/90 p-6 md:p-10 rounded-[3rem] border border-slate-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] space-y-8 relative overflow-hidden group">
          <div className={`
            absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r
            ${isBingo ? 'from-yellow-600 via-yellow-400 to-yellow-600' : 'from-blue-600 via-white to-blue-600'}
          `}></div>
          
          <div className="space-y-1">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">O GRANDE VENCEDOR É</p>
            <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tight uppercase group-hover:scale-105 transition-transform duration-500">
              {announcement.userName}
            </h3>
          </div>

          <div className="pt-2 scale-100 md:scale-115 origin-center">
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Cartela Validada #{announcement.card.id}</p>
            <div className="max-w-md mx-auto transform -rotate-1 shadow-2xl">
              <BingoCard 
                card={announcement.card} 
                drawnBalls={drawnBalls} 
                highlight={true} 
              />
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-2">
           <p className="text-slate-400 text-sm font-bold animate-pulse italic flex items-center justify-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full"></span> Sorteio Pausado para Celebração
           </p>
           <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Aguarde a narração oficial...</p>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WinnerAnnouncement;
