// src/utils/templates.ts
export interface Carga {
  id: string;
  nome: string; // Ex: "Motor Elevador", "Bomba de Recalque", "TUG"
  quantidade: number;
  potencia: number; // Potência
  unidadeMedida: "W" | "CV" | "HP" | "VA";
  tipo: "Iluminacao" | "TUG" | "TUE" | "Motor";
  fases: number; // 1 (Monofásico), 2 (Bifásico) ou 3 (Trifásico)
  fatorPotencia: number; // Importante para motores
  rendimento: number; // Importante para motores
}

export interface Setor {
  id: string;
  nome: string; // Ex: "Apartamento Tipo A", "Casa de Máquinas"
  tipoSetor: "Apartamento" | "AreaComum" | "Prumada";
  quantidade: number; // Ex: 36 (se forem 36 apartamentos iguais)
  cargas: Carga[];
}

export interface UnidadePrumada {
  setorId: string;
  nomeSetor: string;
  quantidade: number;
}

export interface Prumada {
  id: string;
  nome: string; // Ex: "Prumada A - Lado Esquerdo"
  unidades: UnidadePrumada[]; // Quais apartamentos estão pendurados nela
}
