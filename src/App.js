// src/App.js
import React, { useState, useMemo, useRef } from "react";
import "./index.css";

import ViewAC from "./views/ViewAC";
import ViewAS from "./views/ViewAS";
import ViewAA from "./views/ViewAA";
import ViewPainel from "./views/ViewPainel";

const TIPOS_SENHA = [
  { codigo: "SP", label: "Prioritária (SP)" },
  { codigo: "SE", label: "Retirada Exames (SE)" },
  { codigo: "SG", label: "Geral (SG)" },
];

// lista de guichês disponíveis
const GUICHES = ["1", "2", "3"]; // pode ser adicionada conforme necessário

// Formata data como YYMMDD
function formatarYYMMDD(data = new Date()) {
  const yy = String(data.getFullYear()).slice(-2);
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  const dd = String(data.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`; // retorna YYMMDD sempre que chamado
}

// Gera código da senha no formato YYMMDD-TTNN
function gerarCodigo(data, tipo, seq) {
  return `${formatarYYMMDD(data)}-${tipo}${String(seq).padStart(2, "0")}`; // Ex: 240615-SP01 (15 de junho de 2024, SP, seq 1)
}

// Retorna chave do dia no formato YYYY-MM-DD
function getChaveDoDia(data = new Date()) {
  return data.toISOString().slice(0, 10); // YYYY-MM-DD
}


export default function App() {
  const [view, setView] = useState("AC"); // AC / AS / AA / PAINEL

  // estados principais
  const [filaSenhas, setFilaSenhas] = useState([]);
  const [ultimasChamadas, setUltimasChamadas] = useState([]);
  const [senhasAtendidas, setSenhasAtendidas] = useState([]);

  // sequencia por dia (fonte de verdade em ref)
  const sequenciaPorDiaRef = useRef({});
  const [sequenciaPorDia, setSequenciaPorDia] = useState({});

  // estado local do atendente (guichê selecionado) fica na ViewAA
  // aqui mantemos apenas a lista GUICHES

  // ==== Emissão de senhas ====
  function criarSenha(tipo, emissor = "AC") {
    const agora = new Date();
    const chave = getChaveDoDia(agora);

    if (!sequenciaPorDiaRef.current[chave]) sequenciaPorDiaRef.current[chave] = { SP: 0, SE: 0, SG: 0 };
    sequenciaPorDiaRef.current[chave][tipo] += 1;
    const seq = sequenciaPorDiaRef.current[chave][tipo];

    setSequenciaPorDia((prev) => {
      const copia = { ...prev };
      copia[chave] = { ...(copia[chave] || { SP: 0, SE: 0, SG: 0 }) };
      copia[chave][tipo] = seq;
      return copia;
    });

    const codigo = gerarCodigo(agora, tipo, seq);
    const senha = {
      id: codigo,
      tipo,
      seq,
      emitidaEm: agora.toISOString(),
      emissor,
      descartada: false,
    };

    setFilaSenhas((f) => [...f, senha]);
  }

  function criarSenhaTotem(tipo) {
    criarSenha(tipo, "AC");
  }

  function criarSenhaSistema(tipo) {
    criarSenha(tipo, "AS");
  }

  // ==== Chamar próxima senha (AA) ====
  // Agora exige informar o guichê que chama (parâmetro 'guiche')
  function chamarSenha(guiche) {
    if (!filaSenhas || filaSenhas.length === 0) return;

    // snapshot da fila e escolha
    const copiaFila = [...filaSenhas];
    const proxima = pegarProximaDaFila(copiaFila);
    if (!proxima) return;

    // atualiza a fila (removendo a escolhida)
    setFilaSenhas(copiaFila);

    // cria registro de chamada
    const chamadoEm = new Date().toISOString();
    const registroChamada = { ...proxima, chamadoEm, guiche };

    // NÃO finalizamos automaticamente a chamada anterior; finalização é manual agora.
    // adiciona o novo registro (ainda não finalizado)
    setSenhasAtendidas((listaAntiga) => {
      return [...listaAntiga, { ...registroChamada, atendidoEm: null, finalizado: false }];
    });

    // atualiza painel (últimas 5)
    setUltimasChamadas((h) => [registroChamada, ...h].slice(0, 5));
  }

  // regra simples: SP > SE > SP > SG (ordem de prioridade)
  // mantém comportamento de remover o item da fila (mutação intencional)
  function pegarProximaDaFila(fila) {
    const encontrarERemover = (tipo) => {
      const idx = fila.findIndex((t) => t.tipo === tipo);
      if (idx >= 0) {
        const [item] = fila.splice(idx, 1);
        return item;
      }
      return null;
    };
    console.log(`DEBUG:  últimas chamadas = ${ultimasChamadas}`);
    // pega o tipo da penúltima chamada (ou null se não existir)
    const tipoPenultimaChamada = ultimasChamadas[1]?.tipo ?? null;
    const tipoUltimaChamada = ultimasChamadas[0]?.tipo ?? null;

    // Se penúltima foi null e a última foi SP: tenta só SE primeiro — se encontrar retorna; se não, vai para fallback.
    if ((tipoPenultimaChamada === null && tipoUltimaChamada === "SP") || (tipoPenultimaChamada === "SG" && tipoUltimaChamada === "SP")) {
      const escolhido = encontrarERemover("SE");
      if (escolhido) return escolhido;
      console.log("DEBUG: fallback após tentar SE");
    }

    // Se penúltima foi SE e a última foi SP: tenta só SG primeiro — se encontrar retorna; se não, vai para fallback.
    if (tipoPenultimaChamada === "SE" && tipoUltimaChamada === "SP") {
      const escolhido = encontrarERemover("SG");
      if (escolhido) return escolhido;
      console.log("DEBUG: fallback após tentar SG");
    }

    console.log(`DEBUG: fallback padrão após últimas chamadas: penúltima=${tipoPenultimaChamada}, última=${tipoUltimaChamada}`);

    // Fallback padrão: SP > SE > SG
    let escolhido = encontrarERemover("SP");
    if (escolhido) return escolhido;
    escolhido = encontrarERemover("SE");
    if (escolhido) return escolhido;
    return encontrarERemover("SG");
  }

  // === Finalizar atendimento manualmente para um guichê específico ===
  function finalizarAtendimento(guiche) {
    setSenhasAtendidas((listaAntiga) => {
      const novaLista = listaAntiga.map((r) => ({ ...r }));
      // encontra a última chamada desse guichê que não esteja finalizada
      for (let i = novaLista.length - 1; i >= 0; i--) {
        const r = novaLista[i];
        if (r.guiche === guiche && !r.finalizado) {
          novaLista[i] = { ...r, atendidoEm: new Date().toISOString(), finalizado: true };
          break;
        }
      }
      return novaLista;
    });
  }

  // === Jogar fora / descartar senha específica da fila ===
  function jogarForaSenha(id) {
    setFilaSenhas((f) =>
      f.map((s) =>
        s.id === id ? { ...s, descartada: true } : s
      ));
  }

  // === Limpar / reiniciar dia ===
  function limparSistema() {
    setFilaSenhas([]);
    setUltimasChamadas([]);
    setSenhasAtendidas([]);
    sequenciaPorDiaRef.current = {};
    setSequenciaPorDia({});
    alert("Sistema limpo.");
  }

  // === Contadores / relatório ===
  function contarEmitidasHoje() {
    const chave = getChaveDoDia();
    const mapa = sequenciaPorDiaRef.current[chave] || { SP: 0, SE: 0, SG: 0 };
    return (mapa.SP || 0) + (mapa.SE || 0) + (mapa.SG || 0);
  }

  const relatorio = useMemo(() => {
    const emitidas = contarEmitidasHoje();
    const atendidas = senhasAtendidas.filter((r) => r.finalizado).length; // agora só finalizadas
    const descartadas = filaSenhas.filter((r) => r.descartada).length; // agora só descartadas
    const porTipoEmitidas = { SP: 0, SE: 0, SG: 0 };
    const porTipoAtendidas = { SP: 0, SE: 0, SG: 0 };

    const chave = getChaveDoDia();
    const mapa = sequenciaPorDia[chave] || {};
    porTipoEmitidas.SP = mapa.SP || 0;
    porTipoEmitidas.SE = mapa.SE || 0;
    porTipoEmitidas.SG = mapa.SG || 0;

    senhasAtendidas.forEach((r) => {
      if (r.finalizado) porTipoAtendidas[r.tipo] = (porTipoAtendidas[r.tipo] || 0) + 1;
    });

    return { emitidas, atendidas, descartadas, porTipoEmitidas, porTipoAtendidas };
  }, [sequenciaPorDia, senhasAtendidas, filaSenhas]); // dependências necessárias 

  // total emitidas (apenas para exibir no totem)
  const totalEmitidas = relatorio.emitidas;

  return (
    <div className="app">
      <header>
        <h1>Sistema de Atendimento — Projeto (Didático)</h1>
        <div className="menu" role="tablist" aria-label="views">
          <button onClick={() => setView("AC")} className={view === "AC" ? "active" : ""}>AC - Totem</button>
          <button onClick={() => setView("AS")} className={view === "AS" ? "active" : ""}>AS - Sistema</button>
          <button onClick={() => setView("AA")} className={view === "AA" ? "active" : ""}>AA - Atendente</button>
          <button onClick={() => setView("PAINEL")} className={view === "PAINEL" ? "active" : ""}>Painel</button>
        </div>
      </header>

      <main>
        {view === "AC" && (
          <ViewAC
            tiposSenha={TIPOS_SENHA}
            criarSenhaTotem={criarSenhaTotem}
            filaSenhas={filaSenhas}
            totalEmitidas={totalEmitidas}
          />
        )}

        {view === "AS" && (
          <ViewAS
            tiposSenha={TIPOS_SENHA}
            criarSenhaSistema={criarSenhaSistema}
            limparSistema={limparSistema}
            filaSenhas={filaSenhas}
            relatorio={relatorio}
          />
        )}

        {view === "AA" && (
          <ViewAA
            guiches={GUICHES}
            chamarSenha={chamarSenha}
            finalizarAtendimento={finalizarAtendimento}
            jogarForaSenha={jogarForaSenha}
            filaSenhas={filaSenhas}
            ultimasChamadas={ultimasChamadas}
            senhasAtendidas={senhasAtendidas}
          />
        )}

        {view === "PAINEL" && (
          <ViewPainel
            ultimasChamadas={ultimasChamadas}
            filaSenhas={filaSenhas}
            relatorio={relatorio}
          />
        )}
      </main>

      <footer>
        <small>Projeto Faculdade — React simples </small>
      </footer>
    </div>
  );
}
