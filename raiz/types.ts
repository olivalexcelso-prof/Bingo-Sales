
export enum GameStatus {
  SCHEDULED = 'SCHEDULED',
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface User {
  id: string;
  name: string;
  whatsapp: string;
  balance: number;
  isFake: boolean;
  affiliateCode?: string;
  referredBy?: string;
}

export interface Card {
  id: string;
  userId: string;
  matrix: (number | null)[][]; // 3x9 grid
  markedNumbers: number[];
}

export interface Series {
  id: string;
  cards: Card[];
}

export interface WinEvent {
  type: 'QUADRA' | 'LINHA' | 'BINGO';
  userName: string;
  card: Card;
  timestamp: number;
}

export interface AppConfig {
  bingoName: string;
  logoUrl: string;
  backgroundUrl: string;
  backgroundOpacity: number;
  seriesPrice: number;
  pixKey: string;
  adminWhatsapp: string;
  fakeUsersEnabled: boolean;
  fakeUsersCount: number;
  // Configurações de Porcentagem
  prizePercentages: {
    quadra: number;
    linha: number;
    bingo: number;
    accumulate: number;
  };
  // Valores calculados para a partida atual
  prizes: {
    quadra: number;
    linha: number;
    bingo: number;
    acumulado: number; // Grande acumulado total
    acumuladoArrecadacao: number; // Quanto esta partida contribuiu
  };
  ttsTexts: {
    waiting: string;
    gameStart: string;
    ballDrawn: string;
    winner: string;
    twoMinutes: string;
    oneMinute: string;
    betsClosed: string;
    welcome: string;
    prizesIntro: string;
  };
  schedule: {
    startTime: string; // HH:mm
    intervalMinutes: number;
    lastMatchTime: string; // HH:mm
  };
  drawSource: 'local' | 'server';
  seriesSource: 'local' | 'server';
}

export interface GameState {
  status: GameStatus;
  drawnBalls: number[];
  lastBall: number | null;
  startTime: number;
  winners: WinEvent[];
  proximityRanking: { userName: string; count: number }[];
  currentAnnouncement: WinEvent | null;
  currentMatchRevenue: number; // Arrecadação total real da partida atual
}
