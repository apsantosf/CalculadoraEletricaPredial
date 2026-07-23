// src/components/ui/FormPrevisaoCarga.tsx
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

interface FormPrevisaoCargaProps {
  onSalvar: (setor: Setor) => void;
}

export default function FormPrevisaoCarga({
  onSalvar,
}: FormPrevisaoCargaProps) {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [cargaTotal, setCargaTotal] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState<"W" | "VA" | "kW">("W");
  const [fases, setFases] = useState("2"); // Maioria dos aptos padrão são bifásicos (2) ou trifásicos (3)

  const handleSalvar = () => {
    if (!nome || !cargaTotal) {
      const msg = "Preencha o nome do tipo de apartamento e a carga total.";
      Platform.OS === "web" ? window.alert(msg) : alert(msg);
      return;
    }

    const qtd = parseInt(quantidade) || 1;
    let potenciaFinal = parseFloat(cargaTotal.replace(",", "."));

    // Se o engenheiro digitar em kW, convertemos para W para manter o padrão no banco de dados
    if (unidadeMedida === "kW") {
      potenciaFinal = potenciaFinal * 1000;
    }

    // Criamos a Carga que representa o consumo total deste apartamento
    const cargaDoApartamento: Carga = {
      id: Math.random().toString(),
      nome: `Carga Total - ${nome}`,
      quantidade: 1, // É 1 por apartamento (a multiplicação total ocorre no Setor)
      potencia: potenciaFinal,
      unidadeMedida: unidadeMedida === "kW" ? "W" : unidadeMedida,
      tipo: "TUG", // Generalizamos como TUG/TUE mista para o cálculo macro
      fases: parseInt(fases) || 2,
      fatorPotencia: 0.92, // Fator de potência médio padrão para residências
      rendimento: 1,
    };

    // Criamos o Setor (que representa o grupo de apartamentos)
    const novoSetor: Setor = {
      id: Math.random().toString(),
      nome,
      tipoSetor: "Apartamento",
      quantidade: qtd,
      cargas: [cargaDoApartamento],
    };

    onSalvar(novoSetor);

    // Limpa o formulário
    setNome("");
    setQuantidade("1");
    setCargaTotal("");
    setFases("2");
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Cadastrar Unidade (Apartamentos)</Text>

      <Text style={styles.label}>
        Nome do Tipo (Ex: Apto Padrão, Cobertura)
      </Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Apartamento Final 1 e 2"
        placeholderTextColor="#9ca3af"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Qtd. no Prédio</Text>
          <TextInput
            style={styles.input}
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
            placeholder="Ex: 36"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Fases (Ramal)</Text>
          <TextInput
            style={styles.input}
            value={fases}
            onChangeText={setFases}
            keyboardType="numeric"
            placeholder="1, 2 ou 3"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Carga Total p/ Unidade</Text>
          <TextInput
            style={styles.input}
            value={cargaTotal}
            onChangeText={setCargaTotal}
            keyboardType="numeric"
            placeholder="Ex: 15000"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Unidade</Text>
          <TextInput
            style={styles.input}
            value={unidadeMedida}
            onChangeText={(t) => setUnidadeMedida(t as any)}
            placeholder="W, VA ou kW"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.botaoSalvar}
        onPress={handleSalvar}
        activeOpacity={0.8}
      >
        <Text style={styles.textoBotaoSalvar}>Adicionar Unidades</Text>
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
    gap: 12,
  },
  col: {
    flex: 1,
  },
  botaoSalvar: {
    backgroundColor: "#2563eb", // Azul para manter o padrão das unidades
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
