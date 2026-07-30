// src/app/(telas)/cargas.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
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
import ModalDimensionamentoApto from "../../components/ui/ModalDimensionamentoApto";
import { useData } from "../../context/DataContext";
import { Carga, Setor } from "../../utils/templates";

export default function ScreenCargas() {
  const { setores, setoresDispatch, prumadas } = useData();

  const [modalPlantaVisivel, setModalPlantaVisivel] = useState(false);
  const [mostrarFormManual, setMostrarFormManual] = useState(false);
  const [abaManual, setAbaManual] = useState<"unidades" | "comum">("unidades");
  const [cardsExpandidos, setCardsExpandidos] = useState<
    Record<string, boolean>
  >({});

  const [setorEmEdicao, setSetorEmEdicao] = useState<string | null>(null);
  const [dadosParaEdicao, setDadosParaEdicao] = useState<any>(null);

  const toggleExpandir = (id: string) => {
    setCardsExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const apartamentos = setores.filter((s) => s.tipoSetor === "Apartamento");
  const isMetodologiaPlanta = apartamentos.some(
    (apto) =>
      apto.cargas.some(
        (c) =>
          c.nome.includes("Iluminação e TUGs") || c.nome.includes("Circuito"),
      ) || apto.dadosPlanta,
  );

  let metodologiaAtual: "nenhuma" | "planta" | "manual" = "nenhuma";
  if (apartamentos.length > 0) {
    metodologiaAtual = isMetodologiaPlanta ? "planta" : "manual";
  }

  const isPlanta = metodologiaAtual === "planta";

  const handleEditarPlanta = (setor: any) => {
    if (setor.dadosPlanta) {
      setSetorEmEdicao(setor.id);
      setDadosParaEdicao({
        nomeTipologia: setor.nome,
        quantidade: setor.quantidade,
        comodos: setor.dadosPlanta.comodos,
        tues: setor.dadosPlanta.tues,
      });
      setModalPlantaVisivel(true);
    }
  };

  const fecharModalPlanta = () => {
    setModalPlantaVisivel(false);
    setSetorEmEdicao(null);
    setDadosParaEdicao(null);
  };

  const handleSalvarUnidade = (novoSetor: Setor) => {
    setoresDispatch([...setores, novoSetor]);
    const msg = `${novoSetor.quantidade}x ${novoSetor.nome} adicionado(s) com sucesso!`;
    Platform.OS === "web" ? window.alert(msg) : alert(msg);
  };

  // 💡 NOVA LÓGICA: Joga todos os motores para um ÚNICO card de Áreas Comuns
  const handleSalvarMotor = (carga: Omit<Carga, "id" | "tipo">) => {
    const novaCarga: Carga = {
      ...carga,
      id: Math.random().toString(),
      tipo: "Motor",
    };

    const setorComum = setores.find((s) => s.tipoSetor === "AreaComum");

    if (setorComum) {
      // Já existe a caixinha de áreas comuns, bota o motor novo lá dentro
      const setoresAtualizados = setores.map((s) =>
        s.id === setorComum.id ? { ...s, cargas: [...s.cargas, novaCarga] } : s,
      );
      setoresDispatch(setoresAtualizados);
    } else {
      // Cria a caixinha de áreas comuns pela primeira vez
      const novoSetorAreaComum: Setor = {
        id: "setor-areas-comuns",
        nome: "Serviços Gerais (Áreas Comuns)",
        tipoSetor: "AreaComum",
        quantidade: 1,
        cargas: [novaCarga],
      };
      setoresDispatch([...setores, novoSetorAreaComum]);
    }

    const msg = `${carga.nome} adicionado às Áreas Comuns!`;
    Platform.OS === "web" ? window.alert(msg) : alert(msg);
  };

  const removerItem = (id: string) => {
    setoresDispatch(setores.filter((s) => s.id !== id));
  };

  const confirmarRemocao = (id: string, nome: string) => {
    const cargaEmUso = prumadas.some((prumada) =>
      prumada.unidades.some((u) => u.setorId === id),
    );
    if (cargaEmUso) {
      const msgErro = `Ação bloqueada! O item "${nome}" já está vinculado a uma prumada. Exclua a distribuição primeiro.`;
      Platform.OS === "web"
        ? window.alert(msgErro)
        : Alert.alert("Item em Uso", msgErro);
      return;
    }
    const msg = `Tem certeza que deseja remover o grupo inteiro "${nome}"?`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) removerItem(id);
    } else {
      Alert.alert("Confirmar Exclusão", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => removerItem(id),
        },
      ]);
    }
  };

  // 💡 NOVA LÓGICA: Apagar apenas um motorzinho ou TUE que está dentro do Raio-X
  const handleRemoverCargaInterna = (idSetor: string, idCarga: string) => {
    const msg = "Deseja remover este equipamento específico?";
    const acao = () => {
      const setoresAtualizados = setores
        .map((s) => {
          if (s.id === idSetor) {
            const novasCargas = s.cargas.filter((c) => c.id !== idCarga);
            return { ...s, cargas: novasCargas };
          }
          return s;
        })
        .filter((s) => s.cargas.length > 0); // Se esvaziar o grupo, apaga ele
      setoresDispatch(setoresAtualizados);
    };

    if (Platform.OS === "web") {
      if (window.confirm(msg)) acao();
    } else {
      Alert.alert("Remover Item", msg, [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: acao },
      ]);
    }
  };

  const setoresOrdenados = [...setores].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Gestão de Cargas" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {!mostrarFormManual && (
          <View style={styles.botoesAcaoContainer}>
            {(metodologiaAtual === "nenhuma" || isPlanta) && (
              <TouchableOpacity
                style={[styles.botaoAcao, styles.botaoPlanta]}
                onPress={() => setModalPlantaVisivel(true)}
                activeOpacity={0.8}
              >
                <FontAwesome5
                  name="ruler-combined"
                  size={20}
                  color="#ffffff"
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.textoBotaoAcao}>Dimensionar</Text>
                <Text style={styles.subtextoBotaoAcao}>
                  Por Planta (NBR 5410)
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.botaoAcao,
                isPlanta ? styles.botaoComum : styles.botaoManual,
              ]}
              onPress={() => {
                if (isPlanta) setAbaManual("comum");
                setMostrarFormManual(true);
              }}
              activeOpacity={0.8}
            >
              <FontAwesome5
                name={isPlanta ? "cogs" : "bolt"}
                size={20}
                color="#ffffff"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.textoBotaoAcao}>
                {isPlanta ? "Áreas Comuns" : "Cadastrar"}
              </Text>
              <Text style={styles.subtextoBotaoAcao}>
                {isPlanta
                  ? "Elevadores, Bombas, etc."
                  : "Manualmente (Memorial)"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!mostrarFormManual && metodologiaAtual !== "nenhuma" && (
          <Text style={styles.textoTrava}>
            {isPlanta
              ? "⚠️ Modo Normativo (Planta) ativo para as Unidades. O cadastro manual de apartamentos foi desativado."
              : "⚠️ Modo Manual ativo para as Unidades. A aba de Planta foi ocultada para evitar conflitos."}
          </Text>
        )}

        {mostrarFormManual && (
          <View style={styles.boxFormManual}>
            <View style={styles.headerFormManual}>
              <Text style={styles.tituloFormManual}>
                {isPlanta ? "Cadastro de Áreas Comuns" : "Cadastro Rápido"}
              </Text>
              <TouchableOpacity
                onPress={() => setMostrarFormManual(false)}
                style={{ padding: 4 }}
              >
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
              {!isPlanta && (
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    abaManual === "unidades" && styles.tabActive,
                  ]}
                  onPress={() => setAbaManual("unidades")}
                  activeOpacity={0.8}
                >
                  <FontAwesome5
                    name="building"
                    size={14}
                    color={abaManual === "unidades" ? "#ffffff" : "#6b7280"}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      abaManual === "unidades" && styles.tabTextActive,
                    ]}
                  >
                    Tipologia (Apto)
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  abaManual === "comum" && (styles.tabActive || isPlanta),
                ]}
                onPress={() => setAbaManual("comum")}
                activeOpacity={0.8}
              >
                <FontAwesome5
                  name="cogs"
                  size={14}
                  color={
                    abaManual === "comum" || isPlanta ? "#ffffff" : "#6b7280"
                  }
                />
                <Text
                  style={[
                    styles.tabText,
                    (abaManual === "comum" || isPlanta) && styles.tabTextActive,
                  ]}
                >
                  Áreas Comuns
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.areaFormulario}>
              {abaManual === "unidades" && !isPlanta ? (
                <FormPrevisaoCarga onSalvar={handleSalvarUnidade} />
              ) : (
                <FormMotores onSalvar={handleSalvarMotor} />
              )}
            </View>
          </View>
        )}

        <View style={styles.listaContainer}>
          <Text style={styles.tituloLista}>Tipologias e Cargas do Projeto</Text>

          {setoresOrdenados.length === 0 ? (
            <Text style={styles.textoVazio}>
              Nenhuma tipologia adicionada ainda.
            </Text>
          ) : (
            setoresOrdenados.map((setor: any) => {
              const cargasOrdenadas = [...setor.cargas].sort((a, b) =>
                a.nome.localeCompare(b.nome, "pt-BR"),
              );

              return (
                <View key={setor.id} style={styles.cardWrapper}>
                  <View
                    style={[
                      styles.cardItem,
                      setor.tipoSetor === "AreaComum" && {
                        borderLeftColor: "#f59e0b",
                      },
                    ]}
                  >
                    <View style={styles.cardInfo}>
                      <Text style={styles.itemNome}>
                        {setor.quantidade > 1 ? `${setor.quantidade}x ` : ""}
                        {setor.nome}
                      </Text>
                      <Text style={styles.itemDetalhe}>
                        Tipo:{" "}
                        {setor.tipoSetor === "Apartamento"
                          ? "Unidade Habitacional"
                          : "Área Comum"}
                      </Text>
                      <Text style={styles.itemCarga}>
                        Carga Unitária Total:{" "}
                        {setor.cargas.reduce(
                          (acc: any, c: any) => acc + c.potencia,
                          0,
                        )}{" "}
                        {setor.cargas[0]?.unidadeMedida || "W"}
                      </Text>

                      <TouchableOpacity
                        onPress={() => toggleExpandir(setor.id)}
                        style={styles.btnExpandir}
                      >
                        <FontAwesome5
                          name={
                            cardsExpandidos[setor.id]
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={12}
                          color="#2563eb"
                        />
                        <Text style={styles.textoExpandir}>
                          {cardsExpandidos[setor.id]
                            ? "Ocultar lista de itens"
                            : `Ver ${setor.cargas.length} itens internos`}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.acoesCard}>
                      {setor.dadosPlanta && (
                        <TouchableOpacity
                          style={styles.botaoAcaoCard}
                          onPress={() => handleEditarPlanta(setor)}
                        >
                          <FontAwesome5 name="pen" size={15} color="#f59e0b" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.botaoAcaoCard}
                        onPress={() => confirmarRemocao(setor.id, setor.nome)}
                      >
                        <FontAwesome5 name="trash" size={15} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 💡 RAIO-X PARA TODOS: Planta, Manual e Áreas Comuns! */}
                  {cardsExpandidos[setor.id] && (
                    <View style={styles.areaExpandida}>
                      {cargasOrdenadas.map((carga: any, index: number) => (
                        <View
                          key={carga.id || index}
                          style={styles.linhaCircuito}
                        >
                          <Text style={styles.nomeCircuito}>
                            ⚡ {carga.nome}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Text style={styles.potenciaCircuito}>
                              {carga.potencia} {carga.unidadeMedida}
                            </Text>

                            {/* 💡 LIXEIRINHA PARA DELETAR ITEM ESPECÍFICO (Só não aparece se for pacote da NBR 5410, pois lá usa o Lápis de edição) */}
                            {!setor.dadosPlanta && (
                              <TouchableOpacity
                                onPress={() =>
                                  handleRemoverCargaInterna(setor.id, carga.id)
                                }
                                style={{ padding: 4 }}
                              >
                                <FontAwesome5
                                  name="times"
                                  size={14}
                                  color="#ef4444"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <ModalDimensionamentoApto
        visivel={modalPlantaVisivel}
        dadosIniciais={dadosParaEdicao}
        onClose={fecharModalPlanta}
        onSalvar={(
          cargasCalculadas,
          nomeTipologia,
          quantidade,
          comodosCrus,
          tuesCrus,
        ) => {
          const pacoteCargas = cargasCalculadas.map((carga) => ({
            id: Math.random().toString(),
            nome: carga.nome,
            potencia: carga.potenciaW,
            unidadeMedida: "W",
            fatorPotencia: 0.95,
            tipo: "Geral" as any,
          }));

          if (setorEmEdicao) {
            const setoresAtualizados = setores.map((s) => {
              if (s.id === setorEmEdicao) {
                return {
                  ...s,
                  nome: nomeTipologia,
                  quantidade: quantidade,
                  cargas: pacoteCargas,
                  dadosPlanta: { comodos: comodosCrus, tues: tuesCrus },
                };
              }
              return s;
            });
            setoresDispatch(setoresAtualizados);
            Platform.OS === "web"
              ? window.alert("Tipologia atualizada com sucesso!")
              : alert("Tipologia atualizada!");
          } else {
            const novoSetor: any = {
              id: Math.random().toString(),
              nome: nomeTipologia,
              tipoSetor: "Apartamento",
              quantidade: quantidade,
              fases: 2,
              cargas: pacoteCargas,
              dadosPlanta: { comodos: comodosCrus, tues: tuesCrus },
            };
            setoresDispatch([...setores, novoSetor]);
            Platform.OS === "web"
              ? window.alert("Tipologia salva com sucesso!")
              : alert("Tipologia salva!");
          }
          fecharModalPlanta();
        }}
      />
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
  botoesAcaoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  botaoAcao: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" },
      default: { elevation: 4 },
    }),
  },
  botaoPlanta: { backgroundColor: "#10b981" },
  botaoManual: { backgroundColor: "#2563eb" },
  botaoComum: { backgroundColor: "#4f46e5" },
  textoBotaoAcao: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  subtextoBotaoAcao: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  textoTrava: {
    textAlign: "center",
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 20,
    fontStyle: "italic",
    paddingHorizontal: 10,
  },
  boxFormManual: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      web: { boxShadow: "0px 4px 10px rgba(0,0,0,0.08)" },
      default: { elevation: 3 },
    }),
  },
  headerFormManual: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    paddingBottom: 12,
  },
  tituloFormManual: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  tabActive: { backgroundColor: "#2563eb" },
  tabText: { color: "#6b7280", fontWeight: "bold", fontSize: 13 },
  tabTextActive: { color: "#ffffff" },
  areaFormulario: { paddingHorizontal: 4 },
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
  cardWrapper: {
    marginBottom: 12,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" },
      default: { elevation: 2 },
    }),
  },
  cardItem: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  cardInfo: { flex: 1, paddingRight: 10 },
  itemNome: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  itemDetalhe: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  itemCarga: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 4,
  },
  acoesCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingTop: 4,
  },
  botaoAcaoCard: { padding: 8 },
  btnExpandir: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
    backgroundColor: "#eff6ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  textoExpandir: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  areaExpandida: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },
  linhaCircuito: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  nomeCircuito: { fontSize: 13, color: "#475569", flex: 1 },
  potenciaCircuito: { fontSize: 13, fontWeight: "bold", color: "#1e293b" },
});
