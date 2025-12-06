import React, { useEffect } from "react";

export default function ViewPainel({ ultimasChamadas, filaSenhas, relatorio }) {
  useEffect(() =>{
          document.title = "Painel de Chamadas";
      },[]);
  return (
    <div className="view panel-view">
      <h2>Painel de Chamadas</h2>
      <div className="panel-grid">
        <div className="panel-big">
          <h3>Últimas chamadas</h3>
          <ol>
            {ultimasChamadas.map((c) => (
              <li key={c.id}>
                <strong>{c.id}</strong> → guichê {c.guiche} <span className="muted">({c.tipo})</span>
              </li>
            ))}
            {ultimasChamadas.length === 0 && <li>(nenhuma chamada)</li>}
          </ol>
        </div>
        <div className="panel-side">
          <h4>Próximas da fila</h4>
          <ol>
            {filaSenhas.slice(0, 5).map((s) => <li key={s.id}>{s.id} <span className="muted">({s.tipo})</span></li>)}
            {filaSenhas.length === 0 && <li>(vazia)</li>}
          </ol>
          <h4>Resumo</h4>
          <p>Emitidas (hoje): {relatorio.emitidas}</p>
          <p>Atendidas (chamadas): {relatorio.atendidas}</p>
        </div>
      </div>
    </div>
  );
}
