
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import BingoCard from '../components/BingoCard';
import WinnerAnnouncement from '../components/WinnerAnnouncement';
import { GameStatus, Card } from '../types';
import { calculateProximity } from '../services/bingoEngine';
import { Trophy, Users, DollarSign, ExternalLink, Share2, Wallet, Plus, X, Star, Grid3X3, Layers, LayoutList, TrendingUp, Landmark } from 'lucide-react';

const BingoRoom: React.FC = () => {
  const { config, gameState, user, userSeries, buySeries, addBalance } = useGame();
  const [showAffiliate, setShowAffiliate] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState('20');

  const [withdrawForm, setWithdrawForm] = useState({
    name: user?.name || '',
    cpf: '',
    whatsapp: user?.whatsapp || '',
    password: '',
    amount: ''
  });

  if (!user) return null;

  const currentWinners = gameState.winners;
  const prizeOrder: ('QUADRA' | 'LINHA' | 'BINGO')[] = ['QUADRA', 'LINHA', 'BINGO'];
  
  const activePrizeType = useMemo(() => {
    const nextToWin = prizeOrder.find(type => !currentWinners.some(w => w.type === type));
    return nextToWin || 'BINGO'; 
  }, [currentWinners]);

  const sortedUserCards = useMemo(() => {
    const allCards: (Card & { proximity: number })[] = [];
    userSeries.forEach(series => {
      series.cards.forEach(card => {
        const prox = calculateProximity(card, gameState.drawnBalls, activePrizeType as any);
        allCards.push({ ...card, proximity: prox });
      });
    });
    return allCards.sort((a, b) => a.proximity - b.proximity);
  }, [userSeries, gameState.drawnBalls, activePrizeType]);

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    addBalance(amt);
    setShowDeposit(false);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `*SOLICITAÇÃO DE SAQUE - BINGO MASTER*\n\n` +
                    `*Nome:* ${withdrawForm.name}\n` +
                    `*CPF:* ${withdrawForm.cpf}\n` +
                    `*WhatsApp:* ${withdrawForm.whatsapp}\n` +
                    `*Senha:* ${withdrawForm.password}\n` +
                    `*Valor do Saque:* R$ ${withdrawForm.amount}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${config.adminWhatsapp}?text=${encodedMessage}`, '_blank');
    setShowWithdraw(false);
  };

  const PrizeBox = ({ title, value, active, won }: { title: string, value: string, active: boolean, won: boolean }) => (
    <div className={`
      flex-1 p-2 md:p-3 rounded-xl md:rounded-2xl border-2 transition-all duration-700 flex flex-col items-center justify-center text-center min-w-[80px] md:min-w-[100px]
      ${active ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105 z-10 animate-pulse' : 
        won ? 'bg-green-500/10 border-green-500/30 opacity-60' : 
        'bg-slate-800/40 border-slate-700 opacity-40'}
    `}>
      <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${active ? 'text-yellow-400' : won ? 'text-green-400' : 'text-slate-500'}`}>
        {title}
      </span>
      <span className={`text-[10px] md:text-sm font-black ${active ? 'text-white' : 'text-slate-300'}`}>
        {value}
      </span>
      {won && <Star className="w-2 h-2 md:w-3 h-3 text-green-400 mt-0.5 md:mt-1 fill-current" />}
    </div>
  );

  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

  // Calcula prêmios em tempo real na WAITING phase para exibir ao usuário
  const dynamicPrizes = useMemo(() => {
    if (gameState.status === GameStatus.PLAYING || gameState.status === GameStatus.FINISHED) {
      return config.prizes;
    }
    const rev = gameState.currentMatchRevenue;
    return {
      quadra: (rev * config.prizePercentages.quadra) / 100,
      linha: (rev * config.prizePercentages.linha) / 100,
      bingo: (rev * config.prizePercentages.bingo) / 100,
      acumulado: config.prizes.acumulado,
      acumuladoArrecadacao: (rev * config.prizePercentages.accumulate) / 100
    };
  }, [gameState.currentMatchRevenue, gameState.status, config.prizePercentages, config.prizes.acumulado]);

  return (
    <div className="relative min-h-screen pt-16 pb-32 px-2 md:px-6 overflow-x-hidden">
      {gameState.currentAnnouncement && (
        <WinnerAnnouncement 
          announcement={gameState.currentAnnouncement} 
          drawnBalls={gameState.drawnBalls} 
        />
      )}

      <div 
        className="fixed inset-0 pointer-events-none z-[-1]"
        style={{ 
          backgroundImage: `url(${config.backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: config.backgroundOpacity 
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:gap-6">
        <div className="w-full bg-slate-900/90 backdrop-blur-xl p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border border-slate-800 shadow-2xl">
          <div className="flex flex-row gap-2 md:gap-3 overflow-x-auto no-scrollbar">
            <PrizeBox title="Quadra" value={`R$ ${dynamicPrizes.quadra.toFixed(2)}`} active={activePrizeType === 'QUADRA' && gameState.status === GameStatus.PLAYING} won={currentWinners.some(w => w.type === 'QUADRA')} />
            <PrizeBox title="Linha" value={`R$ ${dynamicPrizes.linha.toFixed(2)}`} active={activePrizeType === 'LINHA' && gameState.status === GameStatus.PLAYING} won={currentWinners.some(w => w.type === 'LINHA')} />
            <PrizeBox title="Bingo" value={`R$ ${dynamicPrizes.bingo.toFixed(2)}`} active={activePrizeType === 'BINGO' && gameState.status === GameStatus.PLAYING} won={currentWinners.some(w => w.type === 'BINGO')} />
            <PrizeBox title="Acumulado" value={`R$ ${dynamicPrizes.acumulado.toFixed(2)}`} active={gameState.drawnBalls.length <= 40 && !currentWinners.some(w => w.type === 'BINGO') && gameState.status === GameStatus.PLAYING} won={false} />
          </div>
          {gameState.status !== GameStatus.PLAYING && (
            <div className="mt-2 text-center">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">Arrecadação Real da Partida: R$ {gameState.currentMatchRevenue.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="w-full bg-slate-900/80 backdrop-blur-xl p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-800 shadow-2xl flex flex-row items-center gap-3 md:gap-6">
          <div className="flex-none w-24 md:w-36 text-center space-y-2">
            <h2 className="text-slate-500 text-[8px] md:text-[10px] uppercase font-black tracking-widest italic">Bola</h2>
            <div className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-bounce relative">
              <span className="text-slate-950 text-4xl md:text-6xl font-black italic relative z-10 drop-shadow-lg">
                {gameState.lastBall?.toString().padStart(2, '0') || '--'}
              </span>
            </div>
            <div className="bg-slate-950/50 px-2 py-1 rounded-full border border-slate-800">
               <span className="text-white text-[9px] md:text-[11px] font-black">{gameState.drawnBalls.length}/90</span>
            </div>
          </div>

          <div className="flex-grow bg-slate-950/40 p-2 md:p-3 rounded-xl border border-slate-800/50 overflow-hidden">
            <div className="grid grid-cols-10 md:grid-cols-15 gap-0.5 md:gap-1 w-full" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
              {allNumbers.map(num => {
                const isDrawn = gameState.drawnBalls.includes(num);
                const isLast = gameState.lastBall === num;
                return (
                  <div key={num} className={`aspect-square flex items-center justify-center rounded-[2px] md:rounded-md text-[7px] md:text-[9px] font-black transition-all duration-300 border ${isLast ? 'bg-white border-white text-slate-900 scale-125 shadow-[0_0_8px_#fff] z-10' : isDrawn ? 'bg-yellow-500 border-yellow-400 text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-700/50'}`}>
                    {num.toString().padStart(2, '0')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Ranking de Cartelas</h1>
                  <p className="text-slate-500 text-[10px] md:text-[11px] font-medium mt-1 uppercase tracking-wider">Mostrando as melhores para {activePrizeType}</p>
                </div>
              </div>
              <button onClick={buySeries} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-[10px] font-black transition-all shadow-[0_8px_20px_rgba(22,163,74,0.2)] uppercase italic">
                <Plus className="w-4 h-4" /> Comprar Nova Série
              </button>
            </div>

            <div className="space-y-6">
              {sortedUserCards.length === 0 ? (
                <div className="py-24 text-center bg-slate-900/20 rounded-[2.5rem] border-2 border-dashed border-slate-800">
                  <LayoutList className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhuma cartela ativa</p>
                  <button onClick={buySeries} className="mt-4 text-green-500 hover:text-green-400 text-xs font-black underline underline-offset-4 uppercase italic">Comprar Série Agora</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {sortedUserCards.map((card, idx) => (
                    <div key={card.id} className={`transition-all duration-700 ${idx < 3 ? 'animate-in fade-in slide-in-from-top-4' : ''}`}>
                      <BingoCard 
                        card={card} 
                        drawnBalls={gameState.drawnBalls} 
                        proximity={card.proximity}
                        prizeType={activePrizeType}
                        highlight={card.proximity <= 1}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-700 shadow-xl">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-6 text-white uppercase italic">
                <Trophy className="w-4 h-4 text-yellow-400" /> Ganhadores Recentes
              </h3>
              <div className="space-y-4">
                {gameState.winners.length === 0 ? (
                  <p className="text-slate-600 text-[10px] uppercase font-bold text-center py-4">Aguardando sorteio...</p>
                ) : (
                  gameState.winners.map((winner, idx) => (
                    <div key={idx} className="flex flex-col p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-white italic">{winner.userName}</span>
                        <span className="text-[8px] px-2 py-0.5 bg-yellow-500 text-slate-950 font-black rounded-md">{winner.type}</span>
                      </div>
                      <span className="text-[8px] text-slate-500 uppercase font-medium">{new Date(winner.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 h-20 md:h-24 bg-slate-950/90 backdrop-blur-3xl border-t border-slate-800/50 flex items-center justify-around px-2 md:px-4 z-40">
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-sm md:text-base font-black text-white italic tracking-tighter">R$ {user.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <button onClick={() => setShowDeposit(true)} className="w-6 h-6 md:w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-slate-950 hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-90">
                <Plus className="w-4 h-4 md:w-5 h-5" strokeWidth={4} />
              </button>
            </div>
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-[0.1em] mt-1">Saldo</span>
        </div>
        <div className="h-10 md:h-12 w-px bg-slate-800/50" />
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
              <span className="text-sm md:text-base font-black text-white italic tracking-tighter">{config.fakeUsersCount + 24}</span>
            </div>
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-[0.1em] mt-1">Online</span>
        </div>
        <div className="h-10 md:h-12 w-px bg-slate-800/50" />
        
        <button onClick={() => setShowWithdraw(true)} className="group flex flex-col items-center">
            <div className="w-10 h-10 md:w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center -mt-8 md:-mt-10 shadow-[0_8px_20px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform border-2 border-white/20">
                <Landmark className="w-5 h-5 md:w-6 h-6 text-white" />
            </div>
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-[0.1em] mt-1.5 md:mt-2">Saque</span>
        </button>
      </div>

      {showDeposit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-sm p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <button onClick={() => setShowDeposit(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase">Recarregar</h2>
            <div className="space-y-4 mt-8">
              <div className="grid grid-cols-3 gap-2">
                {['20', '50', '100'].map(val => (
                  <button key={val} onClick={() => setDepositAmount(val)} className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${depositAmount === val ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                    R$ {val}
                  </button>
                ))}
              </div>
              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Outro valor" className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl p-4 text-white font-black text-center text-lg focus:outline-none focus:border-blue-500 transition-colors" />
              <button onClick={handleDeposit} className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-black text-base transition-all shadow-[0_10px_30px_rgba(22,163,74,0.3)] mt-4 active:scale-95 uppercase italic">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-sm p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <button onClick={() => setShowWithdraw(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2 uppercase">Solicitar Saque</h2>
            <p className="text-slate-500 text-[10px] uppercase font-bold mb-6">Saldo disponível: R$ {user.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            
            <form onSubmit={handleWithdrawSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-500 text-[8px] uppercase font-black mb-1 px-1">Nome Completo</label>
                <input required type="text" value={withdrawForm.name} onChange={e => setWithdrawForm({...withdrawForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-indigo-500 transition-colors outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 text-[8px] uppercase font-black mb-1 px-1">CPF (PIX)</label>
                <input required type="text" placeholder="000.000.000-00" value={withdrawForm.cpf} onChange={e => setWithdrawForm({...withdrawForm, cpf: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-indigo-500 transition-colors outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 text-[8px] uppercase font-black mb-1 px-1">WhatsApp</label>
                <input required type="text" value={withdrawForm.whatsapp} onChange={e => setWithdrawForm({...withdrawForm, whatsapp: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-indigo-500 transition-colors outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 text-[8px] uppercase font-black mb-1 px-1">Senha da Conta</label>
                <input required type="password" placeholder="********" value={withdrawForm.password} onChange={e => setWithdrawForm({...withdrawForm, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:border-indigo-500 transition-colors outline-none" />
              </div>
              <div>
                <label className="block text-slate-500 text-[8px] uppercase font-black mb-1 px-1">Valor do Saque</label>
                <input required type="number" step="0.01" placeholder="0,00" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm font-black focus:border-indigo-500 transition-colors outline-none" />
              </div>
              
              <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black text-base text-white transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] mt-6 active:scale-95 uppercase italic">Solicitar Saque</button>
            </form>
          </div>
        </div>
      )}

      {showAffiliate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-md p-10 rounded-[3rem] border border-slate-700 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4 uppercase">Afiliados Master</h2>
            <p className="text-slate-500 text-xs mb-8 leading-relaxed font-medium">Ganhe <span className="text-green-400 font-black">10% DE BÔNUS</span> vitalício.</p>
            <div className="bg-slate-950 p-5 rounded-2xl border-2 border-slate-800 flex items-center justify-between gap-4">
              <code className="text-[9px] text-purple-400 font-black font-mono truncate">https://bingomaster.pro/ref/{user.id}</code>
              <button onClick={() => { navigator.clipboard.writeText(`https://bingomaster.pro/ref/${user.id}`); alert('Link copiado!'); }} className="bg-purple-600 hover:bg-purple-500 p-3 rounded-xl text-white transition-all active:scale-90">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <button onClick={() => setShowAffiliate(false)} className="mt-10 w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-black text-slate-300 transition-all uppercase tracking-widest text-[10px]">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BingoRoom;
