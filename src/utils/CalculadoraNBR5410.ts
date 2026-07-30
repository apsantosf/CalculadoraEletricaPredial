// src/utils/CalculadoraNBR5410.ts

export interface ComodoPlanta {
  id: string;
  nome: string;
  tipo: "sala" | "cozinha" | "banheiro" | "quarto" | "servico" | "outro";
  area: number;
  perimetro: number;
}

export interface TuePlanta {
  id: string;
  nome: string;
  potenciaW: number;
}

export interface ResultadoDemanda {
  nome: string;
  potenciaW: number;
}

export const calcularIluminacao = (area: number): number => {
  if (area <= 6) return 100;
  return 100 + Math.floor((area - 6) / 4) * 60;
};

export const calcularTugs = (tipo: string, perimetro: number) => {
  let quantidade = 1;
  let potenciaTotal = 100;

  if (tipo === "cozinha" || tipo === "servico") {
    quantidade = Math.max(3, Math.ceil(perimetro / 3.5));
    potenciaTotal =
      quantidade <= 3 ? quantidade * 600 : 3 * 600 + (quantidade - 3) * 100;
  } else if (tipo === "banheiro") {
    quantidade = 1;
    potenciaTotal = 600;
  } else {
    quantidade = Math.max(1, Math.ceil(perimetro / 5));
    potenciaTotal = quantidade * 100;
  }

  return { quantidade, potenciaTotal };
};

export const obterFatorDemandaIlumTug = (potenciaVA: number): number => {
  if (potenciaVA <= 1000) return 0.86;
  if (potenciaVA <= 2000) return 0.75;
  if (potenciaVA <= 3000) return 0.66;
  if (potenciaVA <= 4000) return 0.59;
  if (potenciaVA <= 5000) return 0.52;
  if (potenciaVA <= 6000) return 0.45;
  if (potenciaVA <= 7000) return 0.4;
  if (potenciaVA <= 8000) return 0.35;
  if (potenciaVA <= 9000) return 0.31;
  if (potenciaVA <= 10000) return 0.27;
  return 0.24;
};

/**
 * 💡 NOVO CÉREBRO: Agora ele calcula a demanda e devolve os itens SEPARADOS
 */
export const calcularDemandaApartamento = (
  comodos: ComodoPlanta[],
  tues: TuePlanta[],
): ResultadoDemanda[] => {
  const resultados: ResultadoDemanda[] = [];
  let totalIlumTugVA = 0;

  // 1. Bloco de Iluminação e Tomadas Gerais
  comodos.forEach((c) => {
    totalIlumTugVA += calcularIluminacao(c.area);
    totalIlumTugVA += calcularTugs(c.tipo, c.perimetro).potenciaTotal;
  });

  const fatorIlumTug = obterFatorDemandaIlumTug(totalIlumTugVA);
  const demandaIlumTugVA = totalIlumTugVA * fatorIlumTug;
  const demandaIlumTugW = demandaIlumTugVA * 0.95;

  if (demandaIlumTugW > 0) {
    resultados.push({
      nome:
        comodos.length === 1
          ? `Circuito: ${comodos[0].nome}`
          : "Iluminação e TUGs (Ambientes)",
      potenciaW: Math.round(demandaIlumTugW),
    });
  }

  // 2. Bloco de Equipamentos Pesados (TUEs)
  const qtdTues = tues.length;
  let fatorTue = 1.0;
  if (qtdTues === 2) fatorTue = 0.9;
  else if (qtdTues >= 3 && qtdTues <= 5) fatorTue = 0.8;
  else if (qtdTues >= 6) fatorTue = 0.7;

  tues.forEach((tue) => {
    resultados.push({
      nome: tue.nome,
      potenciaW: Math.round(tue.potenciaW * fatorTue),
    });
  });

  return resultados;
};
