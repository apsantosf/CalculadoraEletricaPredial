//    src/app/(telas)/prumadas
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import {
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
  // ATUALIZADO: Usando prumadasDispatch para salvar no AsyncStorage automaticamente
  const { setores, prumadas, prumadasDispatch } = useData();

  const apartamentosDisponiveis = setores.filter(
    (s) => s.tipoSetor === "Apartamento",
  );

  const [nomePrumada, setNomePrumada] = useState("");
  const [setorSelecionado, setSetorSelecionado] = useState<string | null>(null);
  const [quantidadeNaPrumada, setQuantidadeNaPrumada] = useState("1");

  const handleSalvarPrumada = () => {
    if (!nomePrumada || !setorSelecionado || !quantidadeNaPrumada) {
      const msg =
        "Preencha o nome da prumada, selecione uma unidade e informe a quantidade.";
      Platform.OS === "web" ? window.alert(msg) : alert(msg);
      return;
    }

    const setor = apartamentosDisponiveis.find(
      (s) => s.id === setorSelecionado,
    );
    if (!setor) return;

    const novaUnidade: UnidadePrumada = {
      setorId: setor.id,
      nomeSetor: setor.nome,
      quantidade: parseInt(quantidadeNaPrumada) || 1,
    };

    const novaPrumada: Prumada = {
      id: Math.random().toString(),
      nome: nomePrumada,
      unidades: [novaUnidade],
    };

    // ATUALIZADO: Agora salva a lista completa disparando a nova função
    prumadasDispatch([...prumadas, novaPrumada]);

    setNomePrumada("");
    setSetorSelecionado(null);
    setQuantidadeNaPrumada("1");
  };

  // ATUALIZADO: Função para remover uma prumada
  const removerPrumada = (id: string) => {
    prumadasDispatch(prumadas.filter((p) => p.id !== id));
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
            placeholder="Ex: Prumada A - Lado Esquerdo"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Selecione o Tipo de Apartamento</Text>
          {apartamentosDisponiveis.length === 0 ? (
            <Text style={styles.textoAviso}>
              Vá na tela de "Cargas" e cadastre apartamentos primeiro.
            </Text>
          ) : (
            <View style={styles.chipsContainer}>
              {apartamentosDisponiveis.map((apto) => (
                <TouchableOpacity
                  key={apto.id}
                  style={[
                    styles.chip,
                    setorSelecionado === apto.id && styles.chipActive,
                  ]}
                  onPress={() => setSetorSelecionado(apto.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      setorSelecionado === apto.id && styles.chipTextActive,
                    ]}
                  >
                    {apto.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Quantidade nesta Prumada</Text>
          <TextInput
            style={styles.input}
            value={quantidadeNaPrumada}
            onChangeText={setQuantidadeNaPrumada}
            keyboardType="numeric"
            placeholder="Ex: 18"
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity
            style={[
              styles.botaoSalvar,
              apartamentosDisponiveis.length === 0 && { opacity: 0.5 },
            ]}
            onPress={handleSalvarPrumada}
            activeOpacity={0.8}
            disabled={apartamentosDisponiveis.length === 0}
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
                  onPress={() => removerPrumada(prumada.id)}
                >
                  <FontAwesome5 name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
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
  },
  chipActive: { backgroundColor: "#2563eb" },
  chipText: { color: "#4b5563", fontSize: 13, fontWeight: "bold" },
  chipTextActive: { color: "#ffffff" },
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
});
