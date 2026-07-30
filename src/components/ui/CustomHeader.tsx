import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";

export default function CustomHeader({ title }: { title: string }) {
  const { tensao, limpaDados } = useData();
  const router = useRouter();

  const handleSair = () => {
    const msg = "Deseja fechar o projeto atual e voltar ao Início?";
    if (Platform.OS === "web") {
      if (window.confirm(msg)) {
        limpaDados();
        router.replace("/");
      }
    } else {
      Alert.alert("Fechar Projeto", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            limpaDados();
            router.replace("/");
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Text style={{ fontSize: 24, marginRight: 8 }}>👷‍♂️</Text>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          {title}
        </Text>
      </View>

      <View style={styles.right}>
        {/* 💡 CORREÇÃO AQUI: Usando o ternário para evitar vazamento de string vazia */}
        {tensao ? (
          <View style={styles.badge}>
            <FontAwesome5 name="bolt" size={12} color="#d97706" />
            <Text style={styles.badgeText}>{tensao}</Text>
          </View>
        ) : null}
        <Text style={styles.version}>v1.0.0</Text>
        <TouchableOpacity onPress={handleSair} style={styles.btnSair}>
          <Text style={styles.txtSair}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    flexShrink: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginRight: 8,
    gap: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "bold", color: "#d97706" },
  version: { fontSize: 12, color: "#6b7280", marginRight: 12 },
  btnSair: { padding: 4 },
  txtSair: { fontSize: 20, fontWeight: "bold", color: "#1e3a8a" },
});
