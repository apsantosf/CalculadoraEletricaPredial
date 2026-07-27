// src/utils/calculations.ts
import { Prumada, Setor } from "./templates";

const CV_PARA_W = 736;
const HP_PARA_W = 746;

// 💡 CÉREBRO ATUALIZADO: Converte todas as novas unidades para Watts
export const converterParaWatts = (
  potencia: number,
  unidadeMedida: string,
): number => {
  let p = potencia;
  const FP = 0.92; // Fator de Potência médio

  if (unidadeMedida === "CV") p *= CV_PARA_W;
  else if (unidadeMedida === "HP") p *= HP_PARA_W;
  else if (unidadeMedida === "kW" || unidadeMedida === "KW") p *= 1000;
  else if (unidadeMedida === "VA") p *= FP;
  else if (unidadeMedida === "kVA" || unidadeMedida === "KVA") p *= 1000 * FP;
  else if (unidadeMedida === "BTU") p *= 0.1; // Regra prática de consumo elétrico

  return p;
};

export const calcularPotenciaInstaladaTotal = (setores: Setor[]): number => {
  let potenciaTotalWatts = 0;
  setores.forEach((setor) => {
    let potenciaDoSetor = 0;
    setor.cargas.forEach((carga) => {
      potenciaDoSetor +=
        converterParaWatts(carga.potencia, carga.unidadeMedida) *
        carga.quantidade;
    });
    potenciaTotalWatts += potenciaDoSetor * setor.quantidade;
  });
  return potenciaTotalWatts;
};

export const obterFatorAgrupamentoApartamentos = (
  quantidade: number,
): number => {
  if (quantidade <= 2) return 1.0;
  if (quantidade <= 4) return 0.8;
  if (quantidade <= 10) return 0.6;
  if (quantidade <= 15) return 0.5;
  if (quantidade <= 20) return 0.45;
  if (quantidade <= 30) return 0.4;
  if (quantidade <= 40) return 0.35;
  return 0.3;
};

export const calcularDemandaPrumada = (
  prumada: Prumada,
  setores: Setor[],
): number => {
  let potenciaBrutaW = 0;
  let totalApartamentosNaPrumada = 0;

  prumada.unidades.forEach((unidade) => {
    const setor = setores.find((s) => s.id === unidade.setorId);
    if (setor && setor.tipoSetor === "Apartamento") {
      let potSetorW = 0;
      setor.cargas.forEach((carga) => {
        potSetorW +=
          converterParaWatts(carga.potencia, carga.unidadeMedida) *
          carga.quantidade;
      });
      potenciaBrutaW += potSetorW * unidade.quantidade;
      totalApartamentosNaPrumada += unidade.quantidade;
    }
  });

  const fator = obterFatorAgrupamentoApartamentos(totalApartamentosNaPrumada);
  return potenciaBrutaW * fator;
};

export const calcularDemandaAreasComuns = (setores: Setor[]): number => {
  const areasComuns = setores.filter((s) => s.tipoSetor === "AreaComum");
  let motoresW: number[] = [];
  let outrasCargasW = 0;

  areasComuns.forEach((area) => {
    area.cargas.forEach((carga) => {
      let p = converterParaWatts(carga.potencia, carga.unidadeMedida);
      const qtdTotal = area.quantidade * carga.quantidade;

      if (
        carga.tipo === "Motor" ||
        carga.unidadeMedida === "CV" ||
        carga.unidadeMedida === "HP"
      ) {
        for (let i = 0; i < qtdTotal; i++) {
          motoresW.push(p);
        }
      } else {
        outrasCargasW += p * qtdTotal;
      }
    });
  });

  motoresW.sort((a, b) => b - a);

  let demandaMotoresW = 0;
  motoresW.forEach((potencia, index) => {
    if (index === 0) demandaMotoresW += potencia * 1.0;
    else if (index === 1) demandaMotoresW += potencia * 0.75;
    else if (index === 2) demandaMotoresW += potencia * 0.65;
    else demandaMotoresW += potencia * 0.5;
  });

  return demandaMotoresW + outrasCargasW;
};

export const calcularDemandaGlobal = (
  prumadas: Prumada[],
  setores: Setor[],
): number => {
  let demandaPrumadasW = 0;
  prumadas.forEach((prumada) => {
    demandaPrumadasW += calcularDemandaPrumada(prumada, setores);
  });
  const demandaComumW = calcularDemandaAreasComuns(setores);
  return demandaPrumadasW + demandaComumW;
};

const DISJUNTORES_COMERCIAIS = [
  40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
  1600, 2000, 2500, 3200,
];

const CAPACIDADE_CABOS = [
  { bitola: "10", correnteMax: 50 },
  { bitola: "16", correnteMax: 68 },
  { bitola: "25", correnteMax: 89 },
  { bitola: "35", correnteMax: 111 },
  { bitola: "50", correnteMax: 134 },
  { bitola: "70", correnteMax: 171 },
  { bitola: "95", correnteMax: 207 },
  { bitola: "120", correnteMax: 239 },
  { bitola: "150", correnteMax: 272 },
  { bitola: "185", correnteMax: 310 },
  { bitola: "240", correnteMax: 364 },
  { bitola: "300", correnteMax: 419 },
  { bitola: "400", correnteMax: 502 },
];

export const calcularDimensionamentoQGBT = (
  demandaGlobalW: number,
  tensaoStr: string,
) => {
  if (!tensaoStr || demandaGlobalW === 0)
    return { corrente: "0.00", disjuntor: 0, cabo: "N/A" };

  const tensao = parseInt(tensaoStr);
  const fatorPotencia = 0.92;
  const raizDe3 = 1.732;

  const corrente = demandaGlobalW / (raizDe3 * tensao * fatorPotencia);

  let disjuntor =
    DISJUNTORES_COMERCIAIS.find((d) => d >= corrente) ||
    DISJUNTORES_COMERCIAIS[DISJUNTORES_COMERCIAIS.length - 1];

  let cabo = "";
  let caboUnico = CAPACIDADE_CABOS.find((c) => c.correnteMax >= disjuntor);

  if (caboUnico) {
    cabo = `${caboUnico.bitola} mm²`;
  } else {
    let paraleloEncontrado = false;
    for (let multiplicador = 2; multiplicador <= 6; multiplicador++) {
      const correntePorCabo = disjuntor / multiplicador;
      const caboAdequado = CAPACIDADE_CABOS.find(
        (c) => c.correnteMax >= correntePorCabo,
      );
      if (caboAdequado) {
        cabo = `${multiplicador}x ${caboAdequado.bitola} mm²`;
        paraleloEncontrado = true;
        break;
      }
    }
    if (!paraleloEncontrado) cabo = "Projeto Especial (Barramento)";
  }

  return { corrente: corrente.toFixed(2), disjuntor, cabo };
};
