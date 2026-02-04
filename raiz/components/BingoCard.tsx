
import React from 'react';
import { Card } from '../types';

interface BingoCardProps {
  card: Card;
  drawnBalls: number[];
  proximity?: number;
  prizeType?: string;
  highlight?: boolean;
}

const BingoCard: React.FC<BingoCardProps> = ({ card, drawnBalls, proximity, prizeType, highlight }) => {
  const isNear = proximity !== undefined && proximity <= 2 && proximity > 0;

  return (
    <div className={`
      bg-[#F3D5C0] p-1 md:p-1.5 rounded-sm border-2 border-stone-800 shadow-xl relative select-none transition-all duration-500
      ${highlight || isNear ? 'ring-4 ring-yellow-500 scale-[1.02] z-10' : ''}
    `}>
      {/* Detalhe da Tira de Papel Estilo Vintage */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#E8C4A9] border-r border-stone-800/20"></div>
      
      {/* Indicador de Proximidade */}
      {proximity !== undefined && proximity > 0 && (
        <div className={`
          absolute -top-3 -right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-lg z-20 border border-white
          ${isNear ? 'bg-red-600 text-white animate-bounce' : 'bg-slate-800 text-slate-300'}
        `}>
          FALTA {proximity} PARA {prizeType}
        </div>
      )}

      <div className="grid grid-cols-9 border-t-2 border-l-2 border-stone-900">
        {card.matrix.map((row, rIdx) => (
          row.map((num, cIdx) => (
            <div 
              key={`${rIdx}-${cIdx}`}
              className={`
                aspect-square flex items-center justify-center border-r-2 border-b-2 border-stone-900 
                font-black text-xs sm:text-sm md:text-lg lg:text-xl
                ${num === null ? 'bg-[#F3D5C0]' : 'text-stone-900 bg-white/5'}
                relative
              `}
            >
              <span className="relative z-10">
                {num !== null ? num.toString().padStart(2, '0') : ''}
              </span>
              
              {num !== null && drawnBalls.includes(num) && (
                <div className="absolute inset-0 flex items-center justify-center p-0.5">
                  <div className="w-full h-full bg-red-600/20 rounded-full border-[2px] md:border-[3px] border-red-600/50 flex items-center justify-center animate-in zoom-in-50 duration-300">
                     <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                  </div>
                </div>
              )}
            </div>
          ))
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-1 px-1">
        <span className="text-[6px] md:text-[8px] font-black text-stone-800 opacity-60 uppercase italic">
          #{card.id}
        </span>
        <span className="text-[6px] md:text-[8px] font-black text-red-700/60 uppercase">
          PRO SERIES
        </span>
      </div>
    </div>
  );
};

export default BingoCard;
