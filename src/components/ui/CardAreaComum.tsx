// src/components/ui/CardAreaComum.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Setor } from "../../utils/templates";

interface CardAreaComumProps {
  area: Setor;
  potKw: string;
}

export function CardAreaComum({ area, potKw }: CardAreaComumProps) {
  return (
    <View style={[styles.cardItem, { borderLeftColor: "#10b981" }]}>
      <View style={styles.cardHeader}>
        <FontAwesome5 name="cogs" size={16} color="#10b981" />
        <Text style={styles.itemNome}>
          {area.quantidade}x {area.nome}
        </Text>
      </View>
      <Text style={styles.itemPotenciaSecundaria}>Potência: {potKw} kW</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      web: { boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" },
      default: { elevation: 2 },
    }),
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemNome: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  itemPotenciaSecundaria: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 8,
    textAlign: "right",
  },
});
