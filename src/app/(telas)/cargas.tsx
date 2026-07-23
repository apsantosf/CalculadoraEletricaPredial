//   src/app/(telas)/cargas.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../../components/ui/CustomHeader";
import FormMotores from "../../components/ui/FormMotores";
import FormPrevisaoCarga from "../../components/ui/FormPrevisaoCarga";
import { useData } from "../../context/DataContext";
import { Carga, Setor } from "../../utils/templates";

export default function ScreenCargas() {
  // Agora usamos o setoresDispatch para garantir o salvamento no SQLite
  const { setores, setoresDispatch } = useData();
  const [abaAtiva, setAbaAtiva] = useState<"unidades" | "comum">("unidades");

  // Handler para salvar os Apartamentos
  const handleSalvarUnidade = (novoSetor: Setor) => {
    setoresDispatch([...setores, novoSetor]);
    const msg = `${novoSetor.quantidade}x ${novoSetor.nome} adicionado(s) com sucesso!`;
    Platform.OS === "web" ? window.alert(msg) : alert(msg);
  };

  // Handler para salvar Motores/Áreas Comuns
  const handleSalvarMotor = (carga: Omit<Carga, "id" | "tipo">) => {
    const novaCarga: Carga = {
      ...carga,
      id: Math.random().toString(),
      tipo: "Motor",
    };

    const novoSetorAreaComum: Setor = {
      id: Math.random().toString(),
      nome: carga.nome,
      tipoSetor: "AreaComum",
      quantidade: carga.quantidade,
      cargas: [novaCarga],
    };

    setoresDispatch([...setores, novoSetorAreaComum]);
    const msg = `${carga.nome} adicionado às Áreas Comuns!`;
    Platform.OS === "web" ? window.alert(msg) : alert(msg);
  };

  // Função para remover um setor e salvar a nova lista no SQLite
  const removerItem = (id: string) => {
    setoresDispatch(setores.filter((s) => s.id !== id));
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Gestão de Cargas" />

      {/* Seletor de Abas */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            abaAtiva === "unidades" && styles.tabActive,
          ]}
          onPress={() => setAbaAtiva("unidades")}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name="building"
            size={16}
            color={abaAtiva === "unidades" ? "#ffffff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              abaAtiva === "unidades" && styles.tabTextActive,
            ]}
          >
            Apartamentos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, abaAtiva === "comum" && styles.tabActive]}
          onPress={() => setAbaAtiva("comum")}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name="cogs"
            size={16}
            color={abaAtiva === "comum" ? "#ffffff" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              abaAtiva === "comum" && styles.tabTextActive,
            ]}
          >
            Áreas Comuns
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {abaAtiva === "unidades" ? (
          <FormPrevisaoCarga onSalvar={handleSalvarUnidade} />
        ) : (
          <FormMotores onSalvar={handleSalvarMotor} />
        )}

        <View style={styles.listaContainer}>
          <Text style={styles.tituloLista}>Cargas no Projeto</Text>

          {setores.length === 0 ? (
            <Text style={styles.textoVazio}>
              Nenhuma carga adicionada ainda.
            </Text>
          ) : (
            setores.map((setor) => (
              <View key={setor.id} style={styles.cardItem}>
                <View style={styles.cardInfo}>
                  <Text style={styles.itemNome}>
                    {setor.quantidade}x {setor.nome}
                  </Text>
                  <Text style={styles.itemDetalhe}>
                    Tipo:{" "}
                    {setor.tipoSetor === "Apartamento"
                      ? "Unidade"
                      : "Área Comum"}
                  </Text>
                  <Text style={styles.itemCarga}>
                    Carga Unitária:{" "}
                    {setor.cargas.reduce((acc, c) => acc + c.potencia, 0)}{" "}
                    {setor.cargas[0]?.unidadeMedida || "W"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botaoExcluir}
                  onPress={() => removerItem(setor.id)}
                >
                  <FontAwesome5 name="trash" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  tabActive: { backgroundColor: "#2563eb" },
  tabText: { color: "#6b7280", fontWeight: "bold", fontSize: 14 },
  tabTextActive: { color: "#ffffff" },
  content: {
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 100,
  },
  listaContainer: { marginTop: 10 },
  tituloLista: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  textoVazio: {
    textAlign: "center",
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 10,
  },
  cardItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    ...Platform.select({
      web: { boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" },
      default: { elevation: 2 },
    }),
  },
  cardInfo: { flex: 1 },
  itemNome: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  itemDetalhe: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  itemCarga: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 4,
  },
  botaoExcluir: { padding: 10 },
});
