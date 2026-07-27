// src/components/ui/CardPrumada.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Prumada } from "../../utils/templates";

interface CardPrumadaProps {
  prumada: Prumada;
  demandaKw: string;
}

export function CardPrumada({ prumada, demandaKw }: CardPrumadaProps) {
  return (
    <View style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <FontAwesome5 name="building" size={18} color="#8b5cf6" />
        <Text style={styles.itemNome}>{prumada.nome}</Text>
      </View>
      <View style={styles.divisorPequeno} />
      {prumada.unidades.map((u, index) => (
        <Text key={index} style={styles.itemDetalhe}>
          • {u.quantidade}x {u.nomeSetor}
        </Text>
      ))}
      <Text style={styles.itemPotencia}>
        Demanda Real (NBR 5410): {demandaKw} kW
      </Text>
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
    borderLeftColor: "#8b5cf6",
    ...Platform.select({
      web: { boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" },
      default: { elevation: 2 },
    }),
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemNome: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  divisorPequeno: {
    height: 1,
    backgroundColor: "#f3f4f6",
    width: "100%",
    marginVertical: 10,
  },
  itemDetalhe: { fontSize: 14, color: "#4b5563", marginTop: 4 },
  itemPotencia: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#8b5cf6",
    marginTop: 10,
    textAlign: "right",
  },
});
