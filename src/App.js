// importações das bibliotecas
import React, { useState, useMemo, useRef } from "react";
import "./index.css";
// importações das views
import ViewAC from "./views/ViewAC";
import ViewAS from "./views/ViewAS";
import ViewAA from "./views/ViewAA";
import ViewPainel from "./views/ViewPainel";
import ViewMamaco from "./views/mamaco";

// tipos de senha disponíveis
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
  return `${formatarYYMMDD(data)}-${tipo}${String(seq).padStart(2, "0")}`; // Ex: 240615-SP01 (15 de junho de 2024, Senha Preferencial (SP), seq 1)
}

// Retorna chave do dia no formato YYYY-MM-DD
function getChaveDoDia(data = new Date()) {
  return data.toISOString().slice(0, 10); // YYYY-MM-DD
}

// função principal do App
export default function App() {
  // estado da view atual
  const [view, setView] = useState("AC"); // AC / AS / AA / PAINEL

  // estados principais
  const [filaSenhas, setFilaSenhas] = useState([]);
  const [ultimasChamadas, setUltimasChamadas] = useState([]);
  const [senhasAtendidas, setSenhasAtendidas] = useState([]);

  // sequencia por dia 
  const sequenciaPorDiaRef = useRef({});
  const [sequenciaPorDia, setSequenciaPorDia] = useState({});

  // status dos guichês
  const [guicheStatus, setGuicheStatus] = useState(GUICHES.reduce((acc, g) => ({ ...acc, [g]: "finalizado" }), {}));

  // atualiza status do guichê
  function atualizarStatusGuiche(guiche, status) {
    setGuicheStatus((prev) => ({...prev,[guiche]: status,}));
  }

  // verifica se pode chamar próxima senha para o guichê
  function podeChamarProxima(guiche) {
    return guicheStatus[guiche] === "finalizado" ? true : false;
  }

  // emissão de senhas (AC e AS)
  function criarSenha(tipo, emissor = "AC") {
    const agora = new Date();
    const chave = getChaveDoDia(agora);
    
    // atualiza sequência na reference
    if (!sequenciaPorDiaRef.current[chave]) sequenciaPorDiaRef.current[chave] = { SP: 0, SE: 0, SG: 0 };
    sequenciaPorDiaRef.current[chave][tipo] += 1;
    const seq = sequenciaPorDiaRef.current[chave][tipo];

    // atualiza sequência no estado (para reatividade)
    setSequenciaPorDia((prev) => {
      const copia = { ...prev };
      copia[chave] = { ...(copia[chave] || { SP: 0, SE: 0, SG: 0 }) };
      copia[chave][tipo] = seq;
      return copia;
    });

    // cria a senha e adiciona à fila
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

  // chamar próxima senha (AA) exigindo o guichê
  function chamarSenha(guiche) {
    if (!filaSenhas || filaSenhas.length === 0) return;

    // cópia da fila para manipulação
    const copiaFila = [...filaSenhas];
    const proxima = pegarProximaDaFila(copiaFila); // verifica a próxima conforme a regra
    if (!proxima) return; // se não houver próxima, sai

    // atualiza a fila (removendo a escolhida)
    setFilaSenhas(copiaFila);

    // cria registro de chamada
    const chamadoEm = new Date().toISOString(); // pega o horário atual
    const registroChamada = { ...proxima, chamadoEm, guiche }; // adiciona o horário e guichê

    // adiciona o novo registro na lista de atendidas
    setSenhasAtendidas((listaAntiga) => {
      return [...listaAntiga, { ...registroChamada, atendidoEm: null, finalizado: false }];
    });

    // atualiza painel (últimas 5)
    setUltimasChamadas((h) => [registroChamada, ...h].slice(0, 5));

    // atualiza status do guichê
    atualizarStatusGuiche(guiche, "atendendo");
  }

  // Regra de sequência: 1x SP > 1x SE > 1x SP > 1x SG (repetir)
  // A função respeita a sequência considerando as últimas chamadas
  // e faz fallback para o próximo tipo disponível na sequência.
  function pegarProximaDaFila(fila) {
    const sequencia = ["SP", "SE", "SP", "SG"];

    const ultima = ultimasChamadas[0]?.tipo ?? null;
    const penultima = ultimasChamadas[1]?.tipo ?? null;

    // decide o índice inicial na sequência com base nas últimas chamadas
    let startIndex = 0; // default: começar em sequencia[0] -> SP

    if (!ultima) {
      startIndex = 0; // primeira chamada do dia: SP
    } else if (ultima === "SP") { // verifica se o próximo deve ser SE ou SG
      // se a penúltima foi SE então o SP chamado foi o segundo SP (índice 2),
      // portanto o próximo deve ser SG (índice 3).
      if (penultima === "SE") {
        startIndex = 3; // SG
      } else {
        // caso contrário, assume que o SP foi o primeiro SP (índice 0)
        // e o próximo deve ser SE (índice 1).
        startIndex = 1; // SE
      }
    } else { // 
      // para SE ou SG, usamos a sequência para encontrar o próximo índice
      const idx = sequencia.findIndex((t) => t === ultima);
      startIndex = idx >= 0 ? (idx + 1) % sequencia.length : 0; // padrão para SP que define se é o primeiro ou segundo
    }

    // tenta encontrar o primeiro tipo disponível na sequência a partir do startIndex
    // fallback padrão caso o tipo esperado não esteja na fila
    for (let i = 0; i < sequencia.length; i++) {
      const tipo = sequencia[(startIndex + i) % sequencia.length];
      const idx = fila.findIndex((t) => t.tipo === tipo);
      if (idx >= 0) {
        const [item] = fila.splice(idx, 1);
        return item;
      }
    }

    // se nada encontrado, retorna null
    return null;
  }

  // finalizar atendimento manualmente para um guichê específico
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
      atualizarStatusGuiche(guiche, "finalizado");
      return novaLista;
    });
  }

  // descartar senha específica da fila
  function jogarForaSenha(id) {
    setFilaSenhas((f) =>
      f.map((s) =>
        s.id === id ? { ...s, descartada: true } : s
      ));
  }

  // função para reiniciar dia
  function limparSistema() {
    setFilaSenhas([]);
    setUltimasChamadas([]);
    setSenhasAtendidas([]);
    sequenciaPorDiaRef.current = {};
    setSequenciaPorDia({});
    GUICHES.forEach((g) => atualizarStatusGuiche(g, "finalizado"));
    alert("Sistema limpo.");
  }

  // função para contar total de senhas emitidas hoje
  function contarEmitidasHoje() {
    const chave = getChaveDoDia();
    const mapa = sequenciaPorDiaRef.current[chave] || { SP: 0, SE: 0, SG: 0 };
    return (mapa.SP || 0) + (mapa.SE || 0) + (mapa.SG || 0);
  }

  // relatório rápido usando useMemo para otimização
  const relatorio = useMemo(() => {
    const emitidas = contarEmitidasHoje();  // total emitidas hoje
    const atendidas = senhasAtendidas.filter((r) => r.finalizado).length; // total atendidas hoje
    const descartadas = filaSenhas.filter((r) => r.descartada).length; // total descartadas hoje
    const porTipoEmitidas = { SP: 0, SE: 0, SG: 0 }; // inicializa contadores por tipo emitidas
    const porTipoAtendidas = { SP: 0, SE: 0, SG: 0 }; // inicializa contadores por tipo atendidas

    const chave = getChaveDoDia(); // chave do dia atual YYYY-MM-DD
    const mapa = sequenciaPorDia[chave] || {}; // pega o mapa do dia atual

    // preenche o relatório de emitidas por tipo
    porTipoEmitidas.SP = mapa.SP || 0;
    porTipoEmitidas.SE = mapa.SE || 0;
    porTipoEmitidas.SG = mapa.SG || 0;

    // preenche o relatório de atendidas por tipo
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
        <h1>Sistema de Atendimento</h1>
        <div className="menu" role="tablist" aria-label="views">
          <button onClick={() => setView("AC")} className={view === "AC" ? "active" : ""}>AC - Totem</button>
          <button onClick={() => setView("AS")} className={view === "AS" ? "active" : ""}>AS - Sistema</button>
          <button onClick={() => setView("AA")} className={view === "AA" ? "active" : ""}>AA - Atendente</button>
          <button onClick={() => setView("PAINEL")} className={view === "PAINEL" ? "active" : ""} style={{zIndex:2}}>Painel</button>
          <button onClick={() => setView("MAMACO")} className={`danger ${view === "MAMACO" ? "active" : ""}`}>🦍</button>
        </div>
      </header>

      <main>
        {view === "AC" && (
          <ViewAC
            tiposSenha={TIPOS_SENHA}
            criarSenha={criarSenha}
            filaSenhas={filaSenhas}
            totalEmitidas={totalEmitidas}
          />
        )}

        {view === "AS" && (
          <ViewAS
            tiposSenha={TIPOS_SENHA}
            criarSenha={criarSenha}
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
            podeChamarProxima={podeChamarProxima}
          />
        )}

        {view === "PAINEL" && (
          <ViewPainel
            ultimasChamadas={ultimasChamadas}
            filaSenhas={filaSenhas}
            relatorio={relatorio}
          />
        )}

        {view === "MAMACO" && (
          <ViewMamaco />
        )}
      </main>

      <footer>
        <small>Projeto Faculdade — Sistema de atendimento com React simples</small>
      </footer>
    </div>
  );
}
