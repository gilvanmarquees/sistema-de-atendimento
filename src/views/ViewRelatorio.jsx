// src/views/ViewRelatorio.jsx
import React, { useEffect, useMemo, useState } from "react";

function mesesNomeados() {
  return [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
}

// função para converter string ISO em Date, retornando null se inválido
// estava com problemas ao lidar com datas inválidas, então peguei esse código com o ChatGPT
// desculpa, prof mas eu to aprendendo ainda :(
function parseISODate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export default function ViewRelatorio({ filaSenhas = [], senhasAtendidas = [] }) { // padrão dos valores como arrays vazios / deu dor de cabeça até descobrir o motivo do warning
    useEffect(() =>{
        document.title = "Relatório Mensal";
    },[]);
  // estado para mês/ano selecionados
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth()); // pega o mês atual como padrão
  const [ano, setAno] = useState(hoje.getFullYear()); // pega o ano atual como padrão

  // montar lista de anos disponíveis (a partir dos dados)
  const anosDisponiveis = useMemo(() => {
    const anos = new Set(); // usar Set para evitar duplicatas

    // função auxiliar para extrair anos de um array de senhas
    const pushFrom = (arr) => {
      arr.forEach((s) => {
        const d = parseISODate(s.emitidaEm);
        if (d) anos.add(d.getFullYear());
      });
    };
    pushFrom(filaSenhas); // pega anos de filaSenhas
    pushFrom(senhasAtendidas); // pega anos de senhasAtendidas

    // garante que o ano atual esteja na lista
    anos.add(hoje.getFullYear());
    return Array.from(anos).sort((a, b) => b - a);
  }, [filaSenhas, senhasAtendidas]); // recalcula se filaSenhas ou senhasAtendidas mudarem (dependências)

  // função para checar se a data pertence ao mês/ano selecionado
  // recebe string ISO, retorna boolean
  // bastante útil, evita repetição de código
  const pertenceAMesAno = (isoString) => {
    const d = parseISODate(isoString);
    if (!d) return false;
    return d.getMonth() === Number(mes) && d.getFullYear() === Number(ano);
  };

  // calcular resumo (emitidas, atendidas, descartadas e por tipo)
  // usar useMemo para evitar recalcular desnecessariamente, só quando mes, ano, filaSenhas ou senhasAtendidas mudarem
  const resumo = useMemo(() => {

    // algumas variáveis para contar
    let emitidas = 0;
    let atendidasCount = 0; //
    let descartadas = 0;

    // objetos para contar por tipo
    const atendidasPorTipo = { SP: 0, SE: 0, SG: 0 };
    const emitidasPorTipo = { SP: 0, SE: 0, SG: 0 };
    const descartadasPorTipo = { SP: 0, SE: 0, SG: 0 };

    // arrays para relatório detalhado
    const senhasDetalhadas = [];

    // TM - Tempo Médio (apenas SP e SG)
    let somaTM_SP = 0;
    let countTM_SP = 0;
    let somaTM_SG = 0;
    let countTM_SG = 0;

    // aqui faz a contagem e verificação
    // Emitidas — verificamos se emitidaEm pertence ao mês/ano
    const contarEmitida = (s) => {
      if (pertenceAMesAno(s.emitidaEm)) {
        emitidas += 1;
        if (s.tipo) emitidasPorTipo[s.tipo] = (emitidasPorTipo[s.tipo] || 0) + 1;
      }
    };

    filaSenhas.forEach((s) => contarEmitida(s));
    senhasAtendidas.forEach((s) => contarEmitida(s)); // senhasAtendidas normalmente já contém emitidaEm

    // Atendidas (finalizadas) — verificamos flag finalizado === true e a data atendidoEm pertence ao mês/ano
    senhasAtendidas.forEach((s) => {
      // se tiver flag finalizado e a data atendidoEm estiver no mês selecionado
      if (s.finalizado && pertenceAMesAno(s.atendidoEm) && !s.descartada) {
        atendidasCount += 1;
        if (s.tipo) atendidasPorTipo[s.tipo] = (atendidasPorTipo[s.tipo] || 0) + 1;

        // calcular TM médio
        if (s.tipo === "SP" && s.tempoAtendimentoMinutos) {
          somaTM_SP += s.tempoAtendimentoMinutos;
          countTM_SP += 1;
        } else if (s.tipo === "SG" && s.tempoAtendimentoMinutos) {
          somaTM_SG += s.tempoAtendimentoMinutos;
          countTM_SG += 1;
        }
      }
    });

    // Descartadas: procuramos propriedade descartada === true e a ação pertence ao mês (usamos descartadaEm)
    const contarDescartada = (s) => {
      // objeto tem `descartada` e `descartadaEm` (timestamp ISO)
      if (s.descartada && s.descartadaEm) {
        // usa descartadaEm como referência (timestamp ISO completo)
        if (pertenceAMesAno(s.descartadaEm)) {
          descartadas += 1;
          if (s.tipo) descartadasPorTipo[s.tipo] = (descartadasPorTipo[s.tipo] || 0) + 1;
        }
      }
    };

    filaSenhas.forEach((s) => contarDescartada(s));
    senhasAtendidas.forEach((s) => contarDescartada(s));

    // Montar relatório detalhado de senhas
    // Combina fila e atendidas, filtra por mês/ano de emissão
    const todasSenhas = [...filaSenhas, ...senhasAtendidas];
    todasSenhas.forEach((s) => {
      if (pertenceAMesAno(s.emitidaEm)) {
        senhasDetalhadas.push({
          id: s.id,
          tipo: s.tipo,
          emitidaEm: s.emitidaEm,
          atendidoEm: s.atendidoEm || null,
          guiche: s.guiche || null,
          finalizado: s.finalizado || false,
          descartada: s.descartada || false,
        });
      }
    });

    // ordenar por data de emissão (mais recente primeiro)
    senhasDetalhadas.sort((a, b) => new Date(b.emitidaEm) - new Date(a.emitidaEm));

    // calcular médias de TM
    const mediaTM_SP = countTM_SP > 0 ? (somaTM_SP / countTM_SP).toFixed(2) : 0;
    const mediaTM_SG = countTM_SG > 0 ? (somaTM_SG / countTM_SG).toFixed(2) : 0;

    return {
      emitidas,
      atendidas: atendidasCount,
      descartadas,
      emitidasPorTipo,
      atendidasPorTipo,
      descartadasPorTipo,
      senhasDetalhadas,
      mediaTM_SP,
      mediaTM_SG,
      countTM_SP,
      countTM_SG,
    };
  }, [mes, ano, filaSenhas, senhasAtendidas]); // dependências do useMemo que faz recalcular se mudarem

  // nomes dos meses para o select
  const meses = mesesNomeados();

  return (
    <div className="view">
      <h2>Relatório Mensal</h2>
      <p>Filtre por mês e ano para ver totais (emitidas, atendidas, descartadas e por tipo).</p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>
          Mês:
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))} style={{ marginLeft: 8 }}>
            {meses.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
        </label>

        <label>
          Ano:
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))} style={{ marginLeft: 8 }}>
            {anosDisponiveis.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>

      <section>
        <h3>Resumo geral — {meses[mes]} / {ano}</h3>
        <ul>
          <li><strong>Emitidas:</strong> {resumo.emitidas}</li>
          <li><strong>Atendidas (finalizadas):</strong> {resumo.atendidas}</li>
          <li><strong>Descartadas:</strong> {resumo.descartadas}</li>
        </ul>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Emitidas por tipo</h3>
        <ul>
          <li>SP: {resumo.emitidasPorTipo.SP || 0}</li>
          <li>SE: {resumo.emitidasPorTipo.SE || 0}</li>
          <li>SG: {resumo.emitidasPorTipo.SG || 0}</li>
        </ul>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Atendidas (finalizadas) por tipo</h3>
        <ul>
          <li>SP: {resumo.atendidasPorTipo.SP || 0}</li>
          <li>SE: {resumo.atendidasPorTipo.SE || 0}</li>
          <li>SG: {resumo.atendidasPorTipo.SG || 0}</li>
        </ul>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Descartadas por tipo</h3>
        <ul>
          <li>SP: {resumo.descartadasPorTipo.SP || 0}</li>
          <li>SE: {resumo.descartadasPorTipo.SE || 0}</li>
          <li>SG: {resumo.descartadasPorTipo.SG || 0}</li>
        </ul>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Relatório de Tempo Médio (TM)</h3>
        <ul>
          <li><strong>SP (Prioritária):</strong> {resumo.mediaTM_SP} minutos (baseado em {resumo.countTM_SP} atendimentos)</li>
          <li><strong>SG (Geral):</strong> {resumo.mediaTM_SG} minutos (baseado em {resumo.countTM_SG} atendimentos)</li>
          <li><strong>SE (Exames):</strong> Sem tempo médio definido</li>
        </ul>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Relatório Detalhado de Senhas</h3>
        <p style={{ fontSize: "13px", marginBottom: 8 }}>Total de senhas no período: {resumo.senhasDetalhadas.length}</p>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="simple-table" aria-label="relatório detalhado">
            <thead>
              <tr>
                <th>Numeração</th>
                <th>Tipo</th>
                <th>Data/Hora Emissão</th>
                <th>Data/Hora Atendimento</th>
                <th>Guichê</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resumo.senhasDetalhadas.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: "center" }}>Nenhuma senha emitida neste período</td></tr>
              )}
              {resumo.senhasDetalhadas.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.tipo}</td>
                  <td>{s.emitidaEm ? new Date(s.emitidaEm).toLocaleString("pt-BR") : "-"}</td>
                  <td>{s.atendidoEm ? new Date(s.atendidoEm).toLocaleString("pt-BR") : "-"}</td>
                  <td>{s.guiche || "-"}</td>
                  <td>{s.descartada ? "Descartada" : (s.finalizado ? "Atendida" : "Pendente")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
