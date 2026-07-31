import { FontAwesome5 } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  BackHandler,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";

export default function CustomHeader({ title }: { title: string }) {
  const { tensao, novoProjeto } = useData();
  const router = useRouter();

  const [modalVisivel, setModalVisivel] = useState(false);

  const handleSair = () => {
    setModalVisivel(true);
  };

  const handleNovoProjeto = () => {
    setModalVisivel(false);
    novoProjeto();
    router.replace("/");
  };

  const handleEncerrarApp = () => {
    setModalVisivel(false);
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    } else if (Platform.OS === "web") {
      window.close();
    }
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.left}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>👷‍♂️</Text>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </Text>
        </View>

        <View style={styles.right}>
          {tensao ? (
            <View style={styles.badge}>
              <FontAwesome5 name="bolt" size={12} color="#d97706" />
              <Text style={styles.badgeText}>{tensao}</Text>
            </View>
          ) : null}
          <Text style={styles.version}>v{Constants.expoConfig?.version}</Text>
          <TouchableOpacity onPress={handleSair} style={styles.btnSair}>
            <Text style={styles.txtSair}>X</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Atenção</Text>
            <Text style={styles.modalText}>
              Deseja realmente iniciar um Novo Projeto? Todos os dados atuais
              serão perdidos. Ou deseja encerrar o aplicativo?
            </Text>

            <TouchableOpacity
              style={styles.btnNovoProjeto}
              onPress={handleNovoProjeto}
              activeOpacity={0.8}
            >
              <Text style={styles.btnNovoProjetoText}>
                Iniciar Novo Projeto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnEncerrar}
              onPress={handleEncerrarApp}
              activeOpacity={0.8}
            >
              <Text style={styles.btnEncerrarText}>Encerrar Aplicativo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={() => setModalVisivel(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#1e3a8a", flexShrink: 1 },
  right: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    ...Platform.select({
      web: { boxShadow: "0px 10px 15px rgba(0,0,0,0.1)" },
      default: { elevation: 10 },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  btnNovoProjeto: {
    backgroundColor: "#2563eb",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  btnNovoProjetoText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  btnEncerrar: {
    backgroundColor: "#ef4444",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  btnEncerrarText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  btnCancelar: {
    backgroundColor: "#f3f4f6",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btnCancelarText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "bold",
  },
});
