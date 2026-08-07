// src/app/_layout.tsx
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 💡 IMPORTADO O STORAGE
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  LogBox,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ModalTermoResponsabilidade from "../components/ui/ModalTermoResponsabilidade"; // 💡 IMPORTADO O MODAL
import { DataProvider, useData } from "../context/DataContext";
import { checarAtualizacao } from "../utils/UpdateHelper";

LogBox.ignoreLogs(["The Flipper native module is not available"]);

function BarraInferiorFixa() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const { nomeProjeto, numeroAndares, tensao } = useData();

  const projetoIncompleto =
    !nomeProjeto.trim() || !numeroAndares.trim() || !tensao;

  const bottomOffset =
    Platform.OS === "android" ? Math.max(insets.bottom + 16, 24) : 24;

  const tabs = [
    { key: "/", title: "Início", icon: "home", pack: "fontawesome" },
    { key: "/cargas", title: "Cargas", icon: "elevator", pack: "material" },
    {
      key: "/prumadas",
      title: "Prumadas",
      icon: "building",
      pack: "fontawesome",
    },
    { key: "/quadro", title: "QGBT", icon: "bolt", pack: "fontawesome" },
  ];

  return (
    <View style={[styles.tabBarWrapper, { bottom: bottomOffset }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.key;
          const isDisabled = projetoIncompleto && tab.key !== "/";

          const activeColor = "#2563eb";
          const inactiveColor = "#6b7280";
          const disabledColor = "#d1d5db";

          const color = isActive
            ? activeColor
            : isDisabled
              ? disabledColor
              : inactiveColor;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isDisabled && { opacity: 0.5 }]}
              onPress={() => {
                if (isDisabled) {
                  const msg =
                    "Preencha o Nome, Andares e Tensão na aba Início antes de avançar.";
                  Platform.OS === "web"
                    ? window.alert(msg)
                    : Alert.alert("Acesso Bloqueado", msg);
                  return;
                }
                router.replace(tab.key as any);
              }}
              activeOpacity={0.7}
            >
              {tab.pack === "fontawesome" ? (
                <FontAwesome5 name={tab.icon as any} size={22} color={color} />
              ) : (
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={26}
                  color={color}
                />
              )}
              <Text style={[styles.tabLabel, { color }]}>{tab.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function LayoutRaiz() {
  return (
    <DataProvider>
      <View style={styles.wrapperWeb}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <BarraInferiorFixa />
      </View>
    </DataProvider>
  );
}

export default function RootLayout() {
  const [exibirTermo, setExibirTermo] = useState(false);

  useEffect(() => {
    checarAtualizacao();
    verificarAceiteTermo();
  }, []);

  // 💡 LÓGICA DE CHECAGEM DO TERMO
  const verificarAceiteTermo = async () => {
    try {
      const aceitou = await AsyncStorage.getItem(
        "@eletrica_predial:termo_aceito",
      );
      if (aceitou !== "true") {
        setExibirTermo(true);
      }
    } catch (error) {
      console.log("Erro ao verificar termo de responsabilidade:", error);
    }
  };

  // 💡 LÓGICA AO CLICAR EM CONCORDAR
  const handleAceitarTermo = async () => {
    try {
      await AsyncStorage.setItem("@eletrica_predial:termo_aceito", "true");
      setExibirTermo(false);
    } catch (error) {
      console.log("Erro ao salvar aceite do termo:", error);
    }
  };

  return (
    <SafeAreaProvider>
      <LayoutRaiz />
      {/* 💡 MODAL DE SEGURANÇA EXIBIDO APENAS NA PRIMEIRA VEZ */}
      <ModalTermoResponsabilidade
        visivel={exibirTermo}
        onAceitar={handleAceitarTermo}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    ...Platform.select({
      web: {
        maxWidth: 450,
        width: "100%",
        alignSelf: "center",
        height: "100vh",
      },
      default: { width: "100%" },
    }),
  },
  tabBarWrapper: {
    maxWidth: 450,
    width: "92%",
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
    justifyContent: "center",
    position: "absolute",
    left: "4%",
    right: "4%",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabLabel: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
});
