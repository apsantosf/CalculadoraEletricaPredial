// src/components/ui/FormMotores.tsx
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
import { Carga } from "../../utils/templates";

interface Props {
  onSalvar: (carga: Omit<Carga, "id" | "tipo">) => void;
}

const SUGESTOES_MOTORES = [
  { label: "Selecione uma sugestão...", potencia: "", unidade: "CV" },
  { label: "Elevador Social", potencia: "7.5", unidade: "CV" },
  { label: "Elevador de Serviço", potencia: "5", unidade: "CV" },
  { label: "Bomba D'Água (Recalque)", potencia: "2", unidade: "CV" },
  { label: "Bomba de Incêndio", potencia: "10", unidade: "CV" },
  { label: "Bomba de Piscina", potencia: "1.5", unidade: "CV" },
  { label: "Portão Eletrônico", potencia: "0.5", unidade: "CV" },
  { label: "Iluminação do Hall (Geral)", potencia: "1500", unidade: "W" },
];

export default function FormMotores({ onSalvar }: Props) {
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState(
    SUGESTOES_MOTORES[0].label,
  );

  const [nome, setNome] = useState("");
  const [potencia, setPotencia] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState<"CV" | "HP" | "W" | "kW">(
    "CV",
  );
  const [quantidade, setQuantidade] = useState("1");
  const [fatorPotencia, setFatorPotencia] = useState("0.92");

  const handleSelecaoSugestao = (val: string) => {
    setSugestaoSelecionada(val);
    const sel = SUGESTOES_MOTORES.find((c) => c.label === val);
    if (sel && sel.potencia !== "") {
      setNome(sel.label);
      setPotencia(sel.potencia);
      setUnidadeMedida(sel.unidade as any);
    } else {
      setNome("");
      setPotencia("");
    }
  };

  const handleSalvar = () => {
    const pot = parseFloat(potencia.replace(",", "."));
    const fp = parseFloat(fatorPotencia.replace(",", "."));
    const qtd = parseInt(quantidade) || 1;

    if (!nome.trim() || isNaN(pot) || isNaN(fp)) {
      const msg = "Preencha corretamente o nome, a potência e o FP.";
      Platform.OS === "web" ? window.alert(msg) : alert(msg);
      return;
    }

    // Como os motores agrupam em "Serviços Gerais", mandamos a quantidade já embutida na carga se o usuário preencheu mais de 1
    for (let i = 0; i < qtd; i++) {
      onSalvar({
        nome: qtd > 1 ? `${nome} (Unidade ${i + 1})` : nome,
        potencia: pot,
        unidadeMedida,
        fatorPotencia: fp,
      });
    }

    setNome("");
    setPotencia("");
    setQuantidade("1");
    setSugestaoSelecionada(SUGESTOES_MOTORES[0].label);
  };

  return (
    <View style={styles.container}>
      {/* 💡 PICKER DE SUGESTÕES */}
      <Text style={styles.label}>Sugestões de Áreas Comuns</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sugestaoSelecionada}
          onValueChange={handleSelecaoSugestao}
          style={styles.picker}
        >
          {SUGESTOES_MOTORES.map((c, i) => (
            <Picker.Item key={i} label={c.label} value={c.label} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Nome do Equipamento (Editável)</Text>
      <TextInput
        style={styles.inputNome}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Elevador Social"
      />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Potência</Text>
          <TextInput
            style={styles.input}
            value={potencia}
            onChangeText={setPotencia}
            keyboardType="numeric"
            placeholder="Ex: 7.5"
          />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Unidade</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={unidadeMedida}
              onValueChange={(itemValue) => setUnidadeMedida(itemValue as any)}
              style={styles.pickerSmall}
            >
              <Picker.Item label="CV" value="CV" />
              <Picker.Item label="HP" value="HP" />
              <Picker.Item label="W" value="W" />
              <Picker.Item label="kW" value="kW" />
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Qtd. (Destes)</Text>
          <TextInput
            style={styles.input}
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Fator Pot. (FP)</Text>
          <TextInput
            style={styles.input}
            value={fatorPotencia}
            onChangeText={setFatorPotencia}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
        <Text style={styles.btnSalvarText}>Adicionar à Área Comum</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 5 },
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
  inputNome: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f9fafb",
    fontSize: 14,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: "#fefce8",
    borderWidth: 1,
    borderColor: "#fde047",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
  },
  picker: { height: 45, color: "#1f2937", backgroundColor: "transparent" },
  pickerSmall: { height: 42, color: "#1f2937", backgroundColor: "transparent" },
  btnSalvar: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  btnSalvarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
