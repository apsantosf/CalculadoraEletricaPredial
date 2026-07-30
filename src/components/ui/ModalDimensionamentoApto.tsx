import { FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  calcularDemandaApartamento,
  ComodoPlanta,
  ResultadoDemanda,
  TuePlanta,
} from "../../utils/CalculadoraNBR5410";

const OPCOES_COMODOS = [
  { label: "Sala de Estar", tipo: "sala" },
  { label: "Quarto", tipo: "sala" },
  { label: "Cozinha", tipo: "cozinha" },
  { label: "Banheiro", tipo: "banheiro" },
  { label: "Área de Serviço", tipo: "servico" },
];

const OPCOES_TUE = [
  { label: "Ar-Condicionado 9.000 BTU", potencia: 820 },
  { label: "Ar-Condicionado 12.000 BTU", potencia: 1100 },
  { label: "Chuveiro Elétrico", potencia: 5500 },
  { label: "Torneira Elétrica", potencia: 4400 },
  { label: "Forno Elétrico", potencia: 2000 },
  { label: "Micro-ondas", potencia: 1500 },
];

interface ModalProps {
  visivel: boolean;
  onClose: () => void;
  onSalvar: (
    cargas: ResultadoDemanda[],
    tipologia: string,
    quantidade: number,
    comodosCrus: ComodoPlanta[],
    tuesCrus: TuePlanta[],
  ) => void;
  dadosIniciais?: any;
}

export default function ModalDimensionamentoApto({
  visivel,
  onClose,
  onSalvar,
  dadosIniciais,
}: ModalProps) {
  const [abaAtiva, setAbaAtiva] = useState<"comodos" | "tues">("comodos");
  const [comodos, setComodos] = useState<ComodoPlanta[]>([]);
  const [tues, setTues] = useState<TuePlanta[]>([]);
  const [nomeTipologia, setNomeTipologia] = useState("Apto Tipo 1");
  const [quantidadeTipologia, setQuantidadeTipologia] = useState("1");

  const [nomeComodo, setNomeComodo] = useState(OPCOES_COMODOS[0].label);
  const [tipoComodo, setTipoComodo] = useState<ComodoPlanta["tipo"]>("sala");
  const [area, setArea] = useState("");
  const [perimetro, setPerimetro] = useState("");

  const [nomeTue, setNomeTue] = useState(OPCOES_TUE[0].label);
  const [potenciaTue, setPotenciaTue] = useState(
    OPCOES_TUE[0].potencia.toString(),
  );

  useEffect(() => {
    if (visivel) {
      if (dadosIniciais) {
        setNomeTipologia(dadosIniciais.nomeTipologia);
        setQuantidadeTipologia(dadosIniciais.quantidade.toString());
        setComodos(dadosIniciais.comodos);
        setTues(dadosIniciais.tues);
      } else {
        setNomeTipologia("Apto Tipo 1");
        setQuantidadeTipologia("1");
        setComodos([]);
        setTues([]);
        setAbaAtiva("comodos");
        setArea("");
        setPerimetro("");
      }
    }
  }, [visivel, dadosIniciais]);

  const handleSelecaoComodo = (val: string) => {
    const sel = OPCOES_COMODOS.find((c) => c.label === val);
    if (sel) {
      setNomeComodo(sel.label);
      setTipoComodo(sel.tipo as any);
    }
  };

  const handleSelecaoTue = (val: string) => {
    const sel = OPCOES_TUE.find((t) => t.label === val);
    if (sel) {
      setNomeTue(sel.label);
      setPotenciaTue(sel.potencia.toString());
    }
  };

  const handleAddComodo = () => {
    const numArea = parseFloat(area.replace(",", "."));
    const numPerim = parseFloat(perimetro.replace(",", "."));
    if (!nomeComodo.trim() || isNaN(numArea) || isNaN(numPerim)) {
      const msg = "Preencha a área e o perímetro corretamente.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Atenção", msg);
      return;
    }
    setComodos((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        nome: nomeComodo,
        tipo: tipoComodo,
        area: numArea,
        perimetro: numPerim,
      },
    ]);
    setArea("");
    setPerimetro("");
  };

  const handleAddTue = () => {
    const pot = parseFloat(potenciaTue.replace(",", "."));
    if (!nomeTue.trim() || isNaN(pot) || pot <= 0) {
      const msg = "Preencha o nome e a potência correta do equipamento.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Atenção", msg);
      return;
    }
    setTues((prev) => [
      ...prev,
      { id: Math.random().toString(), nome: nomeTue, potenciaW: pot },
    ]);
  };

  const confirmarRemocaoComodo = (id: string, nome: string) => {
    const msg = `Tem certeza que deseja remover o cômodo "${nome}"?`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) setComodos(comodos.filter((c) => c.id !== id));
    } else {
      Alert.alert("Remover Cômodo", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => setComodos(comodos.filter((c) => c.id !== id)),
        },
      ]);
    }
  };

  const confirmarRemocaoTue = (id: string, nome: string) => {
    const msg = `Tem certeza que deseja remover o equipamento "${nome}"?`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) setTues(tues.filter((t) => t.id !== id));
    } else {
      Alert.alert("Remover Equipamento", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => setTues(tues.filter((t) => t.id !== id)),
        },
      ]);
    }
  };

  const handleFinalizar = () => {
    if (comodos.length === 0 && tues.length === 0) {
      const msg =
        "Adicione pelo menos um Cômodo ou um Equipamento (TUE) antes de dimensionar.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Atenção", msg);
      return;
    }
    const qtd = parseInt(quantidadeTipologia) || 1;
    const nome = nomeTipologia.trim() || "Apto Dimensionado";
    const cargasCalculadas = calcularDemandaApartamento(comodos, tues);
    onSalvar(cargasCalculadas, nome, qtd, comodos, tues);
    onClose();
  };

  const isDesativado = comodos.length === 0 && tues.length === 0;
  const comodosOrdenados = [...comodos].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );
  const tuesOrdenados = [...tues].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );

  return (
    <Modal visible={visivel} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.tituloHeader}>
              {dadosIniciais ? "Editar Tipologia" : "Dimensionar Tipologia"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.btnClose}>
              <FontAwesome5 name="times" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, abaAtiva === "comodos" && styles.tabAtiva]}
              onPress={() => setAbaAtiva("comodos")}
            >
              <Text
                style={[
                  styles.tabText,
                  abaAtiva === "comodos" && styles.tabTextAtiva,
                ]}
              >
                1. Cômodos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, abaAtiva === "tues" && styles.tabAtiva]}
              onPress={() => setAbaAtiva("tues")}
            >
              <Text
                style={[
                  styles.tabText,
                  abaAtiva === "tues" && styles.tabTextAtiva,
                ]}
              >
                2. Equip. (TUEs)
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {abaAtiva === "comodos" && (
              <View>
                <Text style={styles.label}>Sugestões de Ambientes</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={nomeComodo}
                    onValueChange={handleSelecaoComodo}
                    style={styles.picker}
                  >
                    {OPCOES_COMODOS.map((c, i) => (
                      <Picker.Item key={i} label={c.label} value={c.label} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>
                  Nome do Ambiente (Livre/Editável)
                </Text>
                <TextInput
                  style={styles.inputNome}
                  value={nomeComodo}
                  onChangeText={setNomeComodo}
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>Área (m²)</Text>
                    <TextInput
                      style={styles.input}
                      value={area}
                      onChangeText={setArea}
                      keyboardType="numeric"
                      placeholder="Ex: 12"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Perímetro (m)</Text>
                    <TextInput
                      style={styles.input}
                      value={perimetro}
                      onChangeText={setPerimetro}
                      keyboardType="numeric"
                      placeholder="Ex: 14"
                    />
                  </View>
                </View>

                {/* 💡 ESTE BOTÃO TAMBÉM VOLTOU */}
                <TouchableOpacity
                  style={styles.btnAdd}
                  onPress={handleAddComodo}
                >
                  <Text style={styles.btnAddText}>+ Adicionar Cômodo</Text>
                </TouchableOpacity>

                {comodosOrdenados.map((item) => (
                  <View key={item.id} style={styles.listItem}>
                    <Text style={styles.itemText}>
                      🏠 {item.nome} ({item.area}m²)
                    </Text>
                    <TouchableOpacity
                      onPress={() => confirmarRemocaoComodo(item.id, item.nome)}
                    >
                      <FontAwesome5 name="trash" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {abaAtiva === "tues" && (
              <View>
                <Text style={styles.label}>
                  Sugestões de Equipamentos Pesados
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={nomeTue}
                    onValueChange={handleSelecaoTue}
                    style={styles.picker}
                  >
                    {OPCOES_TUE.map((t, i) => (
                      <Picker.Item key={i} label={t.label} value={t.label} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 2, marginRight: 8 }}>
                    <Text style={styles.label}>Equipamento (Editável)</Text>
                    <TextInput
                      style={styles.input}
                      value={nomeTue}
                      onChangeText={setNomeTue}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Potência (W)</Text>
                    <TextInput
                      style={styles.input}
                      value={potenciaTue}
                      onChangeText={setPotenciaTue}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* 💡 ESTE AQUI TAMBÉM */}
                <TouchableOpacity style={styles.btnAdd} onPress={handleAddTue}>
                  <Text style={styles.btnAddText}>+ Adicionar TUE</Text>
                </TouchableOpacity>

                {tuesOrdenados.map((item) => (
                  <View key={item.id} style={styles.listItem}>
                    <Text style={styles.itemText}>
                      ⚡ {item.nome} ({item.potenciaW} W)
                    </Text>
                    <TouchableOpacity
                      onPress={() => confirmarRemocaoTue(item.id, item.nome)}
                    >
                      <FontAwesome5 name="trash" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.formRow}>
              <View style={{ flex: 2, marginRight: 8 }}>
                <Text style={styles.labelFooter}>Nome da Tipologia</Text>
                <TextInput
                  style={styles.inputFooter}
                  value={nomeTipologia}
                  onChangeText={setNomeTipologia}
                  placeholder="Ex: Apto Tipo 1"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelFooter}>Qtd no Prédio</Text>
                <TextInput
                  style={styles.inputFooter}
                  value={quantidadeTipologia}
                  onChangeText={setQuantidadeTipologia}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* 💡 BOTÃO FINAL RESTAURADO */}
            <TouchableOpacity
              style={[
                styles.btnFinalizar,
                isDesativado && { backgroundColor: "#9ca3af" },
              ]}
              onPress={handleFinalizar}
              activeOpacity={0.8}
              disabled={isDesativado}
            >
              <Text style={styles.btnFinalizarText}>
                {dadosIniciais
                  ? "Atualizar Pacote ⚡"
                  : "Calcular e Empacotar ⚡"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    width: "95%",
    maxWidth: 450,
    height: "85%",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tituloHeader: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  btnClose: { padding: 4 },
  tabsContainer: { flexDirection: "row", backgroundColor: "#f3f4f6" },
  tab: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabAtiva: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  tabText: { fontSize: 14, fontWeight: "bold", color: "#6b7280" },
  tabTextAtiva: { color: "#2563eb" },
  content: { flex: 1, padding: 16 },
  formRow: { flexDirection: "row", marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  inputNome: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  pickerContainer: {
    backgroundColor: "#fefce8",
    borderWidth: 1,
    borderColor: "#fde047",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "center",
  },
  picker: { height: 55, color: "#1f2937", backgroundColor: "transparent" },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  labelFooter: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  inputFooter: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontWeight: "bold",
  },

  // 💡 ESTILOS DOS BOTÕES RESTAURADOS AQUI EMBAIXO:
  btnAdd: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  btnAddText: { color: "#4b5563", fontWeight: "bold", fontSize: 14 },
  btnFinalizar: {
    backgroundColor: "#059669",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnFinalizarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
