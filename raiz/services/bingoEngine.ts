
import { Card, Series } from '../types';

/**
 * Calcula a proximidade para o prêmio ativo.
 */
export const calculateProximity = (card: Card, drawnBalls: number[], activePrize: 'QUADRA' | 'LINHA' | 'BINGO'): number => {
  const matrix = card.matrix;
  
  if (activePrize === 'BINGO') {
    const totalNumbers = matrix.flat().filter(n => n !== null).length;
    const markedNumbers = matrix.flat().filter(n => n !== null && drawnBalls.includes(n)).length;
    return totalNumbers - markedNumbers;
  }

  const target = activePrize === 'QUADRA' ? 4 : 5;
  let minMissing = 99;

  for (const row of matrix) {
    const rowNumbers = row.filter(n => n !== null) as number[];
    const markedInRow = rowNumbers.filter(n => drawnBalls.includes(n)).length;
    const missing = target - markedInRow;
    if (missing < minMissing) minMissing = missing;
  }

  return Math.max(0, minMissing);
};

/**
 * Verifica se a cartela ganhou algum prêmio.
 */
export const checkWin = (card: Card, drawnBalls: number[]): { quadra: boolean; linha: boolean; bingo: boolean } => {
  const results = { quadra: false, linha: false, bingo: false };
  const matrix = card.matrix;
  
  const flattened = matrix.flat().filter(n => n !== null) as number[];
  const markedInCard = flattened.filter(n => drawnBalls.includes(n));
  if (markedInCard.length === 15) results.bingo = true;

  for (const row of matrix) {
    const rowNumbers = row.filter(n => n !== null) as number[];
    const markedInRow = rowNumbers.filter(n => drawnBalls.includes(n));
    if (markedInRow.length >= 5) results.linha = true;
    if (markedInRow.length >= 4) results.quadra = true;
  }

  return results;
};

/**
 * Gera uma série de 6 cartelas contendo exatamente os números de 1 a 90.
 */
export const generateSeries = (userId: string): Series => {
  // 1. Criar pools de números por coluna
  const pools: number[][] = [
    Array.from({ length: 9 }, (_, i) => i + 1),    // 01-09
    Array.from({ length: 10 }, (_, i) => i + 10), // 10-19
    Array.from({ length: 10 }, (_, i) => i + 20), // 20-29
    Array.from({ length: 10 }, (_, i) => i + 30), // 30-39
    Array.from({ length: 10 }, (_, i) => i + 40), // 40-49
    Array.from({ length: 10 }, (_, i) => i + 50), // 50-59
    Array.from({ length: 10 }, (_, i) => i + 60), // 60-69
    Array.from({ length: 10 }, (_, i) => i + 70), // 70-79
    Array.from({ length: 11 }, (_, i) => i + 80), // 80-90
  ];

  // Embaralhar pools
  pools.forEach(p => p.sort(() => Math.random() - 0.5));

  // 2. Definir a contagem de números por coluna em cada cartela
  // Cada uma das 6 cartelas deve ter 15 números (Total 90)
  // Cada cartela deve ter pelo menos 1 número por coluna (9 obrigatórios por cartela)
  const colCountsPerCard: number[][] = Array.from({ length: 6 }, () => Array(9).fill(1));
  
  // Faltam distribuir 36 números (90 - 54) para completar 15 por cartela (6 por cartela)
  // E respeitar o tamanho total de cada pool
  const poolRemainders = pools.map(p => p.length - 6);
  
  for (let c = 0; c < 6; c++) {
    let extraNeeded = 6;
    while (extraNeeded > 0) {
      const colIdx = Math.floor(Math.random() * 9);
      if (colCountsPerCard[c][colIdx] < 3 && poolRemainders[colIdx] > 0) {
        colCountsPerCard[c][colIdx]++;
        poolRemainders[colIdx]--;
        extraNeeded--;
      }
    }
  }

  // 3. Distribuir os números nas matrizes 3x9
  const seriesCards: (number | null)[][][] = Array.from({ length: 6 }, () => 
    Array.from({ length: 3 }, () => Array(9).fill(null))
  );

  for (let cardIdx = 0; cardIdx < 6; cardIdx++) {
    const counts = colCountsPerCard[cardIdx];
    const matrix = seriesCards[cardIdx];
    
    // Distribuir números nas linhas mantendo a regra de 5 por linha
    // Usamos um algoritmo simples de preenchimento e ajuste
    let numbersToPlace: number[] = [];
    counts.forEach((count, colIdx) => {
      for (let i = 0; i < count; i++) {
        numbersToPlace.push(pools[colIdx].pop()!);
      }
    });

    // Ordenar para facilitar a distribuição vertical
    numbersToPlace.sort((a, b) => a - b);

    // Mapear quais números pertencem a quais colunas
    const colNums: number[][] = Array.from({ length: 9 }, () => []);
    numbersToPlace.forEach(n => {
      let col = Math.floor(n / 10);
      if (n === 90) col = 8;
      if (col > 8) col = 8;
      colNums[col].push(n);
    });

    // Tentar distribuir nas linhas respeitando 5 por linha
    // Tentativa e erro simples (brute-force leve para o ambiente client-side)
    let success = false;
    let attempts = 0;
    while (!success && attempts < 100) {
      attempts++;
      const tempMatrix: (number | null)[][] = Array.from({ length: 3 }, () => Array(9).fill(null));
      const rowCounts = [0, 0, 0];
      const colUsage = colNums.map(nums => nums.length);

      // Regra: colunas com 3 números ocupam todas as linhas
      colUsage.forEach((count, colIdx) => {
        if (count === 3) {
          tempMatrix[0][colIdx] = colNums[colIdx][0];
          tempMatrix[1][colIdx] = colNums[colIdx][1];
          tempMatrix[2][colIdx] = colNums[colIdx][2];
          rowCounts[0]++; rowCounts[1]++; rowCounts[2]++;
        }
      });

      // Distribuir colunas com 2 e 1
      const remainingCols = colUsage.map((count, i) => count > 0 && count < 3 ? i : -1).filter(i => i !== -1);
      remainingCols.sort(() => Math.random() - 0.5);

      remainingCols.forEach(colIdx => {
        const count = colUsage[colIdx];
        const availableRows = [0, 1, 2]
          .filter(r => rowCounts[r] < 5 && tempMatrix[r][colIdx] === null)
          .sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < count && i < availableRows.length; i++) {
          const rowIdx = availableRows[i];
          tempMatrix[rowIdx][colIdx] = 0; // Placeholder
          rowCounts[rowIdx]++;
        }
      });

      if (rowCounts.every(c => c === 5)) {
        // Colocar os números reais em ordem
        for (let col = 0; col < 9; col++) {
          const nums = colNums[col].sort((a, b) => a - b);
          let nIdx = 0;
          for (let row = 0; row < 3; row++) {
            if (tempMatrix[row][col] !== null) {
              tempMatrix[row][col] = nums[nIdx++];
            }
          }
        }
        seriesCards[cardIdx] = tempMatrix;
        success = true;
      }
    }
    
    // Se falhar após 100 tentativas (raro), reinicia a geração da série inteira
    if (!success) return generateSeries(userId);
  }

  return {
    id: Math.random().toString(36).substr(2, 9).toUpperCase(),
    cards: seriesCards.map(matrix => ({
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId,
      matrix,
      markedNumbers: []
    }))
  };
};
