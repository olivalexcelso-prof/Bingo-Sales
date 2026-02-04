
import { AppConfig, GameStatus, GameState } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  bingoName: 'Bingo Master Pro',
  logoUrl: 'https://picsum.photos/200/200?random=1',
  backgroundUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80',
  backgroundOpacity: 0.15,
  seriesPrice: 10.0,
  pixKey: '000.000.000-00',
  adminWhatsapp: '5511999999999',
  fakeUsersEnabled: true,
  fakeUsersCount: 50,
  prizePercentages: {
    quadra: 10,     // 10% da arrecadação
    linha: 20,      // 20% da arrecadação
    bingo: 40,      // 40% da arrecadação
    accumulate: 5   // 5% vai para o pote acumulado
  },
  prizes: {
    quadra: 0,
    linha: 0,
    bingo: 0,
    acumulado: 5000.00, // Valor inicial do acumulado
    acumuladoArrecadacao: 0
  },
  ttsTexts: {
    waiting: 'Aguardando o início da partida. Compre suas séries!',
    gameStart: 'A partida vai começar agora! Boa sorte a todos.',
    ballDrawn: 'Bola número ',
    winner: 'Temos um ganhador de ',
    twoMinutes: 'Faltam 2 minutos',
    oneMinute: 'Agora falta 1 minutinho, compre e não perca.',
    betsClosed: 'Encerrada as apostas.',
    welcome: 'Sejam todos bem vindos, Boa Sorte.',
    prizesIntro: 'Os prêmios de Quadra: '
  },
  schedule: {
    startTime: '08:00',
    intervalMinutes: 10,
    lastMatchTime: '23:00'
  },
  drawSource: 'server',
  seriesSource: 'server'
};

export const INITIAL_GAME_STATE: GameState = {
  status: GameStatus.SCHEDULED,
  drawnBalls: [],
  lastBall: null,
  startTime: Date.now() + 180000,
  winners: [],
  proximityRanking: [],
  currentAnnouncement: null,
  currentMatchRevenue: 0
};
