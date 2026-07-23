// src/utils/calculations.ts
import { Prumada, Setor } from "./templates";

// Constantes de conversão
const CV_PARA_W = 736;
const HP_PARA_W = 746;

// 1. Soma Bruta (Potência Instalada)
export const calcularPotenciaInstaladaTotal = (setores: Setor[]): number => {
  let potenciaTotalWatts = 0;
  setores.forEach((setor) => {
    let potenciaDoSetor = 0;
    setor.cargas.forEach((carga) => {
      let p = carga.potencia;
      if (carga.unidadeMedida === "CV") p *= CV_PARA_W;
      if (carga.unidadeMedida === "HP") p *= HP_PARA_W;
      potenciaDoSetor += p * carga.quantidade;
    });
    potenciaTotalWatts += potenciaDoSetor * setor.quantidade;
  });
  return potenciaTotalWatts;
};

// 2. Tabela de Fator de Agrupamento (NBR 5410)
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

// 3. Demanda Real da Prumada
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
        let p = carga.potencia;
        if (carga.unidadeMedida === "CV") p *= CV_PARA_W;
        if (carga.unidadeMedida === "HP") p *= HP_PARA_W;
        potSetorW += p * carga.quantidade;
      });
      potenciaBrutaW += potSetorW * unidade.quantidade;
      totalApartamentosNaPrumada += unidade.quantidade;
    }
  });

  const fator = obterFatorAgrupamentoApartamentos(totalApartamentosNaPrumada);
  return potenciaBrutaW * fator;
};

// 4. Potência/Demanda das Áreas Comuns
export const calcularDemandaAreasComuns = (setores: Setor[]): number => {
  const areasComuns = setores.filter((s) => s.tipoSetor === "AreaComum");
  let totalW = 0;
  areasComuns.forEach((area) => {
    let potW = 0;
    area.cargas.forEach((carga) => {
      let p = carga.potencia;
      if (carga.unidadeMedida === "CV") p *= CV_PARA_W;
      if (carga.unidadeMedida === "HP") p *= HP_PARA_W;
      potW += p * carga.quantidade;
    });
    totalW += potW * area.quantidade;
  });
  return totalW;
};

// 5. Demanda Global do Prédio (QGBT Geral)
export const calcularDemandaGlobal = (
  prumadas: Prumada[],
  setores: Setor[],
): number => {
  let demandaPrumadasW = 0;
  prumadas.forEach((prumada) => {
    demandaPrumadasW += calcularDemandaPrumada(prumada, setores);
  });

  const demandaComumW = calcularDemandaAreasComuns(setores);

  // A demanda global é a soma das demandas reais das prumadas e das áreas comuns
  return demandaPrumadasW + demandaComumW;
};
