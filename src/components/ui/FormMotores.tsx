// src/components/ui/FormTue.tsx
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

interface FormMotoresProps {
  onSalvar: (carga: Omit<Carga, "id" | "tipo">) => void;
}

export default function FormMotores({ onSalvar }: FormMotoresProps) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [potencia, setPotencia] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState<"W" | "CV" | "HP" | "VA">(
    "CV",
  );
  const [fases, setFases] = useState("3"); // Em prédios, a maioria dos motores pesados é trifásica
  const [fatorPotencia, setFatorPotencia] = useState("0.85");
  const [rendimento, setRendimento] = useState("0.90");

  const handleSalvar = () => {
    if (!nome || !potencia) {
      const msg = "Preencha o nome e a potência do equipamento.";
      Platform.OS === "web" ? window.alert(msg) : alert(msg);
      return;
    }

    onSalvar({
      nome,
      quantidade: parseInt(quantidade) || 1,
      potencia: parseFloat(potencia.replace(",", ".")),
      unidadeMedida,
      fases: parseInt(fases) || 3,
      fatorPotencia: parseFloat(fatorPotencia.replace(",", ".")) || 0.85,
      rendimento: parseFloat(rendimento.replace(",", ".")) || 0.9,
    });

    // Limpa o formulário após adicionar
    setNome("");
    setPotencia("");
    setQuantidade("1");
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Cadastrar Motor / Equipamento Especial</Text>

      <Text style={styles.label}>Nome (Ex: Bomba de Recalque 1)</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do equipamento"
        placeholderTextColor="#9ca3af"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Potência</Text>
          <TextInput
            style={styles.input}
            value={potencia}
            onChangeText={setPotencia}
            keyboardType="numeric"
            placeholder="Ex: 5"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Unidade</Text>
          {/* Você pode substituir este campo pelo seu SeletorBotoes.tsx depois */}
          <TextInput
            style={styles.input}
            value={unidadeMedida}
            onChangeText={(t) => setUnidadeMedida(t as any)}
            placeholder="CV, HP, W, VA"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>F. Potência (cos φ)</Text>
          <TextInput
            style={styles.input}
            value={fatorPotencia}
            onChangeText={setFatorPotencia}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Rendimento (η)</Text>
          <TextInput
            style={styles.input}
            value={rendimento}
            onChangeText={setRendimento}
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.botaoSalvar}
        onPress={handleSalvar}
        activeOpacity={0.8}
      >
        <Text style={styles.textoBotaoSalvar}>Adicionar Carga</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      },
      default: {
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
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
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
    color: "#1f2937",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12, // Espaçamento entre colunas
  },
  col: {
    flex: 1,
  },
  botaoSalvar: {
    backgroundColor: "#10b981", // Verde para diferenciar da cor principal
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotaoSalvar: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
