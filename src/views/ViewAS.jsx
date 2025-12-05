import React from "react";

export default function ViewAS({ tiposSenha, criarSenha, limparSistema, filaSenhas, relatorio }) {
    return (
        <div className="view">
            <h2>AS - Agente Sistema</h2>
            <p>Emita senhas manualmente ou gerencie o sistema.</p>
            <div className="btn-row">
                {tiposSenha.map((t) => (
                    <button key={t.codigo} onClick={() => criarSenha(t.codigo, "AS")}>Emitir {t.codigo}</button>
                ))}
                <button onClick={limparSistema} className="danger">Reiniciar dia</button>
            </div>

            <section>
                <h3>Últimas senhas na fila</h3>
                <ul>
                    {[...filaSenhas].slice(-8).reverse().map((s) => (
                        <li key={s.id}>{s.id} — {s.tipo} — {new Date(s.emitidaEm).toLocaleTimeString()}</li>
                    ))}
                    {filaSenhas.length === 0 && <li>(nenhuma)</li>}
                </ul>
            </section>

            <section>
                <h3>Relatório rápido</h3>
                <p>Emitidas (hoje): {relatorio.emitidas} • Atendidas (chamadas): {relatorio.atendidas}  • Descartadas (hoje): {relatorio.descartadas}</p>
                <p>Emitidas por tipo: SP {relatorio.porTipoEmitidas.SP} | SE {relatorio.porTipoEmitidas.SE} | SG {relatorio.porTipoEmitidas.SG}</p>
                <p>Atendidas por tipo: SP {relatorio.porTipoAtendidas.SP} | SE {relatorio.porTipoAtendidas.SE} | SG {relatorio.porTipoAtendidas.SG}</p>
            </section>
        </div>
    );
}