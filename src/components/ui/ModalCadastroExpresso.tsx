// src/components/ui/ModalCadastroExpresso.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ModalCadastroExpressoProps {
  visivel: boolean;
  isPlanta: boolean;
  temApartamentos: boolean;
  onClose: () => void;
  onSalvar: (novoSetor: any) => void;
}

export default function ModalCadastroExpresso({
  visivel,
  isPlanta,
  temApartamentos,
  onClose,
  onSalvar,
}: ModalCadastroExpressoProps) {
  const [tabAtiva, setTabAtiva] = useState<"Apartamento" | "AreaComum">(
    "Apartamento",
  );

  const [nomeSetor, setNomeSetor] = useState("");
  const [qtdSetor, setQtdSetor] = useState("1");
  const [fasesSetor, setFasesSetor] = useState("2");

  const [potenciaTotalApto, setPotenciaTotalApto] = useState("");

  const [nomeCarga, setNomeCarga] = useState("");
  const [potenciaCarga, setPotenciaCarga] = useState("");
  const [listaCargas, setListaCargas] = useState<any[]>([]);

  React.useEffect(() => {
    if (visivel) {
      setNomeSetor("");
      setQtdSetor("1");
      setFasesSetor("2");
      setPotenciaTotalApto("");
      setNomeCarga("");
      setPotenciaCarga("");
      setListaCargas([]);
      setTabAtiva(isPlanta ? "AreaComum" : "Apartamento");
    }
  }, [visivel, isPlanta]);

  const adicionarCargaNaLista = () => {
    if (!nomeCarga.trim()) {
      const msg =
        "Por favor, informe o Nome do Equipamento/Motor (Ex: Bomba Recalque).";
      Platform.OS === "web"
        ? window.alert(msg)
        : Alert.alert("Campo Obrigatório", msg);
      return;
    }
    const pot = Number(potenciaCarga);
    if (isNaN(pot) || pot <= 0) {
      const msg =
        "A 'Potência (W)' do equipamento precisa ser um número maior que zero.";
      Platform.OS === "web"
        ? window.alert(msg)
        : Alert.alert("Campo Obrigatório", msg);
      return;
    }

    const novaCarga = {
      id: Date.now().toString(),
      nome: nomeCarga,
      potencia: pot,
      unidadeMedida: "W",
      quantidade: 1,
    };
    setListaCargas([...listaCargas, novaCarga]);
    setNomeCarga("");
    setPotenciaCarga("");
  };

  const removerCargaDaLista = (id: string) => {
    setListaCargas(listaCargas.filter((c) => c.id !== id));
  };

  const salvarSetor = () => {
    if (!nomeSetor.trim()) {
      const msg = `Para salvar, informe o Nome da ${tabAtiva === "Apartamento" ? "Tipologia" : "Área"} lá no topo da tela (Ex: Apto Padrão, Casa de Máquinas).`;
      Platform.OS === "web"
        ? window.alert(msg)
        : Alert.alert("Falta o Nome", msg);
      return;
    }

    let cargasFinais = [];

    if (tabAtiva === "Apartamento") {
      const potApto = Number(potenciaTotalApto);
      if (!potenciaTotalApto.trim() || isNaN(potApto) || potApto <= 0) {
        const msg =
          "Você esqueceu de informar a 'Potência Total da Unidade (W)'. Este valor precisa ser maior que zero.";
        Platform.OS === "web"
          ? window.alert(msg)
          : Alert.alert("Campo Obrigatório", msg);
        return;
      }
      cargasFinais = [
        {
          id: Date.now().toString() + "-total",
          nome: "Carga Total Calculada",
          potencia: potApto,
          unidadeMedida: "W",
          quantidade: 1,
        },
      ];
    } else {
      if (listaCargas.length === 0) {
        const msg =
          "Você precisa adicionar pelo menos 1 Equipamento na lista clicando no botão '+ Adicionar Equipamento' antes de salvar.";
        Platform.OS === "web"
          ? window.alert(msg)
          : Alert.alert("Lista Vazia", msg);
        return;
      }
      cargasFinais = listaCargas;
    }

    const novoSetor = {
      id: Date.now().toString(),
      nome: nomeSetor,
      tipoSetor: tabAtiva,
      quantidade: Number(qtdSetor) || 1,
      fases: Number(fasesSetor) || 2,
      cargas: cargasFinais,
    };

    onSalvar(novoSetor);

    setNomeSetor("");
    if (tabAtiva === "Apartamento") {
      setPotenciaTotalApto("");
    } else {
      setListaCargas([]);
    }
  };

  return (
    <Modal visible={visivel} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cadastro Expresso</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            {!isPlanta && (
              <TouchableOpacity
                style={[
                  styles.tab,
                  tabAtiva === "Apartamento" && styles.tabAtiva,
                ]}
                onPress={() => setTabAtiva("Apartamento")}
              >
                <FontAwesome5
                  name="building"
                  size={14}
                  color={tabAtiva === "Apartamento" ? "#ffffff" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.tabText,
                    tabAtiva === "Apartamento" && styles.tabTextAtiva,
                  ]}
                >
                  Tipologia (Apto)
                </Text>
              </TouchableOpacity>
            )}

            {(isPlanta || temApartamentos) && (
              <TouchableOpacity
                style={[
                  styles.tab,
                  tabAtiva === "AreaComum" && styles.tabAtiva,
                ]}
                onPress={() => setTabAtiva("AreaComum")}
              >
                <FontAwesome5
                  name="cogs"
                  size={14}
                  color={tabAtiva === "AreaComum" ? "#ffffff" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.tabText,
                    tabAtiva === "AreaComum" && styles.tabTextAtiva,
                  ]}
                >
                  Áreas Comuns
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionTitle}>
              1. Dados da {tabAtiva === "Apartamento" ? "Tipologia" : "Área"}
            </Text>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder={
                tabAtiva === "Apartamento"
                  ? "Ex: Apto Padrão"
                  : "Ex: Casa de Máquinas"
              }
              value={nomeSetor}
              onChangeText={setNomeSetor}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Qtd. Prédio</Text>
                {/* 💡 FILTRO APLICADO AQUI: Apenas inteiros */}
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={qtdSetor}
                  onChangeText={(text) =>
                    setQtdSetor(text.replace(/[^0-9]/g, ""))
                  }
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Fases (Ramal)</Text>
                {/* 💡 FILTRO APLICADO AQUI: Apenas inteiros */}
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={fasesSetor}
                  onChangeText={(text) =>
                    setFasesSetor(text.replace(/[^0-9]/g, ""))
                  }
                />
              </View>
            </View>

            {tabAtiva === "Apartamento" ? (
              <View style={styles.boxInteligente}>
                <Text style={styles.sectionTitle}>
                  2. Carga Total (Calculada)
                </Text>
                <Text style={styles.label}>Potência Total da Unidade (W)</Text>
                {/* 💡 FILTRO APLICADO AQUI: Permite números e decimais */}
                <TextInput
                  style={styles.inputDestaque}
                  placeholder="Ex: 15000"
                  keyboardType="numeric"
                  value={potenciaTotalApto}
                  onChangeText={(text) =>
                    setPotenciaTotalApto(text.replace(/[^0-9.,]/g, ""))
                  }
                />
                <Text style={styles.dicaTexto}>
                  💡 Insira a demanda total já calculada para esta tipologia. Se
                  precisar detalhar ponto a ponto, feche esta tela e use o botão
                  "Dimensionar".
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>
                  2. Composição de Cargas (Itens)
                </Text>
                <View style={styles.row}>
                  <View style={[styles.col, { flex: 2 }]}>
                    <Text style={styles.label}>Equipamento/Motor</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Bomba Recalque"
                      value={nomeCarga}
                      onChangeText={setNomeCarga}
                    />
                  </View>
                  <View style={styles.col}>
                    <Text style={styles.label}>Potência (W)</Text>
                    {/* 💡 FILTRO APLICADO AQUI: Permite números e decimais */}
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 2200"
                      keyboardType="numeric"
                      value={potenciaCarga}
                      onChangeText={(text) =>
                        setPotenciaCarga(text.replace(/[^0-9.,]/g, ""))
                      }
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.btnAdicionarLista}
                  onPress={adicionarCargaNaLista}
                >
                  <Text style={styles.btnAdicionarListaText}>
                    + Adicionar Equipamento
                  </Text>
                </TouchableOpacity>

                {listaCargas.length > 0 && (
                  <View style={styles.listaMini}>
                    {listaCargas.map((c) => (
                      <View key={c.id} style={styles.itemMini}>
                        <Text style={styles.itemMiniText}>
                          ⚡ {c.nome} ({c.potencia}W)
                        </Text>
                        <TouchableOpacity
                          onPress={() => removerCargaDaLista(c.id)}
                        >
                          <FontAwesome5
                            name="trash"
                            size={14}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.btnSalvar} onPress={salvarSetor}>
            <Text style={styles.btnSalvarText}>
              Salvar {tabAtiva === "Apartamento" ? "Tipologia" : "Área"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: 500,
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  tabAtiva: { backgroundColor: "#2563eb" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  tabTextAtiva: { color: "#ffffff" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    marginTop: 10,
  },
  label: { fontSize: 13, color: "#4b5563", marginBottom: 4, fontWeight: "500" },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: "#1f2937",
  },
  inputDestaque: {
    backgroundColor: "#eff6ff",
    borderWidth: 2,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "center",
  },
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  boxInteligente: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 10,
  },
  dicaTexto: {
    fontSize: 12,
    color: "#059669",
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 18,
  },
  btnAdicionarLista: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  btnAdicionarListaText: { color: "#4f46e5", fontWeight: "bold", fontSize: 14 },
  listaMini: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  itemMini: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  itemMiniText: { fontSize: 13, color: "#4b5563" },
  btnSalvar: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  btnSalvarText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
});
