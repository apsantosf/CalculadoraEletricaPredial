//   src/app/index.tsx
import { useRouter } from "expo-router";
import {
  Keyboard,
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
  // Agora estamos puxando os dados direto do nosso Contexto Global!
  const { nomeProjeto, setNomeProjeto, numeroAndares, setNumeroAndares } =
    useData();
  const router = useRouter();

  const handleSalvar = () => {
    Keyboard.dismiss();

    // Validação
    if (!nomeProjeto || !numeroAndares) {
      const msg =
        "Por favor, preencha o nome do projeto e o número de andares.";
      Platform.OS === "web" ? window.alert(msg) : alert(msg);
      return;
    }

    // Como já está no DataContext, não precisamos de lógica extra para salvar.
    // Apenas mostramos a mensagem e avançamos de tela.
    const msgSucesso = `Projeto "${nomeProjeto}" com ${numeroAndares} andares salvo com sucesso!`;
    Platform.OS === "web" ? window.alert(msgSucesso) : alert(msgSucesso);

    // Avança automaticamente para a aba de Cargas
    router.replace("/cargas");
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Configurações do Prédio" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Nome do Projeto</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Condomínio Bela Vista"
            placeholderTextColor="#9ca3af"
            value={nomeProjeto}
            onChangeText={setNomeProjeto}
          />

          <Text style={styles.labelSecao}>Número de Andares (Pavimentos)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 12"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            value={numeroAndares}
            onChangeText={setNumeroAndares}
          />

          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={handleSalvar}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBotaoSalvar}>Salvar e Avançar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 100,
    marginTop: 20,
  },
  cardConfig: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
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
  labelSecao: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 15,
    color: "#1f2937",
  },
  botaoSalvar: {
    backgroundColor: "#2563eb",
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
