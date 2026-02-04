
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppConfig, GameState, GameStatus, User, Series, WinEvent } from '../types';
import { DEFAULT_CONFIG, INITIAL_GAME_STATE } from '../constants';
import { generateSeries, checkWin } from '../services/bingoEngine';

interface GameContextType {
  config: AppConfig;
  gameState: GameState;
  user: User | null;
  userSeries: Series[];
  updateConfig: (newConfig: AppConfig) => void;
  buySeries: () => void;
  setUser: (user: User | null) => void;
  addBalance: (amount: number) => void;
  forceStart: () => void;
  forceEnd: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('bingo_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [user, setUser] = useState<User | null>(null);
  const [userSeries, setUserSeries] = useState<Series[]>([]);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  
  const drawIntervalRef = useRef<number | null>(null);
  const narrationPlayedRef = useRef<{ [key: string]: boolean }>({});
  const synth = window.speechSynthesis;

  useEffect(() => {
    localStorage.setItem('bingo_config', JSON.stringify(config));
  }, [config]);

  const speak = (text: string, onEnd?: () => void) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;
    if (onEnd) {
      utterance.onend = onEnd;
    }
    synth.speak(utterance);
  };

  const speakSequence = (texts: string[], onComplete?: () => void) => {
    if (synth.speaking) synth.cancel();
    let index = 0;
    const playNext = () => {
      if (index < texts.length) {
        speak(texts[index], () => {
          index++;
          playNext();
        });
      } else if (onComplete) {
        onComplete();
      }
    };
    playNext();
  };

  const updateConfig = (newConfig: AppConfig) => setConfig(newConfig);

  const addBalance = (amount: number) => {
    setUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null);
  };

  const buySeries = () => {
    if (!user || user.balance < config.seriesPrice) {
      alert("Saldo insuficiente! Adicione créditos clicando no '+' ao lado do saldo.");
      return;
    }
    const newSeries = generateSeries(user.id);
    setUserSeries(prev => [...prev, newSeries]);
    setUser(prev => prev ? { ...prev, balance: prev.balance - config.seriesPrice } : null);
    
    // Rastreia arrecadação da partida (somente usuários reais)
    if (!user.isFake) {
      setGameState(prev => ({
        ...prev,
        currentMatchRevenue: prev.currentMatchRevenue + config.seriesPrice
      }));
    }
  };

  const drawBall = useCallback(() => {
    setGameState(prev => {
      if (prev.currentAnnouncement || isIntroPlaying || prev.drawnBalls.length >= 90 || prev.status !== GameStatus.PLAYING) return prev;
      
      const available = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !prev.drawnBalls.includes(n));
      if (available.length === 0) return { ...prev, status: GameStatus.FINISHED };
      
      const nextBall = available[Math.floor(Math.random() * available.length)];
      if (synth.speaking) synth.cancel(); 
      speak(`${config.ttsTexts.ballDrawn} ${nextBall}`);
      
      const newDrawnBalls = [...prev.drawnBalls, nextBall];
      const currentWinners = [...prev.winners];
      let newAnnouncement: WinEvent | null = null;

      const prizeTypesInOrder: ('QUADRA' | 'LINHA' | 'BINGO')[] = ['QUADRA', 'LINHA', 'BINGO'];
      const nextAvailablePrize = prizeTypesInOrder.find(type => !currentWinners.some(w => w.type === type));

      if (nextAvailablePrize) {
        let userWon = false;
        for (const series of userSeries) {
          for (const card of series.cards) {
            const results = checkWin(card, newDrawnBalls);
            if (
              (nextAvailablePrize === 'BINGO' && results.bingo) ||
              (nextAvailablePrize === 'LINHA' && results.linha) ||
              (nextAvailablePrize === 'QUADRA' && results.quadra)
            ) {
              const win: WinEvent = {
                type: nextAvailablePrize,
                userName: user?.name || 'Você',
                card: card,
                timestamp: Date.now()
              };
              currentWinners.push(win);
              newAnnouncement = win;
              userWon = true;
              break;
            }
          }
          if (userWon) break;
        }

        if (userWon && newAnnouncement && user) {
          const typeKey = newAnnouncement.type.toLowerCase() as 'quadra' | 'linha' | 'bingo';
          let prizeToCredit = config.prizes[typeKey];
          if (newAnnouncement.type === 'BINGO' && newDrawnBalls.length <= 40) {
            prizeToCredit += config.prizes.acumulado;
          }
          setUser(prev => prev ? { ...prev, balance: prev.balance + prizeToCredit } : null);
        }

        if (!userWon && config.fakeUsersEnabled) {
          let winChance = 0;
          if (nextAvailablePrize === 'QUADRA' && newDrawnBalls.length > 20) winChance = 0.08;
          if (nextAvailablePrize === 'LINHA' && newDrawnBalls.length > 38) winChance = 0.12;
          if (nextAvailablePrize === 'BINGO' && newDrawnBalls.length > 62) winChance = 0.18;

          if (Math.random() < winChance) {
            const fakeCard = generateSeries('fake').cards[0];
            const fakeWin: WinEvent = {
              type: nextAvailablePrize,
              userName: `Jogador${Math.floor(Math.random() * 900) + 100}`,
              card: fakeCard,
              timestamp: Date.now()
            };
            currentWinners.push(fakeWin);
            newAnnouncement = fakeWin;
          }
        }
      }

      if (newAnnouncement) {
        const prizeMsg = newAnnouncement.type === 'BINGO' ? 'BINGO! Cartela Cheia' : newAnnouncement.type;
        speak(`${config.ttsTexts.winner} ${prizeMsg} para ${newAnnouncement.userName}`, () => {
          setTimeout(() => {
            setGameState(state => ({ ...state, currentAnnouncement: null }));
          }, 2000);
        });
      }

      const isBingoWon = currentWinners.some(w => w.type === 'BINGO');
      return {
        ...prev,
        drawnBalls: newDrawnBalls,
        lastBall: nextBall,
        winners: currentWinners,
        currentAnnouncement: newAnnouncement,
        status: isBingoWon ? GameStatus.FINISHED : prev.status
      };
    });
  }, [config, userSeries, user, isIntroPlaying]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.status !== GameStatus.PLAYING && gameState.status !== GameStatus.FINISHED) {
        const secondsLeft = Math.floor((gameState.startTime - Date.now()) / 1000);
        if (secondsLeft <= 120 && secondsLeft > 118 && !narrationPlayedRef.current['2min']) {
          speak(config.ttsTexts.twoMinutes);
          narrationPlayedRef.current['2min'] = true;
        }
        if (secondsLeft <= 60 && secondsLeft > 58 && !narrationPlayedRef.current['1min']) {
          speak(config.ttsTexts.oneMinute);
          narrationPlayedRef.current['1min'] = true;
        }
        if (secondsLeft <= 0 && gameState.status !== GameStatus.PLAYING) {
          forceStart();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState.status, gameState.startTime, config]);

  const forceStart = () => {
    // 1. Calcular prêmios com base na arrecadação real antes de iniciar
    const revenue = gameState.currentMatchRevenue;
    const calcQuadra = (revenue * config.prizePercentages.quadra) / 100;
    const calcLinha = (revenue * config.prizePercentages.linha) / 100;
    const calcBingo = (revenue * config.prizePercentages.bingo) / 100;
    const contribAcumulado = (revenue * config.prizePercentages.accumulate) / 100;
    const novoAcumuladoTotal = config.prizes.acumulado + contribAcumulado;

    const newMatchPrizes = {
      quadra: Math.max(calcQuadra, 0),
      linha: Math.max(calcLinha, 0),
      bingo: Math.max(calcBingo, 0),
      acumulado: novoAcumuladoTotal,
      acumuladoArrecadacao: contribAcumulado
    };

    // Atualiza a config global (incluindo o pote acumulado que cresceu)
    setConfig(prev => ({
      ...prev,
      prizes: newMatchPrizes
    }));

    setIsIntroPlaying(true);
    setGameState(prev => ({ 
      ...prev, 
      status: GameStatus.PLAYING, 
      drawnBalls: [], 
      lastBall: null, 
      winners: [],
      currentAnnouncement: null
    }));

    const fmt = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const sequence = [
      config.ttsTexts.betsClosed,
      config.ttsTexts.welcome,
      `Os prêmios desta rodada são: Quadra, no valor de ${fmt(newMatchPrizes.quadra)} reais.`,
      `Prêmio de Linha, no valor de ${fmt(newMatchPrizes.linha)} reais.`,
      `E o grande Bingo, no valor de ${fmt(newMatchPrizes.bingo)} reais.`,
      `O valor arrecadado para o acumulado nesta partida é de ${fmt(newMatchPrizes.acumuladoArrecadacao)} reais.`,
      `O total acumulado para quem completar a cartela até a bola quarenta é de ${fmt(newMatchPrizes.acumulado)} reais.`
    ];
    
    speakSequence(sequence, () => {
      setIsIntroPlaying(false);
    });
    
    narrationPlayedRef.current = {};
  };

  const forceEnd = () => {
    setGameState(prev => ({ ...prev, status: GameStatus.FINISHED, currentMatchRevenue: 0 }));
    if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    setIsIntroPlaying(false);
    if (synth.speaking) synth.cancel();
  };

  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING && !isIntroPlaying) {
      drawIntervalRef.current = window.setInterval(drawBall, 6000);
    } else {
      if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    }
    return () => {
      if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    };
  }, [gameState.status, drawBall, isIntroPlaying]);

  return (
    <GameContext.Provider value={{ 
      config, gameState, user, userSeries, 
      updateConfig, buySeries, setUser, addBalance,
      forceStart, forceEnd 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
