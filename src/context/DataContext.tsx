// src/context/DataContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Prumada, Setor } from "../utils/templates";

const STORAGE_PROJETOS_KEY = "@eletrica_predial_projetos_v2";
const STORAGE_EQUIPAMENTOS_KEY = "@eletrica_predial_equipamentos_v2";

export interface EquipamentoPadrao {
  id: string;
  nome: string;
  potencia: string;
  unidade: string;
}

export interface ProjetoSalvo {
  id: string;
  nomeProjeto: string;
  numeroAndares: string;
  tensao: string;
  setores: Setor[];
  prumadas: Prumada[];
  dataModificacao: string;
}

export const EQUIPAMENTOS_INICIAIS: EquipamentoPadrao[] = [
  { id: "1", nome: "Elevador Social", potencia: "7.5", unidade: "CV" },
  { id: "2", nome: "Elevador de Serviço", potencia: "5", unidade: "CV" },
  {
    id: "3",
    nome: "Bomba de Recalque (Caixa D'água)",
    potencia: "2",
    unidade: "CV",
  },
  { id: "4", nome: "Bomba de Incêndio", potencia: "10", unidade: "CV" },
  { id: "5", nome: "Bomba de Piscina", potencia: "1", unidade: "CV" },
  { id: "6", nome: "Bomba de Irrigação", potencia: "1", unidade: "CV" },
  { id: "7", nome: "Portão Automático", potencia: "0.5", unidade: "CV" },
  { id: "8", nome: "Exaustor de Garagem", potencia: "3", unidade: "CV" },
  {
    id: "9",
    nome: "Iluminação Geral (Hall/Escadas)",
    potencia: "2000",
    unidade: "W",
  },
  {
    id: "10",
    nome: "Iluminação Externa (Jardim/Fachada)",
    potencia: "1500",
    unidade: "W",
  },
];

interface DataContextType {
  idProjetoAtual: string | null;
  nomeProjeto: string;
  setNomeProjeto: (nome: string) => void;
  numeroAndares: string;
  setNumeroAndares: (andares: string) => void;
  tensao: string;
  setTensao: (tensao: string) => void;
  setores: Setor[];
  setoresDispatch: (setores: Setor[]) => void;
  prumadas: Prumada[];
  prumadasDispatch: (prumadas: Prumada[]) => void;

  projetosSalvos: ProjetoSalvo[];
  carregarProjeto: (id: string) => void;
  excluirProjeto: (id: string) => void;
  novoProjeto: () => void;

  listaEquipamentos: EquipamentoPadrao[];
  setListaEquipamentos: (equipamentos: EquipamentoPadrao[]) => void;
  removerEquipamentoDaLista: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [idProjetoAtual, setIdProjetoAtual] = useState<string | null>(null);
  const [nomeProjeto, setNomeProjeto] = useState<string>("");
  const [numeroAndares, setNumeroAndares] = useState<string>("");
  const [tensao, setTensao] = useState<string>("");
  const [setores, setSetores] = useState<Setor[]>([]);
  const [prumadas, setPrumadas] = useState<Prumada[]>([]);

  const [projetosSalvos, setProjetosSalvos] = useState<ProjetoSalvo[]>([]);
  const [listaEquipamentos, setListaEquipamentos] = useState<
    EquipamentoPadrao[]
  >(EQUIPAMENTOS_INICIAIS);
  const [isCarregado, setIsCarregado] = useState(false);

  // 1. Carrega os dados salvos do dispositivo ao abrir o app
  useEffect(() => {
    async function carregarDadosSalvos() {
      try {
        const jsonProjetos = await AsyncStorage.getItem(STORAGE_PROJETOS_KEY);
        if (jsonProjetos !== null) {
          const projs: ProjetoSalvo[] = JSON.parse(jsonProjetos);
          setProjetosSalvos(projs);
          // Opcional: carrega o mais recente automaticamente se houver
          if (projs.length > 0) {
            const ultimo = projs[0];
            setIdProjetoAtual(ultimo.id);
            setNomeProjeto(ultimo.nomeProjeto);
            setNumeroAndares(ultimo.numeroAndares);
            setTensao(ultimo.tensao);
            setSetores(ultimo.setores);
            setPrumadas(ultimo.prumadas);
          }
        }

        const jsonEquips = await AsyncStorage.getItem(STORAGE_EQUIPAMENTOS_KEY);
        if (jsonEquips !== null) {
          const equips = JSON.parse(jsonEquips);
          if (equips.length > 0) setListaEquipamentos(equips);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        setIsCarregado(true);
      }
    }
    carregarDadosSalvos();
  }, []);

  // 2. Auto-save inteligente: sincroniza o projeto atual na lista e salva no Storage
  useEffect(() => {
    if (!isCarregado) return;

    const salvarAutomatico = async () => {
      try {
        // Salva equipamentos globalmente
        await AsyncStorage.setItem(
          STORAGE_EQUIPAMENTOS_KEY,
          JSON.stringify(listaEquipamentos),
        );

        // Atualiza ou cria o projeto atual na lista de projetos salvos
        let novaLista = [...projetosSalvos];
        const dataAtual =
          new Date().toLocaleDateString("pt-BR") +
          " às " +
          new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

        if (idProjetoAtual) {
          const index = novaLista.findIndex((p) => p.id === idProjetoAtual);
          if (index !== -1) {
            novaLista[index] = {
              id: idProjetoAtual,
              nomeProjeto: nomeProjeto || "Projeto Sem Nome",
              numeroAndares,
              tensao,
              setores,
              prumadas,
              dataModificacao: dataAtual,
            };
          }
        } else if (
          nomeProjeto.trim() !== "" ||
          setores.length > 0 ||
          prumadas.length > 0
        ) {
          // Cria um novo ID automaticamente se houver conteúdo ativo
          const novoId = Date.now().toString();
          setIdProjetoAtual(novoId);
          novaLista.unshift({
            id: novoId,
            nomeProjeto: nomeProjeto || "Projeto Sem Nome",
            numeroAndares,
            tensao,
            setores,
            prumadas,
            dataModificacao: dataAtual,
          });
        }

        setProjetosSalvos(novaLista);
        await AsyncStorage.setItem(
          STORAGE_PROJETOS_KEY,
          JSON.stringify(novaLista),
        );
      } catch (e) {
        console.error("Erro no salvamento automático:", e);
      }
    };

    salvarAutomatico();
  }, [
    nomeProjeto,
    numeroAndares,
    tensao,
    setores,
    prumadas,
    listaEquipamentos,
    isCarregado,
  ]);

  // Funções de Gestão de Projetos
  const carregarProjeto = (id: string) => {
    const proj = projetosSalvos.find((p) => p.id === id);
    if (proj) {
      setIdProjetoAtual(proj.id);
      setNomeProjeto(proj.nomeProjeto);
      setNumeroAndares(proj.numeroAndares);
      setTensao(proj.tensao);
      setSetores(proj.setores);
      setPrumadas(proj.prumadas);
    }
  };

  const excluirProjeto = async (id: string) => {
    const novaLista = projetosSalvos.filter((p) => p.id !== id);
    setProjetosSalvos(novaLista);
    await AsyncStorage.setItem(STORAGE_PROJETOS_KEY, JSON.stringify(novaLista));

    if (idProjetoAtual === id) {
      novoProjeto();
    }
  };

  const novoProjeto = () => {
    setIdProjetoAtual(null);
    setNomeProjeto("");
    setNumeroAndares("");
    setTensao("");
    setSetores([]);
    setPrumadas([]);
  };

  const removerEquipamentoDaLista = (id: string) => {
    const novaLista = listaEquipamentos.filter((eq) => eq.id !== id);
    setListaEquipamentos(novaLista);
  };

  return (
    <DataContext.Provider
      value={{
        idProjetoAtual,
        nomeProjeto,
        setNomeProjeto,
        numeroAndares,
        setNumeroAndares,
        tensao,
        setTensao,
        setores,
        setoresDispatch: setSetores,
        prumadas,
        prumadasDispatch: setPrumadas,
        projetosSalvos,
        carregarProjeto,
        excluirProjeto,
        novoProjeto,
        listaEquipamentos,
        setListaEquipamentos,
        removerEquipamentoDaLista,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData deve ser usado dentro de um DataProvider");
  }
  return context;
}
