// src/context/DataContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Prumada, Setor } from "../utils/templates";

const STORAGE_KEY = "@eletrica_predial_dados_v1";

interface DataContextType {
  nomeProjeto: string;
  setNomeProjeto: (nome: string) => void;
  numeroAndares: string;
  setNumeroAndares: (andares: string) => void;
  setores: Setor[];
  setoresDispatch: (setores: Setor[]) => void;
  prumadas: Prumada[];
  prumadasDispatch: (prumadas: Prumada[]) => void;
  zerarProjeto: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [nomeProjeto, setNomeProjeto] = useState<string>("");
  const [numeroAndares, setNumeroAndares] = useState<string>("");
  const [setores, setSetores] = useState<Setor[]>([]);
  const [prumadas, setPrumadas] = useState<Prumada[]>([]);

  // Carrega os dados salvos no dispositivo assim que o app abre
  useEffect(() => {
    async function carregarDadosSalvos() {
      try {
        const jsonDados = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonDados !== null) {
          const dados = JSON.parse(jsonDados);
          if (dados.nomeProjeto) setNomeProjeto(dados.nomeProjeto);
          if (dados.numeroAndares) setNumeroAndares(dados.numeroAndares);
          if (dados.setores) setSetores(dados.setores);
          if (dados.prumadas) setPrumadas(dados.prumadas);
        }
      } catch (e) {
        console.error("Erro ao carregar dados do armazenamento:", e);
      }
    }
    carregarDadosSalvos();
  }, []);

  // Função interna para persistir o estado atual
  const persistir = async (
    nome: string,
    andares: string,
    s: Setor[],
    p: Prumada[],
  ) => {
    try {
      const objetoParaSalvar = {
        nomeProjeto: nome,
        numeroAndares: andares,
        setores: s,
        prumadas: p,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(objetoParaSalvar));
    } catch (e) {
      console.error("Erro ao salvar dados localmente:", e);
    }
  };

  const setNomeProjetoEGuardar = (nome: string) => {
    setNomeProjeto(nome);
    persistir(nome, numeroAndares, setores, prumadas);
  };

  const setNumeroAndaresEGuardar = (andares: string) => {
    setNumeroAndares(andares);
    persistir(nomeProjeto, andares, setores, prumadas);
  };

  const setoresDispatch = (novosSetores: Setor[]) => {
    setSetores(novosSetores);
    persistir(nomeProjeto, numeroAndares, novosSetores, prumadas);
  };

  const prumadasDispatch = (novasPrumadas: Prumada[]) => {
    setPrumadas(novasPrumadas);
    persistir(nomeProjeto, numeroAndares, setores, novasPrumadas);
  };

  const zerarProjeto = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Erro ao limpar dados:", e);
    }
    setNomeProjeto("");
    setNumeroAndares("");
    setSetores([]);
    setPrumadas([]);
  };

  return (
    <DataContext.Provider
      value={{
        nomeProjeto,
        setNomeProjeto: setNomeProjetoEGuardar,
        numeroAndares,
        setNumeroAndares: setNumeroAndaresEGuardar,
        setores,
        setoresDispatch,
        prumadas,
        prumadasDispatch,
        zerarProjeto,
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
