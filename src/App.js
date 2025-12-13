// importações das bibliotecas
import React, { useState, useMemo, useRef } from "react";
import "./index.css";
// importações das views
import ViewAC from "./views/ViewAC";
import ViewAS from "./views/ViewAS";
import ViewAA from "./views/ViewAA";
import ViewPainel from "./views/ViewPainel";
import ViewRelatorio from "./views/ViewRelatorio";

// tipos de senha disponíveis
const TIPOS_SENHA = [
  { codigo: "SP", label: "Prioritária (SP)" },
  { codigo: "SE", label: "Retirada Exames (SE)" },
  { codigo: "SG", label: "Geral (SG)" },
];

const GUICHES = ["1", "2", "3"]; // guichês disponíveis. pode coloocar quantos você quiser, queridão

// tempos médios de atendimento em minutos por tipo de senha
const TEMPO_MEDIO = {
  SP: 15,
  SE: 0,
  SG: 5,
};

// Horário de funcionamento
const HORARIO_ABERTURA = 7; // 7h da manhã
const HORARIO_FECHAMENTO = 17; // 17h (5 da tarde)

// Função para verificar se está no horário de funcionamento
function estaNoHorarioFuncionamento(data = new Date()) {
  const hora = data.getHours();
  return hora >= HORARIO_ABERTURA && hora < HORARIO_FECHAMENTO;
}

// gera tempo aleatório para SP (10 a 20min) e fixo para SG (5min)
function calcularTempoAtendimento(tipo) {
  if (tipo === "SP") {
    // SP: 15 minutos ± 5 minutos (variação aleatória entre 10 e 20 minutos)
    const variacao = Math.floor(Math.random() * 11) - 5; // gera número entre -5 e +5
    return TEMPO_MEDIO.SP + variacao;
  } else if (tipo === "SG") {
    // SG: 5 minutos fixos
    return TEMPO_MEDIO.SG;
  } else if (tipo === "SE") {
    // SE: sem tempo médio definido, retorna 0
    return 0;
  }
  return 0;
}

export default function App() {
  // estado da view atual
  const [view, setView] = useState("AC"); // AC / AS / AA / PAINEL

  // data atual simulada
  const [dataAtualSimulada, setDataAtualSimulada] = useState(new Date()); // usando apenas a data para simulação. sem usar a hora.
  const dataAtualFormatada = dataAtualSimulada.toISOString().slice(0, 10); // YYYY-MM-DD

  // horário usado apenas para validar funcionamento
  const [horarioSimulado, setHorarioSimulado] = useState(new Date());

  const [filaSenhas, setFilaSenhas] = useState([]);
  const [ultimasChamadas, setUltimasChamadas] = useState([]);
  const [senhasAtendidas, setSenhasAtendidas] = useState([]);

  // 
  const sequenciaPorDiaRef = useRef({});
  const [sequenciaPorDia, setSequenciaPorDia] = useState({});

  // status dos guichês
  const [guicheStatus, setGuicheStatus] = useState(GUICHES.reduce((acc, g) => ({ ...acc, [g]: "finalizado" }), {}));

  // retorna chave do dia no formato YYYY-MM-DD
    function getChaveDoDia(data = dataAtualSimulada) {
      return data.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    // formata data como YYMMDD
    function formatarYYMMDD(data = dataAtualSimulada) {
      const yy = String(data.getFullYear()).slice(-2);
      const mm = String(data.getMonth() + 1).padStart(2, "0");
      const dd = String(data.getDate()).padStart(2, "0");
      return `${yy}${mm}${dd}`; // retorna YYMMDD sempre que chamado
    }

    // gera código da senha no formato YYMMDD-TTNN
    function gerarCodigo(data, tipo, seq) {
      return `${formatarYYMMDD(data)}-${tipo}${String(seq).padStart(2, "0")}`; // Ex: 240615-SP01 (15 de junho de 2024, Senha Preferencial (SP), seq 1)
    }

  // atualiza status do guichê
  function atualizarStatusGuiche(guiche, status) {
    setGuicheStatus((prev) => ({...prev,[guiche]: status,}));
  }

  // verifica se pode chamar próxima senha para o guichê
  function podeChamarProxima(guiche) {
    return guicheStatus[guiche] === "finalizado" ? true : false;
  }

  // função de emissão de senhas
  function criarSenha(tipo, emissor = "AC") {
    // verifica se está no horário de funcionamento
    if (!estaNoHorarioFuncionamento(horarioSimulado)) {
      alert(`Fora do horário de atendimento. Funcionamento: ${HORARIO_ABERTURA}h às ${HORARIO_FECHAMENTO}h`);
      return;
    }

    const agora = dataAtualSimulada;
    const chave = getChaveDoDia(agora);
    
    // atualiza sequência na reference
    if (!sequenciaPorDiaRef.current[chave]) sequenciaPorDiaRef.current[chave] = { SP: 0, SE: 0, SG: 0 };
    sequenciaPorDiaRef.current[chave][tipo] += 1;
    const seq = sequenciaPorDiaRef.current[chave][tipo];

    // atualiza sequência no estado
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
      descartadaEm: null,
    };

    setFilaSenhas((f) => [...f, senha]);
  }

  // função de chamar próxima senha do guichê
  function chamarSenha(guiche) {
    // verifica se está no horário de funcionamento
    if (!estaNoHorarioFuncionamento(horarioSimulado)) {
      alert(`Fora do horário de atendimento. Funcionamento: ${HORARIO_ABERTURA}h às ${HORARIO_FECHAMENTO}h`);
      return;
    }

    if (!filaSenhas || filaSenhas.length === 0) return;

    // copia a fila atual e pega a próxima senha conforme prioridade
    const copiaFila = [...filaSenhas];
    const proxima = pegarProximaDaFila(copiaFila); // verifica a próxima conforme a regra
    if (!proxima) return; // se não houver próxima, sai

    // atualiza a fila (removendo a escolhida)
    setFilaSenhas(copiaFila);

    // calcula o tempo de atendimento baseado no tipo
    const tempoAtendimentoMinutos = calcularTempoAtendimento(proxima.tipo);
    
    // cria registro de chamada
    const chamadoEm = new Date().toISOString(); // pega o horário atual
    
    // calcula horário estimado de fim (se houver TM definido)
    let estimativaFim = null;
    if (tempoAtendimentoMinutos > 0) {
      const dataFim = new Date();
      dataFim.setMinutes(dataFim.getMinutes() + tempoAtendimentoMinutos);
      estimativaFim = dataFim.toISOString();
    }
    
    const registroChamada = { 
      ...proxima, 
      chamadoEm, 
      guiche,
      tempoAtendimentoMinutos, // tempo calculado em minutos
      estimativaFim, // horário estimado de finalização
    }; // adiciona o horário, guichê e informações de tempo

    // adiciona o novo registro na lista de atendidas
    setSenhasAtendidas((listaAntiga) => {
      return [...listaAntiga, { ...registroChamada, atendidoEm: null, finalizado: false }];
    });

    // atualiza painel de últimas chamadas
    setUltimasChamadas((h) => [registroChamada, ...h]);

    // atualiza status do guichê
    atualizarStatusGuiche(guiche, "atendendo");
  }

  // Regra de sequência: 1x SP > 1x SE | SG > 1x SP > 1x SE | SG (repetir) - sacanagem com o SG :((
  // A função respeita a sequência considerando as últimas chamadas
  // e faz fallback para o próximo tipo disponível na sequência.
  function pegarProximaDaFila(fila) {
    const indiceDoTipo = (tipo) => fila.findIndex((t) => t.tipo === tipo && t.emitidaEm?.slice(0, 10) === dataAtualFormatada && !t.descartada);

    const temSP = indiceDoTipo("SP") >= 0;
    const temSE = indiceDoTipo("SE") >= 0;
    const temSG = indiceDoTipo("SG") >= 0;

    const ultima = ultimasChamadas[0]?.tipo ?? null;

    // lógica de sequência com sacanagem com a senha SG
    if (!ultima) {
      if (temSP) {
        const i = indiceDoTipo("SP");
        return i >= 0 ? fila.splice(i, 1)[0] : null;
      }
    } else if (ultima === "SP") {
      if (temSE) {
        const i = indiceDoTipo("SE");
        return i >= 0 ? fila.splice(i, 1)[0] : null;
      }
      if (temSG) {
        const i = indiceDoTipo("SG");
        return i >= 0 ? fila.splice(i, 1)[0] : null;
      }
    } else if (ultima === "SE" || ultima === "SG") {
      if (temSP) {
        const i = indiceDoTipo("SP");
        return i >= 0 ? fila.splice(i, 1)[0] : null;
      }
    }

    // se não seguir a sequência, pega qualquer uma disponível nessa ordem aqui ó 
    for (const tipo of ["SP", "SE", "SG"]) {
      const i = indiceDoTipo(tipo);
      if (i >= 0) return fila.splice(i, 1)[0];
    }

    return null;
  }

  // função para finalizar atendimento de um guichê
  function finalizarAtendimento(guiche) {
    setSenhasAtendidas((listaAntiga) => {
      const novaLista = listaAntiga.map((r) => ({ ...r }));

      // vai (ou vem?) de trás pra frente para pegar a última chamada do guichê
      for (let i = novaLista.length - 1; i >= 0; i--) {
        const r = novaLista[i];
        if (r.guiche === guiche && !r.finalizado) {
          novaLista[i] = { ...r, atendidoEm: dataAtualSimulada.toISOString(), finalizado: true };
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
        s.id === id ? { ...s, descartada: true, descartadaEm: dataAtualSimulada.toISOString() } : s
      ));
  }

  // função para iniciar o expediente
  function iniciarExpediente() {
    const novoHorario = new Date(horarioSimulado);
    novoHorario.setHours(HORARIO_ABERTURA, 0, 0, 0);
    setHorarioSimulado(novoHorario);
    alert(`Expediente iniciado às ${HORARIO_ABERTURA}h`);
  }

  // função para descartar senhas ao fim do expediente
  function descartarSenhasForaExpediente() {
    if (!estaNoHorarioFuncionamento(horarioSimulado)) {
      // descarta todas as senhas não atendidas da fila
      setFilaSenhas((f) =>
        f.map((s) =>
          !s.descartada && !s.chamadoEm
            ? { ...s, descartada: true, descartadaEm: dataAtualSimulada.toISOString() }
            : s
        )
      );
      
      // atualiza horário simulado para após o fechamento
      const novoHorario = new Date(horarioSimulado);
      novoHorario.setHours(HORARIO_FECHAMENTO, 0, 0, 0);
      setHorarioSimulado(novoHorario);

      // te deixa esperto dizendo que o expediente foi encerrado ou se ainda está no horário de funcionamento
      alert(`Expediente encerrado às ${HORARIO_FECHAMENTO}h. Senhas restantes foram descartadas.`);
    } else {
      alert('Ainda está dentro do horário de funcionamento.');
    }
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
  function contarEmitidasHoje(data) {
    const chave = getChaveDoDia(data);
    const mapa = sequenciaPorDiaRef.current[chave] || { SP: 0, SE: 0, SG: 0 };
    return (mapa.SP || 0) + (mapa.SE || 0) + (mapa.SG || 0);
  }

  // estatísticas gerais das senhas do dia atual
  const relatorio = useMemo(() => {
    const emitidas = contarEmitidasHoje(dataAtualSimulada);  // total emitidas hoje
    const atendidas = senhasAtendidas.filter((r) => r.finalizado).length; // total atendidas hoje
    const descartadas = filaSenhas.filter((r) => r.descartada).length; // total descartadas hoje
    const porTipoEmitidas = { SP: 0, SE: 0, SG: 0 }; // inicializa contadores por tipo emitidas
    const porTipoAtendidas = { SP: 0, SE: 0, SG: 0 }; // inicializa contadores por tipo atendidas

    const chave = getChaveDoDia(dataAtualSimulada); // chave do dia atual YYYY-MM-DD
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
  }, [sequenciaPorDia, senhasAtendidas, filaSenhas, dataAtualSimulada]);
  
  const totalEmitidas = relatorio.emitidas;

   // aqui fica o render da aplicação, a parte menos burocratica (mas eu prefiro back-end - html e css não é meu forte)
  return (
    <div className="app">
      <header style={{display: "flex", flexDirection: "column", gap: "12px"}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", width: "100%"}}>
          <h1 style={{margin: 0}}>Sistema de Atendimento</h1>
          
          <div style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap"}}>
            <label htmlFor="data" style={{display: "flex", alignItems: "center", gap: "5px", fontSize: "14px"}}>
              Data:
              <input id="data" type="date" aria-label="data de hoje"
              onChange={(e) => {
                const nova = new Date(dataAtualSimulada);
                const [ano, mes, dia] = e.target.value.split("-");
                nova.setFullYear(ano, mes - 1, dia);
                setDataAtualSimulada(nova);
              }} 
              defaultValue={dataAtualSimulada.toISOString().split('T')[0]} />
            </label>
            
            <label htmlFor="horario" style={{display: "flex", alignItems: "center", gap: "5px", fontSize: "14px"}}>
              Horário:
              <input 
                id="horario"
                type="time" 
                value={`${horarioSimulado.getHours().toString().padStart(2, '0')}:${horarioSimulado.getMinutes().toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [horas, minutos] = e.target.value.split(':');
                  const novoHorario = new Date(horarioSimulado);
                  novoHorario.setHours(parseInt(horas), parseInt(minutos), 0, 0);
                  setHorarioSimulado(novoHorario);
                }}
              />
            </label>
            
            <span style={{
              fontSize: "12px", 
              padding: "4px 10px", 
              borderRadius: "4px",
              background: estaNoHorarioFuncionamento(horarioSimulado) ? "#28a745" : "#dc3545",
              color: "white",
              fontWeight: "600"
            }}>
              {estaNoHorarioFuncionamento(horarioSimulado) 
                ? `ABERTO (${HORARIO_ABERTURA}h-${HORARIO_FECHAMENTO}h)` 
                : "FECHADO"}
            </span>
          </div>
        </div>
        {/* menu de navegação entre as views */}
        <div className="menu" role="tablist" aria-label="views">
          <button onClick={() => setView("AC")} className={view === "AC" ? "active" : ""}>AC - Totem</button>
          <button onClick={() => setView("AS")} className={view === "AS" ? "active" : ""}>AS - Sistema</button>
          <button onClick={() => setView("AA")} className={view === "AA" ? "active" : ""}>AA - Atendente</button>
          <button onClick={() => setView("PAINEL")} className={view === "PAINEL" ? "active" : ""} style={{zIndex:2}}>Painel</button>
          <button onClick={() => setView("RELATORIO")} className={view === "RELATORIO" ? "active" : ""}>Relatório</button>
        </div>
      </header>
      {/* tag main com as views */}
      {/* funciona da seguinte maneira: você escolhe a view no menu, e o componente daquela view é renderizado aqui dentro de forma instantânea, tecnologyyyyy */}
      <main>
        {view === "AC" && (
          <ViewAC
            tiposSenha={TIPOS_SENHA}
            criarSenha={criarSenha}
            filaSenhas={filaSenhas}
            totalEmitidas={totalEmitidas}
            dataAtualSimulada={dataAtualSimulada}
            dataAtualFormatada={dataAtualFormatada}
          />
        )}

        {view === "AS" && (
          <ViewAS
            tiposSenha={TIPOS_SENHA}
            criarSenha={criarSenha}
            limparSistema={limparSistema}
            filaSenhas={filaSenhas}
            relatorio={relatorio}
            dataAtualSimulada={dataAtualSimulada}
            dataAtualFormatada={dataAtualFormatada}
            senhasAtendidas={senhasAtendidas}
            iniciarExpediente={iniciarExpediente}
            descartarSenhasForaExpediente={descartarSenhasForaExpediente}
            horarioSimulado={horarioSimulado}
            estaNoHorarioFuncionamento={estaNoHorarioFuncionamento}
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
            dataAtualSimulada={dataAtualSimulada}
            dataAtualFormatada={dataAtualFormatada}
          />
        )}

        {view === "PAINEL" && (
          <ViewPainel
            ultimasChamadas={ultimasChamadas}
            filaSenhas={filaSenhas}
            relatorio={relatorio}
            dataAtualSimulada={dataAtualSimulada}
            dataAtualFormatada={dataAtualFormatada}
          />
        )}

        {view === "RELATORIO" && (
          <ViewRelatorio
            senhasAtendidas={senhasAtendidas}
            filaSenhas={filaSenhas}
            dataAtualSimulada={dataAtualSimulada}
            dataAtualFormatada={dataAtualFormatada}
            relatorio={relatorio}
            tiposSenha={TIPOS_SENHA}
            criarSenha={criarSenha}
            limparSistema={limparSistema}
            guiches={GUICHES}
            chamarSenha={chamarSenha}
            finalizarAtendimento={finalizarAtendimento}
            jogarForaSenha={jogarForaSenha}
            ultimasChamadas={ultimasChamadas}
            podeChamarProxima={podeChamarProxima}
          />
        )}

      </main>

      {/* não mostra na view painel p não atrapalhar, bichinho precisa de espaço*/}
      {view !== "PAINEL" && (
        <footer>
        <small>Projeto Faculdade — Sistema de atendimento com React simples</small>
      </footer>
    )}
    </div>
  );
}
