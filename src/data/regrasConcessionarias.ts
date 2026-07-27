// src/data/regrasConcessionarias.ts
export interface RegrasConcessionaria {
  nome: string;
  caboMinimoEntrada: number; // Ex: 10mm² para a maioria
  limiteQuedaTensao: number; // Geralmente 4%, mas pode variar
  permiteAluminio: boolean;
}

export const configuracoesConcessionarias: Record<
  string,
  RegrasConcessionaria
> = {
  CPFL: {
    nome: "CPFL",
    caboMinimoEntrada: 10,
    limiteQuedaTensao: 4.0,
    permiteAluminio: true,
  },
  ENEL: {
    nome: "ENEL",
    caboMinimoEntrada: 10,
    limiteQuedaTensao: 4.0,
    permiteAluminio: false,
  },
  NEOENERGIA: {
    nome: "NEOENERGIA (Elektra)",
    caboMinimoEntrada: 10,
    limiteQuedaTensao: 4.0,
    permiteAluminio: true,
  },
};
