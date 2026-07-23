// src/app/(telas)/quadro.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomHeader from "../../components/ui/CustomHeader";
import { useData } from "../../context/DataContext";
import {
  calcularDemandaGlobal,
  calcularDemandaPrumada,
  calcularPotenciaInstaladaTotal,
} from "../../utils/calculations";

// Constantes locais para conversão visual rápida nas Áreas Comuns
const CV_PARA_W = 736;
const HP_PARA_W = 746;

export default function ScreenQuadro() {
  const { nomeProjeto, numeroAndares, setores, prumadas } = useData();

  // Potência Total Bruta (Sem demanda)
  const potenciaTotal = calcularPotenciaInstaladaTotal(setores);
  const potenciaTotalKw = (potenciaTotal / 1000).toFixed(2);

  // Demanda Global do Prédio (Com Fator de Agrupamento Aplicado)
  const demandaGlobal = calcularDemandaGlobal(prumadas, setores);
  const demandaGlobalKw = (demandaGlobal / 1000).toFixed(2);

  // Filtra as Áreas Comuns (Motores, Bombas, etc)
  const areasComuns = setores.filter((s) => s.tipoSetor === "AreaComum");

  return (
    <View style={styles.container}>
      <CustomHeader title="Relatório QGBT" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO DO PROJETO */}
        <View style={styles.cardResumo}>
          <Text style={styles.tituloProjeto}>
            {nomeProjeto || "Projeto Sem Nome"}
          </Text>
          <Text style={styles.subtituloProjeto}>
            {numeroAndares
              ? `${numeroAndares} Andares/Pavimentos`
              : "Andares não definidos"}
          </Text>

          <View style={styles.divisor} />

          {/* DADO SECUNDÁRIO: POTÊNCIA BRUTA */}
          <Text style={styles.labelSecundario}>
            Potência Instalada (Bruta):
          </Text>
          <Text style={styles.valorBruto}>{potenciaTotalKw} kW</Text>
          <Text style={styles.infoAviso}>
            *Soma bruta de cargas. Não utilizar para dimensionamento.
          </Text>

          <View style={styles.divisorPequeno} />

          {/* DADO PRINCIPAL: DEMANDA GLOBAL (QGBT) */}
          <Text style={styles.labelResultado}>
            Demanda Total do QGBT (Real):
          </Text>
          <Text style={styles.valorResultado}>{demandaGlobalKw} kW</Text>
          <Text style={styles.infoExtra}>
            *Pronta para dimensionamento do Disjuntor Geral (Cargas + Prumadas).
          </Text>
        </View>

        {/* DETALHAMENTO DE PRUMADAS */}
        <Text style={styles.sectionTitle}>Distribuição por Prumadas</Text>
        {prumadas.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhuma prumada configurada.</Text>
        ) : (
          prumadas.map((prumada) => {
            const demandaPrumadaKw = (
              calcularDemandaPrumada(prumada, setores) / 1000
            ).toFixed(2);

            return (
              <View key={prumada.id} style={styles.cardItem}>
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
                  Demanda Real (NBR 5410): {demandaPrumadaKw} kW
                </Text>
              </View>
            );
          })
        )}

        {/* DETALHAMENTO DE ÁREAS COMUNS (MOTORES/GERAL) */}
        <Text style={styles.sectionTitle}>Serviços Gerais / Áreas Comuns</Text>
        {areasComuns.length === 0 ? (
          <Text style={styles.textoVazio}>
            Nenhum equipamento comum cadastrado.
          </Text>
        ) : (
          areasComuns.map((area) => {
            // Calcula a potência deste item comum em kW para o painel
            let potW = 0;
            area.cargas.forEach((c) => {
              let p = c.potencia;
              if (c.unidadeMedida === "CV") p *= CV_PARA_W;
              if (c.unidadeMedida === "HP") p *= HP_PARA_W;
              potW += p * c.quantidade;
            });
            const potKw = ((potW * area.quantidade) / 1000).toFixed(2);

            return (
              <View
                key={area.id}
                style={[styles.cardItem, { borderLeftColor: "#10b981" }]}
              >
                <View style={styles.cardHeader}>
                  <FontAwesome5 name="cogs" size={16} color="#10b981" />
                  <Text style={styles.itemNome}>
                    {area.quantidade}x {area.nome}
                  </Text>
                </View>
                <Text style={styles.itemPotenciaSecundaria}>
                  Potência: {potKw} kW
                </Text>
              </View>
            );
          })
        )}

        {/* ESPAÇO PARA O BOTÃO DO PDF (FUTURO) */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: {
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 100,
  },
  cardResumo: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: {
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  tituloProjeto: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  subtituloProjeto: { fontSize: 16, color: "#6b7280", marginTop: 4 },
  divisor: {
    height: 1,
    backgroundColor: "#e5e7eb",
    width: "100%",
    marginVertical: 20,
  },
  divisorPequeno: {
    height: 1,
    backgroundColor: "#f3f4f6",
    width: "100%",
    marginVertical: 10,
  },
  labelSecundario: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  valorBruto: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9ca3af",
    marginTop: 4,
  },
  infoAviso: {
    fontSize: 12,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
    marginBottom: 10,
  },
  labelResultado: { fontSize: 16, color: "#059669", fontWeight: "bold" },
  valorResultado: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 8,
  },
  infoExtra: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    marginTop: 10,
  },
  textoVazio: { color: "#6b7280", fontStyle: "italic", marginBottom: 20 },
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
  itemDetalhe: { fontSize: 14, color: "#4b5563", marginTop: 4 },
  itemPotencia: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#8b5cf6",
    marginTop: 10,
    textAlign: "right",
  },
  itemPotenciaSecundaria: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 8,
    textAlign: "right",
  },
});
