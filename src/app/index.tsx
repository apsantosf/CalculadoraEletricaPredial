// src/app/index.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Linking, // 💡 NOVO: Importamos o Linking para abrir a URL
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";

export default function ScreenInicio() {
  const router = useRouter();
  const {
    nomeProjeto,
    setNomeProjeto,
    numeroAndares,
    setNumeroAndares,
    tensao,
    setTensao,
    projetosSalvos,
    carregarProjeto,
    excluirProjeto,
    idProjetoAtual,
  } = useData();

  const [modalProjetosVisivel, setModalProjetosVisivel] = useState(false);
  const [busca, setBusca] = useState("");

  const abrirModalProjetos = () => {
    setBusca("");
    setModalProjetosVisivel(true);
  };

  const handleAbrirProjeto = (id: string) => {
    carregarProjeto(id);
    setModalProjetosVisivel(false);
  };

  const confirmarExclusao = (id: string, nome: string) => {
    const msg = `Deseja excluir permanentemente o projeto "${nome}"?`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) {
        excluirProjeto(id);
      }
    } else {
      Alert.alert("Excluir Projeto", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirProjeto(id),
        },
      ]);
    }
  };

  // 💡 Função para abrir o Manual no Google Drive
  const abrirManual = () => {
    const urlManual =
      "https://drive.google.com/file/d/1rX-ms619ps_w6UCj7Y5BydqcMz3cclwm/view?usp=sharing";
    Linking.openURL(urlManual).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o link do manual.");
    });
  };

  const projetosFiltrados = [...projetosSalvos]
    .filter((p) => {
      const nome = p.nomeProjeto || "Projeto Sem Nome";
      return nome.toLowerCase().includes(busca.toLowerCase());
    })
    .sort((a, b) => {
      const nomeA = a.nomeProjeto || "Projeto Sem Nome";
      const nomeB = b.nomeProjeto || "Projeto Sem Nome";
      return nomeA.localeCompare(nomeB, "pt-BR", { sensitivity: "accent" });
    });

  return (
    <View style={styles.container}>
      <CustomHeader title="Gestão de Cargas - Início" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PAINEL DE CONFIGURAÇÃO DO PROJETO ATUAL */}
        <View style={styles.cardConfig}>
          <Text style={styles.cardTitle}>Configurações do Projeto Ativo</Text>

          <Text style={styles.label}>Nome do Projeto</Text>
          <TextInput
            style={styles.input}
            value={nomeProjeto}
            onChangeText={setNomeProjeto}
            placeholder="Ex: Edifício Residencial Aurora"
            placeholderTextColor="#9ca3af"
          />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Número de Andares</Text>
              <TextInput
                style={styles.input}
                value={numeroAndares}
                onChangeText={setNumeroAndares}
                keyboardType="numeric"
                placeholder="Ex: 10"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.col}>
              <Text style={styles.label}>Tensão Trifásica (V)</Text>
              <View style={styles.tensaoContainer}>
                {["220", "380", "440"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.tensaoBtn,
                      tensao === t && styles.tensaoBtnAtivo,
                    ]}
                    onPress={() => setTensao(t)}
                  >
                    <Text
                      style={[
                        styles.tensaoTxt,
                        tensao === t && styles.tensaoTxtAtivo,
                      ]}
                    >
                      {t}V
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* BOTAO PARA ABRIR O PICKER */}
        <Text style={styles.sectionTitle}>Histórico de Projetos</Text>
        <Text style={styles.labelSecundario}>
          Resgate ou gerencie projetos salvos no dispositivo:
        </Text>

        <TouchableOpacity
          style={[
            styles.pickerButton,
            projetosSalvos.length === 0 && styles.pickerButtonDisabled,
          ]}
          onPress={abrirModalProjetos}
          disabled={projetosSalvos.length === 0}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome5
              name="folder-open"
              size={18}
              color={projetosSalvos.length === 0 ? "#9ca3af" : "#2563eb"}
              style={{ marginRight: 12 }}
            />
            <Text
              style={[
                styles.pickerButtonText,
                projetosSalvos.length === 0 && { color: "#9ca3af" },
              ]}
            >
              {projetosSalvos.length === 0
                ? "Nenhum projeto salvo ainda"
                : "Pesquisar e carregar projeto..."}
            </Text>
          </View>
          <FontAwesome5 name="chevron-down" size={14} color="#6b7280" />
        </TouchableOpacity>

        {/* 💡 NOVA SEÇÃO: AJUDA E DOCUMENTAÇÃO */}
        <View style={styles.secaoAjuda}>
          <Text style={styles.sectionTitle}>Ajuda e Suporte</Text>
          <Text style={styles.labelSecundario}>
            Acesse o guia passo a passo e o memorial de cálculos:
          </Text>
          <TouchableOpacity
            style={styles.botaoManual}
            onPress={abrirManual}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name="book"
              size={18}
              color="#ffffff"
              style={{ marginRight: 12 }}
            />
            <Text style={styles.textoBotaoManual}>Ler Manual do Usuário</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL COM BUSCA E LISTA FORMATADA */}
      <Modal visible={modalProjetosVisivel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Projetos Salvos</Text>
              <TouchableOpacity
                onPress={() => setModalProjetosVisivel(false)}
                style={styles.modalClose}
              >
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* BARRA DE PESQUISA */}
            <View style={styles.buscaContainer}>
              <FontAwesome5 name="search" size={14} color="#9ca3af" />
              <TextInput
                style={styles.buscaInput}
                placeholder="Pesquisar por nome..."
                placeholderTextColor="#9ca3af"
                value={busca}
                onChangeText={setBusca}
                autoFocus={Platform.OS === "web"}
              />
              {busca.length > 0 && (
                <TouchableOpacity
                  onPress={() => setBusca("")}
                  style={{ padding: 4 }}
                >
                  <FontAwesome5 name="times-circle" size={16} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={projetosFiltrados}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={styles.textoListaVazia}>
                  Nenhum projeto encontrado para "{busca}".
                </Text>
              }
              renderItem={({ item }) => {
                const isAtivo = item.id === idProjetoAtual;
                const nomeDisplay = item.nomeProjeto || "Projeto Sem Nome";
                const andaresDisplay = item.numeroAndares
                  ? `${item.numeroAndares} And.`
                  : "? And.";
                const tensaoDisplay = item.tensao ? `${item.tensao}V` : "";

                const linhaFormatada =
                  `${nomeDisplay} ${andaresDisplay} ${tensaoDisplay}`.trim();

                return (
                  <View
                    style={[
                      styles.modalItemContainer,
                      isAtivo && styles.modalItemAtivo,
                    ]}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingRight: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                      onPress={() => handleAbrirProjeto(item.id)}
                    >
                      <Text
                        style={[
                          styles.modalItemTextoUnico,
                          isAtivo && styles.modalItemTextoAtivo,
                        ]}
                      >
                        {linhaFormatada}
                      </Text>

                      {isAtivo && (
                        <View style={styles.badgeAtivo}>
                          <Text style={styles.badgeText}>Atual</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botaoLixeiraModal}
                      onPress={() =>
                        confirmarExclusao(
                          item.id,
                          item.nomeProjeto || "Projeto",
                        )
                      }
                    >
                      <FontAwesome5 name="trash" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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
    paddingBottom: 140,
  },

  cardConfig: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: { elevation: 3 },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 14,
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

  tensaoContainer: { flexDirection: "row", gap: 4, marginTop: 4 },
  tensaoBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tensaoBtnAtivo: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  tensaoTxt: { fontSize: 13, fontWeight: "bold", color: "#6b7280" },
  tensaoTxtAtivo: { color: "#ffffff" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  labelSecundario: { fontSize: 13, color: "#6b7280", marginBottom: 12 },

  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)" },
      default: { elevation: 2 },
    }),
  },
  pickerButtonDisabled: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    elevation: 0,
    boxShadow: "none",
  },
  pickerButtonText: { fontSize: 15, color: "#1f2937", fontWeight: "600" },

  // 💡 ESTILOS DO NOVO BOTÃO DE MANUAL
  secaoAjuda: {
    marginTop: 35,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 20,
  },
  botaoManual: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#475569", // Cinza chique/profissional
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: { elevation: 2 },
    }),
  },
  textoBotaoManual: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },

  // ESTILOS DO MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
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

  // ESTILOS DA BUSCA
  buscaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    margin: 16,
  },
  buscaInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1f2937",
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  textoListaVazia: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
    fontStyle: "italic",
  },

  modalItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemAtivo: { backgroundColor: "#eff6ff" },

  // TEXTO FORMATADO NUMA ÚNICA LINHA
  modalItemTextoUnico: { fontSize: 15, fontWeight: "500", color: "#374151" },
  modalItemTextoAtivo: { color: "#1d4ed8", fontWeight: "bold" },

  badgeAtivo: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: { color: "#1e40af", fontSize: 10, fontWeight: "bold" },
  botaoLixeiraModal: {
    padding: 10,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
  },
});
