import { FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Carga, Setor } from "../../utils/templates";

interface Props {
  onSalvar: (novoSetor: Setor) => void;
}

const SUGESTOES_CARGAS = [
  { label: "Selecione uma sugestão...", potencia: "" },
  { label: "Iluminação e TUGs (Geral)", potencia: "1500" },
  { label: "Ar-Condicionado 9.000 BTU", potencia: "820" },
  { label: "Ar-Condicionado 12.000 BTU", potencia: "1100" },
  { label: "Ar-Condicionado 18.000 BTU", potencia: "1700" },
  { label: "Chuveiro Elétrico", potencia: "5500" },
  { label: "Torneira Elétrica", potencia: "4400" },
  { label: "Micro-ondas", potencia: "1500" },
  { label: "Forno Elétrico", potencia: "2000" },
];

export default function FormPrevisaoCarga({ onSalvar }: Props) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [fases, setFases] = useState("2");

  const [sugestaoSelecionada, setSugestaoSelecionada] = useState(
    SUGESTOES_CARGAS[0].label,
  );
  const [nomeCarga, setNomeCarga] = useState("");
  const [potenciaCarga, setPotenciaCarga] = useState("");
  const [listaCargas, setListaCargas] = useState<Carga[]>([]);

  const handleSelecaoSugestao = (val: string) => {
    setSugestaoSelecionada(val);
    const sel = SUGESTOES_CARGAS.find((c) => c.label === val);
    if (sel && sel.potencia !== "") {
      setNomeCarga(sel.label);
      setPotenciaCarga(sel.potencia);
    } else {
      setNomeCarga("");
      setPotenciaCarga("");
    }
  };

  const handleAddCarga = () => {
    const pot = parseFloat(potenciaCarga.replace(",", "."));
    if (!nomeCarga.trim() || isNaN(pot)) {
      const msg = "Preencha o nome e a potência do equipamento/circuito.";
      Platform.OS === "web" ? window.alert(msg) : alert(msg);
      return;
    }

    const novaCarga: Carga = {
      id: Math.random().toString(),
      nome: nomeCarga,
      potencia: pot,
      unidadeMedida: "W",
      fatorPotencia: 0.95,
      tipo: "Geral",
    };

    setListaCargas([...listaCargas, novaCarga]);
    setNomeCarga("");
    setPotenciaCarga("");
    setSugestaoSelecionada(SUGESTOES_CARGAS[0].label);
  };

  const handleRemoverCarga = (id: string) => {
    setListaCargas(listaCargas.filter((c) => c.id !== id));
  };

  const handleSalvar = () => {
    if (!nome.trim() || listaCargas.length === 0) {
      const msg =
        "Dê um nome à tipologia e adicione pelo menos um equipamento na lista abaixo.";
      Platform.OS === "web" ? window.alert(msg) : alert(msg);
      return;
    }

    const novoSetor: Setor = {
      id: Math.random().toString(),
      nome,
      tipoSetor: "Apartamento",
      quantidade: parseInt(quantidade) || 1,
      fases: parseInt(fases) || 2,
      cargas: listaCargas,
    };

    onSalvar(novoSetor);
    setNome("");
    setQuantidade("1");
    setListaCargas([]);
  };

  const totalW = listaCargas.reduce((acc, c) => acc + c.potencia, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>1. Dados da Tipologia</Text>
      <View style={styles.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <Text style={styles.label}>Nome do Tipo (Ex: Apto Padrão)</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Apto Padrão"
          />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Qtd. Prédio</Text>
          <TextInput
            style={styles.input}
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Fases</Text>
          <TextInput
            style={styles.input}
            value={fases}
            onChangeText={setFases}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.subtitle}>
        2. Composição de Cargas (Adicione os Itens)
      </Text>

      <Text style={styles.label}>Sugestões Rápidas</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sugestaoSelecionada}
          onValueChange={handleSelecaoSugestao}
          style={styles.picker}
        >
          {SUGESTOES_CARGAS.map((c, i) => (
            <Picker.Item key={i} label={c.label} value={c.label} />
          ))}
        </Picker>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <Text style={styles.label}>Equipamento/Circuito (Editável)</Text>
          <TextInput
            style={styles.input}
            value={nomeCarga}
            onChangeText={setNomeCarga}
            placeholder="Ex: Chuveiro Elétrico"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Potência (W)</Text>
          <TextInput
            style={styles.input}
            value={potenciaCarga}
            onChangeText={setPotenciaCarga}
            keyboardType="numeric"
            placeholder="Ex: 5500"
          />
        </View>
      </View>

      {/* 💡 ESTE BOTÃO ESTAVA INVISÍVEL */}
      <TouchableOpacity style={styles.btnAddCarga} onPress={handleAddCarga}>
        <Text style={styles.btnAddCargaText}>
          + Adicionar Equipamento à Lista
        </Text>
      </TouchableOpacity>

      {listaCargas.length > 0 && (
        <View style={styles.listaContainer}>
          {listaCargas.map((c) => (
            <View key={c.id} style={styles.itemCarga}>
              <Text style={styles.itemCargaText}>
                ⚡ {c.nome} ({c.potencia} W)
              </Text>
              <TouchableOpacity onPress={() => handleRemoverCarga(c.id)}>
                <FontAwesome5 name="trash" size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <Text style={styles.totalText}>
            Carga Total do Apartamento: {totalW} W
          </Text>
        </View>
      )}

      {/* 💡 ESTE BOTÃO TAMBÉM */}
      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
        <Text style={styles.btnSalvarText}>Salvar Tipologia</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 5 },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  row: { flexDirection: "row", marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f9fafb",
    fontSize: 14,
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

  // 💡 ESTILOS DOS BOTÕES RESTAURADOS AQUI
  btnAddCarga: {
    backgroundColor: "#e0e7ff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  btnAddCargaText: { color: "#4f46e5", fontWeight: "bold" },
  listaContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  itemCarga: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  itemCargaText: { fontSize: 14, color: "#334155", fontWeight: "500" },
  totalText: {
    marginTop: 12,
    fontWeight: "bold",
    color: "#0f766e",
    textAlign: "right",
    fontSize: 15,
  },
  btnSalvar: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnSalvarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
