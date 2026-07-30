// src/app/(telas)/quadro.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react"; // 💡 IMPORTANTE: Adicionamos o estado para o Raio-X
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CardAreaComum } from "../../components/ui/CardAreaComum";
import { CardPrumada } from "../../components/ui/CardPrumada";
import CustomHeader from "../../components/ui/CustomHeader";
import { useData } from "../../context/DataContext";
import {
  calcularDemandaGlobal,
  calcularDemandaPrumada,
  calcularDimensionamentoQGBT,
  calcularPotenciaInstaladaTotal,
  converterParaWatts,
} from "../../utils/calculations";
import { gerarHTMLRelatorio } from "../../utils/pdfTemplate";

export default function ScreenQuadro() {
  const { nomeProjeto, numeroAndares, tensao, setores, prumadas } = useData();
  const router = useRouter();

  // 💡 ESTADO DO RAIO-X PARA AS PRUMADAS E ÁREAS COMUNS
  const [cardsExpandidos, setCardsExpandidos] = useState<
    Record<string, boolean>
  >({});
  const toggleExpandir = (id: string) => {
    setCardsExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalApartamentosCadastrados = setores
    .filter((s) => s.tipoSetor === "Apartamento")
    .reduce((acc, s) => acc + s.quantidade, 0);

  const totalApartamentosDistribuidos = prumadas.reduce((acc, p) => {
    return acc + p.unidades.reduce((sum, u) => sum + u.quantidade, 0);
  }, 0);

  const bloqueioAtivo =
    totalApartamentosCadastrados > 0 &&
    totalApartamentosCadastrados !== totalApartamentosDistribuidos;

  const potenciaTotal = calcularPotenciaInstaladaTotal(setores);
  const potenciaTotalKw = (potenciaTotal / 1000).toFixed(2);
  const demandaGlobal = calcularDemandaGlobal(prumadas, setores);
  const demandaGlobalKw = (demandaGlobal / 1000).toFixed(2);
  const areasComuns = setores.filter((s) => s.tipoSetor === "AreaComum");
  const dimensionamento = calcularDimensionamentoQGBT(demandaGlobal, tensao);

  const gerarECompartilharPDF = async () => {
    try {
      const dataAtual = new Date().toLocaleDateString("pt-BR");
      const htmlContent = gerarHTMLRelatorio({
        nomeProjeto,
        numeroAndares,
        tensao,
        potenciaTotalKw,
        demandaGlobalKw,
        dimensionamento,
        prumadas,
        areasComuns,
        setores,
        dataAtual,
      });

      if (Platform.OS === "web") {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 250);
        } else {
          alert(
            "O navegador bloqueou a nova aba. Por favor, permita os pop-ups para gerar o PDF.",
          );
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: "Compartilhar Relatório Elétrico",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Não foi possível gerar o arquivo PDF.");
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Relatório QGBT" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {bloqueioAtivo && (
          <View style={styles.alertaBloqueio}>
            <FontAwesome5
              name="exclamation-triangle"
              size={28}
              color="#dc2626"
            />
            <Text style={styles.tituloBloqueio}>Distribuição Incompleta!</Text>
            <Text style={styles.textoBloqueio}>
              Você cadastrou {totalApartamentosCadastrados} apartamentos, mas
              apenas {totalApartamentosDistribuidos} foram alocados nas
              prumadas. O relatório oficial não pode ser gerado com falhas no
              balanço de cargas.
            </Text>
            <TouchableOpacity
              style={styles.botaoVoltarPrumadas}
              onPress={() => router.replace("/prumadas")}
              activeOpacity={0.8}
            >
              <Text style={styles.textoBotaoVoltar}>
                Voltar e Corrigir Prumadas
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.cardResumo, bloqueioAtivo && { opacity: 0.5 }]}>
          <Text style={styles.tituloProjeto}>
            {nomeProjeto || "Projeto Sem Nome"}
          </Text>
          <Text style={styles.subtituloProjeto}>
            {numeroAndares
              ? `${numeroAndares} Andares/Pavimentos`
              : "Andares não definidos"}
          </Text>
          <View style={styles.divisor} />

          <Text style={styles.labelSecundario}>
            Potência Instalada (Bruta):
          </Text>
          <Text style={styles.valorBruto}>{potenciaTotalKw} kW</Text>
          <Text style={styles.infoAviso}>
            *Soma bruta de cargas. Não utilizar para dimensionamento.
          </Text>

          <View style={styles.divisorPequeno} />

          <Text style={styles.labelResultado}>
            Demanda Total do QGBT (Real):
          </Text>
          <Text style={styles.valorResultado}>{demandaGlobalKw} kW</Text>
          <Text style={styles.infoExtra}>
            *Base para cálculo de corrente da edificação.
          </Text>

          <View style={styles.boxProtecao}>
            <Text style={styles.tituloBoxProtecao}>
              DIMENSIONAMENTO GERAL ({tensao ? `${tensao}V` : "Sem Tensão"})
            </Text>
            <View style={styles.linhaProtecao}>
              <Text style={styles.labelProtecao}>Corrente Calculada:</Text>
              <Text style={styles.valorProtecao}>
                {dimensionamento.corrente} A
              </Text>
            </View>
            <View style={styles.linhaProtecao}>
              <Text style={styles.labelProtecao}>Disjuntor Geral:</Text>
              <Text style={styles.valorProtecaoDestaque}>
                {dimensionamento.disjuntor} A
              </Text>
            </View>
            <View style={styles.linhaProtecao}>
              <Text style={styles.labelProtecao}>Cabo Principal:</Text>
              <Text style={styles.valorProtecaoDestaque}>
                {dimensionamento.cabo}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Distribuição por Prumadas</Text>
        {prumadas.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhuma prumada configurada.</Text>
        ) : (
          prumadas.map((prumada) => {
            const demandaPrumadaKw = (
              calcularDemandaPrumada(prumada, setores) / 1000
            ).toFixed(2);
            return (
              <View key={prumada.id} style={{ marginBottom: 16 }}>
                <CardPrumada prumada={prumada} demandaKw={demandaPrumadaKw} />

                {/* 💡 BOTÃO DO RAIO-X NA PRUMADA */}
                <TouchableOpacity
                  onPress={() => toggleExpandir(prumada.id)}
                  style={styles.btnExpandir}
                >
                  <FontAwesome5
                    name={
                      cardsExpandidos[prumada.id]
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={12}
                    color="#2563eb"
                  />
                  <Text style={styles.textoExpandir}>
                    {cardsExpandidos[prumada.id]
                      ? "Ocultar detalhamento da prumada"
                      : "Ver cargas da prumada"}
                  </Text>
                </TouchableOpacity>

                {/* 💡 ÁREA EXPANDIDA DA PRUMADA */}
                {cardsExpandidos[prumada.id] && (
                  <View style={styles.areaExpandida}>
                    {prumada.unidades.map((u, index) => {
                      const setor = setores.find((s) => s.id === u.setorId);
                      if (!setor) return null;
                      return (
                        <View key={index} style={styles.grupoSetor}>
                          <Text style={styles.tituloSetorPrumada}>
                            {u.quantidade}x {setor.nome}
                          </Text>
                          {setor.cargas.map((c, i) => (
                            <View key={i} style={styles.linhaCarga}>
                              <Text style={styles.nomeCarga}>⚡ {c.nome}</Text>
                              <Text style={styles.potenciaCarga}>
                                {c.potencia} {c.unidadeMedida}
                              </Text>
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}

        <Text style={styles.sectionTitle}>Serviços Gerais / Áreas Comuns</Text>
        {areasComuns.length === 0 ? (
          <Text style={styles.textoVazio}>
            Nenhum equipamento comum cadastrado.
          </Text>
        ) : (
          areasComuns.map((area) => {
            let potW = 0;
            area.cargas.forEach((c) => {
              let p = converterParaWatts(c.potencia, c.unidadeMedida);
              potW += p * c.quantidade;
            });
            const potKw = ((potW * area.quantidade) / 1000).toFixed(2);
            return (
              <View key={area.id} style={{ marginBottom: 16 }}>
                <CardAreaComum area={area} potKw={potKw} />

                {/* 💡 BOTÃO DO RAIO-X NAS ÁREAS COMUNS */}
                <TouchableOpacity
                  onPress={() => toggleExpandir(area.id)}
                  style={styles.btnExpandir}
                >
                  <FontAwesome5
                    name={
                      cardsExpandidos[area.id] ? "chevron-up" : "chevron-down"
                    }
                    size={12}
                    color="#2563eb"
                  />
                  <Text style={styles.textoExpandir}>
                    {cardsExpandidos[area.id]
                      ? "Ocultar detalhamento de serviços"
                      : "Ver cargas de serviços"}
                  </Text>
                </TouchableOpacity>

                {/* 💡 ÁREA EXPANDIDA DAS ÁREAS COMUNS */}
                {cardsExpandidos[area.id] && (
                  <View style={styles.areaExpandida}>
                    <Text style={styles.tituloSetorPrumada}>
                      Itens na Área Comum:
                    </Text>
                    {area.cargas.map((c, i) => (
                      <View key={i} style={styles.linhaCarga}>
                        <Text style={styles.nomeCarga}>⚡ {c.nome}</Text>
                        <Text style={styles.potenciaCarga}>
                          {c.potencia} {c.unidadeMedida}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

        {!bloqueioAtivo ? (
          <TouchableOpacity
            style={styles.botaoPdf}
            onPress={gerarECompartilharPDF}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="file-pdf" size={20} color="#ffffff" />
            <Text style={styles.textoBotaoPdf}>Gerar Relatório em PDF</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ height: 40 }} />
        )}
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
  alertaBloqueio: {
    backgroundColor: "#fef2f2",
    borderWidth: 2,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: "0px 4px 6px rgba(220, 38, 38, 0.15)" },
      default: { elevation: 5 },
    }),
  },
  tituloBloqueio: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#991b1b",
    marginTop: 12,
    marginBottom: 8,
  },
  textoBloqueio: {
    fontSize: 14,
    color: "#b91c1c",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  botaoVoltarPrumadas: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  textoBotaoVoltar: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
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
  boxProtecao: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginTop: 20,
  },
  tituloBoxProtecao: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 12,
  },
  linhaProtecao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#dbeafe",
  },
  labelProtecao: { fontSize: 14, color: "#3b82f6", fontWeight: "600" },
  valorProtecao: { fontSize: 15, color: "#1e3a8a", fontWeight: "bold" },
  valorProtecaoDestaque: { fontSize: 16, color: "#dc2626", fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    marginTop: 10,
  },
  textoVazio: { color: "#6b7280", fontStyle: "italic", marginBottom: 20 },
  botaoPdf: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  textoBotaoPdf: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },

  // 💡 ESTILOS NOVOS DO RAIO-X
  btnExpandir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: "#eff6ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  textoExpandir: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  areaExpandida: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 8,
  },
  grupoSetor: { marginBottom: 12 },
  tituloSetorPrumada: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  linhaCarga: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingLeft: 8,
  },
  nomeCarga: { fontSize: 13, color: "#4b5563", flex: 1 },
  potenciaCarga: { fontSize: 13, fontWeight: "bold", color: "#1f2937" },
});
