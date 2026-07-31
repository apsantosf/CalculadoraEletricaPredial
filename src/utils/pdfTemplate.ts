// src/utils/pdfTemplate.ts
import { calcularDemandaPrumada, converterParaWatts } from "./calculations";
import { Prumada, Setor } from "./templates";

interface GerarHtmlProps {
  nomeProjeto: string;
  numeroAndares: string;
  tensao: string;
  potenciaTotalKw: string;
  demandaGlobalKw: string;
  dimensionamento: { corrente: string; disjuntor: number; cabo: string };
  prumadas: Prumada[];
  areasComuns: Setor[];
  setores: Setor[];
  dataAtual: string;
}

export const gerarHTMLRelatorio = ({
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
}: GerarHtmlProps): string => {
  const apartamentos = setores.filter((s) => s.tipoSetor === "Apartamento");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório Elétrico - ${nomeProjeto || "Projeto"}</title>
        <style>
          @page { margin: 15mm; size: A4 portrait; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #374151; line-height: 1.5; margin: 0; padding: 20px; }
          .header { border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { font-size: 20px; color: #1e3a8a; margin: 0; text-transform: uppercase; }
          .header p { font-size: 12px; color: #6b7280; margin: 5px 0 0 0; }
          .project-title { text-align: center; margin-bottom: 30px; }
          .project-title h2 { font-size: 26px; color: #111827; margin: 0; }
          .project-title p { font-size: 14px; color: #6b7280; margin-top: 5px; }
          .summary-box { border: 1px solid #d1d5db; background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px; display: table; width: 100%; box-sizing: border-box; }
          .summary-col { display: table-cell; width: 50%; text-align: center; vertical-align: middle; }
          .summary-col:first-child { border-right: 1px solid #d1d5db; }
          .summary-label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
          .summary-value { font-size: 24px; font-weight: bold; color: #9ca3af; }
          .summary-value.highlight { font-size: 32px; color: #10b981; }
          .protection-box { border: 2px solid #bfdbfe; background-color: #eff6ff; border-radius: 8px; padding: 15px; margin-bottom: 40px; display: table; width: 100%; box-sizing: border-box; }
          .prot-col { display: table-cell; width: 33.33%; text-align: center; vertical-align: middle; border-right: 1px solid #bfdbfe; }
          .prot-col:last-child { border-right: none; }
          .prot-label { font-size: 11px; color: #3b82f6; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
          .prot-value { font-size: 20px; font-weight: bold; color: #1e3a8a; }
          h3.section-title { font-size: 16px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; page-break-after: avoid; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px; }
          th, td { padding: 12px; border: 1px solid #e5e7eb; text-align: left; }
          th { background-color: #f3f4f6; color: #4b5563; font-weight: bold; text-transform: uppercase; font-size: 12px; }
          .td-right { text-align: right; font-weight: bold; }
          .text-purple { color: #8b5cf6; }
          .text-green { color: #10b981; }
          
          /* 💡 ESTILOS NOVOS PARA O RAIO-X DO PDF */
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 40px; }
          .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; box-sizing: border-box; width: 100%; margin-bottom: 15px; page-break-inside: avoid; }
          .details-header { font-weight: bold; color: #1e40af; border-bottom: 1px solid #bfdbfe; padding-bottom: 6px; margin-bottom: 10px; font-size: 14px; }
          .details-subtitle { font-size: 12px; font-weight: bold; color: #475569; margin-top: 10px; margin-bottom: 4px; }
          .details-list { margin: 0; padding-left: 20px; font-size: 12px; color: #4b5563; }
          .details-list li { margin-bottom: 3px; }
          
          .signature-section { margin-top: 60px; page-break-inside: avoid; }
          .signature-box { width: 300px; margin: 0 auto; text-align: center; }
          .signature-line { border-top: 1px solid #374151; margin-bottom: 8px; }
          .signature-box p { font-size: 12px; margin: 2px 0; color: #4b5563; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Memorial de Cálculo - QGBT</h1>
            <p>Dimensionamento de Cargas Elétricas e Fator de Demanda</p>
          </div>
          <div style="text-align: right;">
            <p>Data: <strong>${dataAtual}</strong></p>
            <p>Elétrica Predial App</p>
          </div>
        </div>

        <div class="project-title">
          <h2>${nomeProjeto || "Projeto Sem Nome"}</h2>
          <p>${numeroAndares ? `${numeroAndares} Pavimentos / Andares` : "Andares não definidos"}</p>
        </div>

        <div class="summary-box">
          <div class="summary-col">
            <div class="summary-label">Potência Instalada (Bruta)</div>
            <div class="summary-value">${potenciaTotalKw} kW</div>
          </div>
          <div class="summary-col">
            <div class="summary-label">Demanda Total Dimensionada (QGBT)</div>
            <div class="summary-value highlight">${demandaGlobalKw} kW</div>
          </div>
        </div>

        <h3 class="section-title">Dimensionamento Geral (Tensão: ${tensao || "N/A"}V Trifásico)</h3>
        <div class="protection-box">
          <div class="prot-col">
            <div class="prot-label">Corrente de Demanda</div>
            <div class="prot-value">${dimensionamento.corrente} A</div>
          </div>
          <div class="prot-col">
            <div class="prot-label">Disjuntor Geral QGBT</div>
            <div class="prot-value">${dimensionamento.disjuntor} A</div>
          </div>
          <div class="prot-col">
            <div class="prot-label">Cabo Alimentador (Fase)</div>
            <div class="prot-value">${dimensionamento.cabo}</div>
          </div>
        </div>

        <h3 class="section-title">Quadro de Cargas - Prumadas (NBR 5410)</h3>
        <table>
          <thead>
            <tr>
              <th>Identificação da Prumada</th>
              <th>Unidades Conectadas</th>
              <th style="text-align: right;">Demanda Real (kW)</th>
            </tr>
          </thead>
          <tbody>
            ${
              prumadas.length > 0
                ? prumadas
                    .map((p) => {
                      const dKw = (
                        calcularDemandaPrumada(p, setores) / 1000
                      ).toFixed(2);
                      const unidadesStr = p.unidades
                        .map((u) => `${u.quantidade}x ${u.nomeSetor}`)
                        .join("<br/>");
                      return `
                        <tr>
                          <td><strong>${p.nome}</strong></td>
                          <td>${unidadesStr}</td>
                          <td class="td-right text-purple">${dKw} kW</td>
                        </tr>
                      `;
                    })
                    .join("")
                : `<tr><td colspan="3" style="text-align:center; color: #6b7280;">Nenhuma prumada configurada</td></tr>`
            }
          </tbody>
        </table>

        <h3 class="section-title">Quadro de Cargas - Serviços Gerais e Áreas Comuns</h3>
        <table>
          <thead>
            <tr>
              <th>Equipamento / Motor</th>
              <th style="text-align: right;">Potência Calculada (kW)</th>
            </tr>
          </thead>
          <tbody>
            ${
              areasComuns.length > 0
                ? areasComuns
                    .map((area) => {
                      let potW = 0;

                      let listaEquipamentosHTML = "";
                      area.cargas.forEach((c) => {
                        let p = converterParaWatts(c.potencia, c.unidadeMedida);
                        // 💡 CORREÇÃO: Fallback de segurança para 1 caso venha undefined
                        potW += p * (c.quantidade || 1);
                        listaEquipamentosHTML += `• ${c.nome} (${c.potencia} ${c.unidadeMedida})<br/>`;
                      });

                      // 💡 CORREÇÃO: Fallback também para a quantidade global da área
                      const potKw = (
                        (potW * (area.quantidade || 1)) /
                        1000
                      ).toFixed(2);

                      return `
                        <tr>
                          <td>
                            <strong>${area.quantidade || 1}x ${area.nome}</strong><br/>
                            <span style="font-size: 11px; color: #6b7280; display: inline-block; margin-top: 4px;">
                              ${listaEquipamentosHTML}
                            </span>
                          </td>
                          <td class="td-right text-green" style="vertical-align: middle;">${potKw} kW</td>
                        </tr>
                      `;
                    })
                    .join("")
                : `<tr><td colspan="2" style="text-align:center; color: #6b7280;">Nenhum equipamento comum configurado</td></tr>`
            }
          </tbody>
        </table>

        <h3 class="section-title" style="margin-top: 20px;">Detalhamento de Cargas por Tipologia (Raio-X)</h3>
        <div>
          ${
            apartamentos.length > 0
              ? apartamentos
                  .map((setor) => {
                    let conteudoInterno = "";

                    if (setor.dadosPlanta) {
                      const comodosStr = setor.dadosPlanta.comodos
                        .map((c: any) => `<li>🏠 ${c.nome} (${c.area}m²)</li>`)
                        .join("");
                      const tuesStr = setor.dadosPlanta.tues
                        .map(
                          (t: any) =>
                            `<li>⚡ ${t.nome} (${t.potenciaW} W)</li>`,
                        )
                        .join("");

                      conteudoInterno = `
                      <div class="details-subtitle">Ambientes Mapeados:</div>
                      <ul class="details-list">${comodosStr || "<li>Nenhum ambiente detalhado</li>"}</ul>
                      
                      <div class="details-subtitle">Equipamentos Pesados (TUEs):</div>
                      <ul class="details-list">${tuesStr || "<li>Nenhum TUE detalhado</li>"}</ul>
                    `;
                    } else {
                      const cargasStr = setor.cargas
                        .map(
                          (c) =>
                            `<li>⚡ ${c.nome} (${c.potencia} ${c.unidadeMedida})</li>`,
                        )
                        .join("");
                      conteudoInterno = `
                      <div class="details-subtitle">Composição do Apartamento (Manual):</div>
                      <ul class="details-list">${cargasStr || "<li>Nenhuma carga descrita</li>"}</ul>
                    `;
                    }

                    return `
                    <div class="details-box">
                      <div class="details-header">${setor.quantidade}x ${setor.nome}</div>
                      ${conteudoInterno}
                    </div>
                  `;
                  })
                  .join("")
              : `<p style="font-size: 13px; color: #6b7280; font-style: italic;">Nenhuma tipologia habitacional cadastrada.</p>`
          }
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>Responsável Técnico</strong></p>
            <p>Engenheiro(a) Eletricista / Eletrotécnico(a)</p>
            <p>CREA / CFT: ______________________</p>
          </div>
        </div>

        <!-- 💡 NOVO: Caixa de Aviso de Responsabilidade Técnica -->
        <div style="margin-top: 40px; padding: 15px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; page-break-inside: avoid;">
          <h4 style="margin: 0 0 8px 0; color: #991b1b; font-size: 12px; text-transform: uppercase;">Aviso de Responsabilidade Técnica</h4>
          <p style="margin: 0; color: #7f1d1d; font-size: 10px; line-height: 1.4; text-align: justify;">
            Os cálculos e dimensionamentos fornecidos por este aplicativo são baseados nos critérios gerais da <strong>NBR 5410</strong> para instalações internas de Baixa Tensão. O dimensionamento final do <strong>Padrão de Entrada</strong> (ramal de ligação, poste e caixas de medição) está sujeito à aprovação e às tabelas de demanda específicas da concessionária de energia da sua região. Sempre consulte a norma local antes da execução.
          </p>
        </div>

        <div class="footer">
          Relatório gerado automaticamente através do sistema. Os cálculos de demanda baseiam-se nos fatores de agrupamento estabelecidos pelas normativas vigentes (NBR 5410). O dimensionamento de cabos considera isolação 90°C.
        </div>
      </body>
    </html>
  `;
};
