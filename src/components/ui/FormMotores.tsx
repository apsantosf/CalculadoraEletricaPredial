// src/components/ui/FormMotores.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";
import { Carga } from "../../utils/templates";

interface FormMotoresProps {
  onSalvar: (carga: Omit<Carga, "id" | "tipo">) => void;
}

// 💡 Unidades ordenadas alfabéticamente de forma automática
const UNIDADES_DISPONIVEIS = ["W", "kW", "CV", "HP", "VA", "kVA", "BTU"].sort(
  (a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "accent" }),
);

export default function FormMotores({ onSalvar }: FormMotoresProps) {
  const { listaEquipamentos, setListaEquipamentos, removerEquipamentoDaLista } =
    useData();
  const OPCAO_MANUAL = {
    id: "0",
    nome: "Outro Equipamento (Digitar Manualmente)",
    potencia: "",
    unidade: "W",
  };

  const [modalEquipamentoVisivel, setModalEquipamentoVisivel] = useState(false);
  const [modalUnidadeVisivel, setModalUnidadeVisivel] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(
    listaEquipamentos[0] || OPCAO_MANUAL,
  );

  const [nomeManual, setNomeManual] = useState("");
  const [potencia, setPotencia] = useState(
    equipamentoSelecionado?.potencia || "",
  );
  const [unidade, setUnidade] = useState(
    equipamentoSelecionado?.unidade || "W",
  );
  const [quantidade, setQuantidade] = useState("1");

  const isManual = equipamentoSelecionado.id === "0";

  // 💡 Ordena a lista de equipamentos alfabeticamente pelo nome
  const equipamentosOrdenados = [...listaEquipamentos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "accent" }),
  );

  const selecionarEquipamento = (item: any) => {
    setEquipamentoSelecionado(item);
    if (item.id !== "0") {
      setPotencia(item.potencia);
      setUnidade(item.unidade);
    } else {
      setNomeManual("");
      setPotencia("");
    }
    setModalEquipamentoVisivel(false);
  };

  const selecionarUnidade = (u: string) => {
    setUnidade(u);
    setModalUnidadeVisivel(false);
  };

  const confirmarExclusaoEquipamento = (id: string, nome: string) => {
    const msg = `Deseja excluir "${nome}" da sua lista de equipamentos salvos?`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) {
        removerEquipamentoDaLista(id);
        if (equipamentoSelecionado.id === id) {
          setEquipamentoSelecionado(OPCAO_MANUAL);
        }
      }
    } else {
      Alert.alert("Excluir Equipamento", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            removerEquipamentoDaLista(id);
            if (equipamentoSelecionado.id === id) {
              setEquipamentoSelecionado(OPCAO_MANUAL);
            }
          },
        },
      ]);
    }
  };

  const handleAdicionar = () => {
    const nomeFinal = isManual
      ? nomeManual.trim()
      : equipamentoSelecionado.nome;
    const potNumber = parseFloat(potencia.replace(",", "."));
    const qtdNumber = parseInt(quantidade);

    if (
      !nomeFinal ||
      isNaN(potNumber) ||
      potNumber <= 0 ||
      isNaN(qtdNumber) ||
      qtdNumber <= 0
    ) {
      const msg =
        "Preencha todos os campos corretamente com valores maiores que zero.";
      Platform.OS === "web" ? window.alert(msg) : alert(msg);
      return;
    }

    if (isManual) {
      const jaExiste = listaEquipamentos.some(
        (eq) => eq.nome.toLowerCase() === nomeFinal.toLowerCase(),
      );

      if (!jaExiste) {
        const novoEquipamento = {
          id: Math.random().toString(),
          nome: nomeFinal,
          potencia: potNumber.toString(),
          unidade: unidade,
        };
        setListaEquipamentos([...listaEquipamentos, novoEquipamento]);
      }
    }

    onSalvar({
      nome: nomeFinal,
      potencia: potNumber,
      quantidade: qtdNumber,
      unidadeMedida: unidade,
    });

    setQuantidade("1");
    if (isManual) {
      setNomeManual("");
      setPotencia("");
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Cadastrar Área Comum</Text>

      <Text style={styles.label}>Selecione o Equipamento</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalEquipamentoVisivel(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.pickerButtonText, isManual && { color: "#8b5cf6" }]}
        >
          {equipamentoSelecionado.nome}
        </Text>
        <FontAwesome5 name="chevron-down" size={14} color="#6b7280" />
      </TouchableOpacity>

      {isManual && (
        <>
          <Text style={styles.label}>Nome do Equipamento</Text>
          <TextInput
            style={styles.input}
            value={nomeManual}
            onChangeText={setNomeManual}
            placeholder="Ex: Ar-Condicionado Hall"
            placeholderTextColor="#9ca3af"
          />
        </>
      )}

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Potência Unitária</Text>
          <TextInput
            style={styles.input}
            value={potencia}
            onChangeText={setPotencia}
            keyboardType="numeric"
            placeholder="Ex: 9000"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.col}>
          <Text style={styles.label}>Unidade</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setModalUnidadeVisivel(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.pickerButtonText}>{unidade}</Text>
            <FontAwesome5 name="chevron-down" size={14} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.label}>Quantidade no Prédio</Text>
      <TextInput
        style={styles.input}
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        placeholder="Ex: 2"
        placeholderTextColor="#9ca3af"
      />

      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={handleAdicionar}
        activeOpacity={0.8}
      >
        <Text style={styles.textoBotaoAdicionar}>Adicionar Equipamento</Text>
      </TouchableOpacity>

      {/* MODAL DE EQUIPAMENTOS ORDENADOS ALFABETICAMENTE */}
      <Modal
        visible={modalEquipamentoVisivel}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lista de Equipamentos</Text>
              <TouchableOpacity
                onPress={() => setModalEquipamentoVisivel(false)}
                style={styles.modalClose}
              >
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[...equipamentosOrdenados, OPCAO_MANUAL]}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = equipamentoSelecionado.id === item.id;
                const isOpcaoManual = item.id === "0";

                return (
                  <View
                    style={[
                      styles.modalItemContainer,
                      isSelected && styles.modalItemAtivo,
                    ]}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onPress={() => selecionarEquipamento(item)}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          isSelected && styles.modalItemTextAtivo,
                        ]}
                      >
                        {item.nome}{" "}
                        {!isOpcaoManual &&
                          `- Padrão: ${item.potencia} ${item.unidade}`}
                      </Text>
                      {isSelected && (
                        <FontAwesome5 name="check" size={16} color="#2563eb" />
                      )}
                    </TouchableOpacity>

                    {!isOpcaoManual && (
                      <TouchableOpacity
                        style={styles.botaoLixeiraModal}
                        onPress={() =>
                          confirmarExclusaoEquipamento(item.id, item.nome)
                        }
                      >
                        <FontAwesome5 name="trash" size={14} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL DE UNIDADES ORDENADAS ALFABETICAMENTE */}
      <Modal visible={modalUnidadeVisivel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentUnidade}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Unidade de Medida</Text>
              <TouchableOpacity
                onPress={() => setModalUnidadeVisivel(false)}
                style={styles.modalClose}
              >
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={UNIDADES_DISPONIVEIS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    unidade === item && styles.modalItemAtivo,
                  ]}
                  onPress={() => selecionarUnidade(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      unidade === item && styles.modalItemTextAtivo,
                    ]}
                  >
                    {item}
                  </Text>
                  {unidade === item && (
                    <FontAwesome5 name="check" size={16} color="#2563eb" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
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
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  botaoAdicionar: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoBotaoAdicionar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 14,
  },
  pickerButtonText: { fontSize: 15, color: "#1f2937", fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    paddingBottom: 20,
    ...Platform.select({
      web: { maxWidth: 450, width: "100%", alignSelf: "center" },
    }),
  },
  modalContentUnidade: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "50%",
    paddingBottom: 20,
    ...Platform.select({
      web: { maxWidth: 450, width: "100%", alignSelf: "center" },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  modalClose: { padding: 5 },

  modalItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemAtivo: { backgroundColor: "#eff6ff" },
  modalItemText: { fontSize: 15, color: "#4b5563", flex: 1 },
  modalItemTextAtivo: { color: "#2563eb", fontWeight: "bold" },
  botaoLixeiraModal: { padding: 8, marginLeft: 10 },
});
