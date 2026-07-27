// src/data/tabelasCondutores.ts
export interface Condutor {
  bitola: number;
  capacidadeCorrente: number;
}

export const tabelaCondutores: Condutor[] = [
  { bitola: 1.5, capacidadeCorrente: 15 },
  { bitola: 2.5, capacidadeCorrente: 21 },
  { bitola: 4.0, capacidadeCorrente: 28 },
  { bitola: 6.0, capacidadeCorrente: 36 },
  { bitola: 10, capacidadeCorrente: 50 },
  { bitola: 16, capacidadeCorrente: 68 },
  { bitola: 25, capacidadeCorrente: 89 },
  // Adicionando cabos maiores para Ramal de Entrada (Valores aproximados de norma)
  { bitola: 35, capacidadeCorrente: 111 },
  { bitola: 50, capacidadeCorrente: 134 },
  { bitola: 70, capacidadeCorrente: 171 },
  { bitola: 95, capacidadeCorrente: 207 },
  { bitola: 120, capacidadeCorrente: 239 },
];
