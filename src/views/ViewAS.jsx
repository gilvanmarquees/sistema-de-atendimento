import {React, useEffect, useMemo } from "react";

export default function ViewAS({ 
    tiposSenha, 
    criarSenha, 
    limparSistema, 
    filaSenhas, 
    relatorio, 
    dataAtualFormatada, 
    senhasAtendidas,
    iniciarExpediente,
    descartarSenhasForaExpediente,
    horarioSimulado,
    estaNoHorarioFuncionamento
}) {
    useEffect(() =>{
        document.title = "AS - Agente Sistema";
    },[]);

    // relatório detalhado diário
    const relatorioDiario = useMemo(() => {
        // arrays para relatório detalhado
        const senhasDetalhadas = [];
        
        // TM - Tempo Médio (apenas SP e SG) do dia
        let somaTM_SP = 0;
        let countTM_SP = 0;
        let somaTM_SG = 0;
        let countTM_SG = 0;

        // combina fila e atendidas, filtra por data de emissão de hoje
        const todasSenhas = [...filaSenhas, ...(senhasAtendidas || [])];
        todasSenhas.forEach((s) => {
            const dataEmissao = s.emitidaEm ? s.emitidaEm.slice(0, 10) : null;
            if (dataEmissao === dataAtualFormatada) {
                senhasDetalhadas.push({
                    id: s.id,
                    tipo: s.tipo,
                    emitidaEm: s.emitidaEm,
                    atendidoEm: s.atendidoEm || null,
                    guiche: s.guiche || null,
                    finalizado: s.finalizado || false,
                    descartada: s.descartada || false,
                    tempoAtendimentoMinutos: s.tempoAtendimentoMinutos || null,
                });

                // calcular TM médio do dia
                if (s.finalizado && s.tempoAtendimentoMinutos) {
                    if (s.tipo === "SP") {
                        somaTM_SP += s.tempoAtendimentoMinutos;
                        countTM_SP += 1;
                    } else if (s.tipo === "SG") {
                        somaTM_SG += s.tempoAtendimentoMinutos;
                        countTM_SG += 1;
                    }
                }
            }
        });

        // ordenar por data de emissão (mais recente primeiro)
        senhasDetalhadas.sort((a, b) => new Date(b.emitidaEm) - new Date(a.emitidaEm));

        // calcular médias de TM
        const mediaTM_SP = countTM_SP > 0 ? (somaTM_SP / countTM_SP).toFixed(2) : 0;
        const mediaTM_SG = countTM_SG > 0 ? (somaTM_SG / countTM_SG).toFixed(2) : 0;

        return {
            senhasDetalhadas,
            mediaTM_SP,
            mediaTM_SG,
            countTM_SP,
            countTM_SG,
        };
    }, [filaSenhas, senhasAtendidas, dataAtualFormatada]);

    return (
        <div className="view">
            <h2>AS - Agente Sistema</h2>
            <p>Emita senhas manualmente ou gerencie o sistema.</p>
            <div className="btn-row">
                {tiposSenha.map((t) => (
                    <button key={t.codigo} onClick={() => criarSenha(t.codigo, "AS")}>Emitir {t.codigo}</button>
                ))}
                <button onClick={limparSistema} className="danger">Reiniciar dia</button>
                <button onClick={iniciarExpediente} disabled={estaNoHorarioFuncionamento(horarioSimulado)} className="small" style={{
                    background: estaNoHorarioFuncionamento(horarioSimulado) ? "#ccc" : "#28a745", color: "white",border: "none",
                    cursor: estaNoHorarioFuncionamento(horarioSimulado) ? "not-allowed" : "pointer"}}>
                    Iniciar (7h)
                </button>
            
            <button 
              onClick={descartarSenhasForaExpediente}
              disabled={!estaNoHorarioFuncionamento(horarioSimulado)}
              className="small"
              style={{
                background: !estaNoHorarioFuncionamento(horarioSimulado) ? "#ccc" : "#dc3545",
                color: "white",
                border: "none",
                cursor: !estaNoHorarioFuncionamento(horarioSimulado) ? "not-allowed" : "pointer"
              }}
            >
              Encerrar (17h)
            </button>
            </div>

            <section>
                <h3>Últimas senhas na fila</h3>
                <ul>
                    {[...filaSenhas].slice(-8).reverse().map((s) => (
                        <li key={s.id}>{s.id} — {s.tipo} — {new Date(s.emitidaEm).toLocaleTimeString()}</li>
                    ))}
                    {filaSenhas.length === 0 && <span>FILA VAZIA</span>}
                </ul>
            </section>

            <section>
                <h3>Relatório Diário — {new Date(dataAtualFormatada).toLocaleDateString("pt-BR")}</h3>
                
                <h4 style={{ marginTop: 12 }}>Quantitativo Geral</h4>
                <ul>
                    <li><strong>Senhas emitidas:</strong> {relatorio.emitidas}</li>
                    <li><strong>Senhas atendidas:</strong> {relatorio.atendidas}</li>
                    <li><strong>Senhas descartadas:</strong> {relatorio.descartadas}</li>
                </ul>

                <h4 style={{ marginTop: 12 }}>Quantitativo por Prioridade</h4>
                <p><strong>Emitidas:</strong> SP {relatorio.porTipoEmitidas.SP} | SE {relatorio.porTipoEmitidas.SE} | SG {relatorio.porTipoEmitidas.SG}</p>
                <p><strong>Atendidas:</strong> SP {relatorio.porTipoAtendidas.SP} | SE {relatorio.porTipoAtendidas.SE} | SG {relatorio.porTipoAtendidas.SG}</p>

                <h4 style={{ marginTop: 12 }}>Relatório de Tempo Médio (TM)</h4>
                <ul>
                    <li><strong>SP (Prioritária):</strong> {relatorioDiario.mediaTM_SP} minutos (baseado em {relatorioDiario.countTM_SP} atendimentos)</li>
                    <li><strong>SG (Geral):</strong> {relatorioDiario.mediaTM_SG} minutos (baseado em {relatorioDiario.countTM_SG} atendimentos)</li>
                    <li><strong>SE (Exames):</strong> Sem tempo médio definido</li>
                </ul>
            </section>

            <section style={{ marginTop: 12 }}>
                <h3>Relatório Detalhado de Senhas do Dia</h3>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <table className="simple-table" aria-label="relatório detalhado diário">
                        <thead>
                            <tr>
                                <th>Numeração</th>
                                <th>Tipo</th>
                                <th>Data/Hora Emissão</th>
                                <th>Data/Hora Atendimento</th>
                                <th>Guichê</th>
                                <th>TM (min)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relatorioDiario.senhasDetalhadas.length === 0 && (
                                <tr><td colSpan="7" style={{ textAlign: "center" }}>Nenhuma senha emitida hoje</td></tr>
                            )}
                            {relatorioDiario.senhasDetalhadas.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>{s.tipo}</td>
                                    <td>{s.emitidaEm ? new Date(s.emitidaEm).toLocaleString("pt-BR") : "-"}</td>
                                    <td>{s.atendidoEm ? new Date(s.atendidoEm).toLocaleString("pt-BR") : "-"}</td>
                                    <td>{s.guiche || "-"}</td>
                                    <td>{s.tempoAtendimentoMinutos || "-"}</td>
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