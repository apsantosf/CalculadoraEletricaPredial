// src/app/(telas)/prumadas.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../../components/ui/CustomHeader";
import { useData } from "../../context/DataContext";
import { Prumada, UnidadePrumada } from "../../utils/templates";

export default function ScreenPrumadas() {
  const { setores, prumadas, prumadasDispatch } = useData();
  const router = useRouter();

  const apartamentosDisponiveis = setores.filter(
    (s) => s.tipoSetor === "Apartamento",
  );

  const [nomePrumada, setNomePrumada] = useState("");
  const [setorSelecionado, setSetorSelecionado] = useState<string | null>(null);
  const [quantidadeNaPrumada, setQuantidadeNaPrumada] = useState("");

  const saldos = apartamentosDisponiveis.map((apto) => {
    const totalAlocado = prumadas.reduce((acc, prumada) => {
      const unidade = prumada.unidades.find((u) => u.setorId === apto.id);
      return acc + (unidade ? unidade.quantidade : 0);
    }, 0);
    return {
      ...apto,
      saldo: apto.quantidade - totalAlocado,
    };
  });

  const todosAlocados = saldos.length > 0 && saldos.every((s) => s.saldo === 0);
  const setorSelecionadoDados = saldos.find((s) => s.id === setorSelecionado);

  const handleSalvarPrumada = () => {
    // 💡 AVISOS INTELIGENTES EM DETALHE
    if (!nomePrumada.trim()) {
      const msg =
        "Digite um 'Nome' para a Prumada (Ex: Prumada Leste, Prumada 1).";
      Platform.OS === "web"
        ? window.alert(msg)
        : Alert.alert("Campo Obrigatório", msg);
      return;
    }
    if (!setorSelecionado) {
      const msg =
        "Selecione uma 'Unidade' disponível na lista de opções para vincular à prumada.";
      Platform.OS === "web"
        ? window.alert(msg)
        : Alert.alert("Falta a Unidade", msg);
      return;
    }
    if (!quantidadeNaPrumada.trim()) {
      const msg =
        "Informe a 'Quantidade' de apartamentos desta tipologia que ficarão nesta prumada.";
      Platform.OS === "web"
        ? window.alert(msg)
        : Alert.alert("Campo Obrigatório", msg);
      return;
    }

    const qtd = parseInt(quantidadeNaPrumada);
    if (isNaN(qtd) || qtd <= 0) {
      const msg = "A quantidade deve ser um número válido e maior que zero.";
      Platform.OS === "web"
        ? window.alert(msg)
        : Alert.alert("Valor Inválido", msg);
      return;
    }

    if (setorSelecionadoDados && qtd > setorSelecionadoDados.saldo) {
      const msg = `Erro: Você tentou alocar ${qtd}, mas só tem mais ${setorSelecionadoDados.saldo}x "${setorSelecionadoDados.nome}" disponíveis.`;
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Atenção", msg);
      return;
    }

    const novaUnidade: UnidadePrumada = {
      setorId: setorSelecionadoDados!.id,
      nomeSetor: setorSelecionadoDados!.nome,
      quantidade: qtd,
    };

    const novaPrumada: Prumada = {
      id: Math.random().toString(),
      nome: nomePrumada,
      unidades: [novaUnidade],
    };

    prumadasDispatch([...prumadas, novaPrumada]);
    setNomePrumada("");
    setSetorSelecionado(null);
    setQuantidadeNaPrumada("");
  };

  const removerPrumada = (id: string) => {
    prumadasDispatch(prumadas.filter((p) => p.id !== id));
  };

  const confirmarRemocao = (id: string, nome: string) => {
    const msg = `Tem certeza que deseja remover a prumada "${nome}"? A quantidade voltará para o saldo disponível.`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) removerPrumada(id);
    } else {
      Alert.alert("Confirmar Exclusão", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => removerPrumada(id),
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Gestão de Prumadas" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Criar Nova Prumada</Text>

          <Text style={styles.label}>Nome da Prumada</Text>
          <TextInput
            style={styles.input}
            value={nomePrumada}
            onChangeText={setNomePrumada}
            placeholder="Ex: Prumada Leste"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>
            Selecione a Unidade (Saldo Disponível)
          </Text>
          {apartamentosDisponiveis.length === 0 ? (
            <Text style={styles.textoAviso}>
              Vá na tela de "Cargas" e cadastre apartamentos primeiro.
            </Text>
          ) : (
            <View style={styles.chipsContainer}>
              {saldos.map((apto) => {
                const esgotado = apto.saldo === 0;
                const isSelected = setorSelecionado === apto.id;

                return (
                  <TouchableOpacity
                    key={apto.id}
                    style={[
                      styles.chip,
                      isSelected && styles.chipActive,
                      esgotado && !isSelected && styles.chipEsgotado,
                    ]}
                    onPress={() => !esgotado && setSetorSelecionado(apto.id)}
                    activeOpacity={0.7}
                    disabled={esgotado}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                        esgotado && !isSelected && styles.chipTextEsgotado,
                      ]}
                    >
                      {apto.nome} (Faltam {apto.saldo})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={styles.label}>Quantidade nesta Prumada</Text>
          <TextInput
            style={styles.input}
            value={quantidadeNaPrumada}
            onChangeText={setQuantidadeNaPrumada}
            keyboardType="numeric"
            placeholder={
              setorSelecionadoDados
                ? `Max: ${setorSelecionadoDados.saldo}`
                : "Ex: 10"
            }
            placeholderTextColor="#9ca3af"
            editable={
              !!setorSelecionadoDados && setorSelecionadoDados.saldo > 0
            }
          />

          <TouchableOpacity
            style={[
              styles.botaoSalvar,
              (!nomePrumada || !setorSelecionado || !quantidadeNaPrumada) && {
                opacity: 0.5,
              },
            ]}
            onPress={handleSalvarPrumada}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotaoSalvar}>Adicionar Prumada</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listaContainer}>
          <Text style={styles.tituloLista}>Prumadas do Projeto</Text>

          {prumadas.length === 0 ? (
            <Text style={styles.textoVazio}>Nenhuma prumada configurada.</Text>
          ) : (
            prumadas.map((prumada) => (
              <View key={prumada.id} style={styles.cardItem}>
                <View style={styles.cardInfo}>
                  <Text style={styles.itemNome}>{prumada.nome}</Text>
                  {prumada.unidades.map((u, index) => (
                    <Text key={index} style={styles.itemDetalhe}>
                      {u.quantidade}x {u.nomeSetor}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.botaoExcluir}
                  onPress={() => confirmarRemocao(prumada.id, prumada.nome)}
                >
                  <FontAwesome5 name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.finalizacaoContainer}>
          <TouchableOpacity
            style={[
              styles.botaoFinalizar,
              !todosAlocados && styles.botaoFinalizarDesabilitado,
            ]}
            disabled={!todosAlocados}
            onPress={() => router.replace("/quadro")}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name={todosAlocados ? "check-circle" : "lock"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.textoBotaoFinalizar}>
              {todosAlocados
                ? "Finalizar Distribuição"
                : "Distribuição Incompleta"}
            </Text>
          </TouchableOpacity>

          {!todosAlocados && apartamentosDisponiveis.length > 0 && (
            <Text style={styles.textoAjudaFinalizar}>
              Alóque todas as unidades pendentes para liberar o Relatório QGBT.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: {
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: { elevation: 3 },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1f2937",
  },
  textoAviso: {
    color: "#ef4444",
    fontStyle: "italic",
    fontSize: 13,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: { backgroundColor: "#eff6ff", borderColor: "#2563eb" },
  chipEsgotado: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
    borderColor: "#d1d5db",
  },
  chipText: { color: "#4b5563", fontSize: 13, fontWeight: "bold" },
  chipTextActive: { color: "#2563eb" },
  chipTextEsgotado: { color: "#9ca3af", textDecorationLine: "line-through" },
  botaoSalvar: {
    backgroundColor: "#8b5cf6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoBotaoSalvar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  listaContainer: { marginTop: 10 },
  tituloLista: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  textoVazio: {
    textAlign: "center",
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 10,
  },
  cardItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  cardInfo: { flex: 1 },
  itemNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  itemDetalhe: { fontSize: 14, color: "#6b7280" },
  botaoExcluir: { padding: 10 },
  finalizacaoContainer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: "center",
  },
  botaoFinalizar: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    gap: 10,
  },
  botaoFinalizarDesabilitado: { backgroundColor: "#9ca3af" },
  textoBotaoFinalizar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  textoAjudaFinalizar: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
});
