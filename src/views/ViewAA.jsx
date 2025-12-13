import React, { useState, useEffect} from "react";

export default function ViewAA({
  guiches,
  chamarSenha,
  finalizarAtendimento,
  jogarForaSenha,
  filaSenhas,
  ultimasChamadas,
  senhasAtendidas,
  podeChamarProxima,
  dataAtualFormatada,
}) {
  useEffect(() => {
    document.title = "AA - Agente Atendente";
  }, []);
  const [guicheSelecionado, setGuicheSelecionado] = useState(guiches && guiches.length > 0 ? guiches[0] : "1");

  return (
    <div className="view">
      <h2>AA - Agente Atendente</h2>

      <div className="controls" style={{ gap: 12 }}>
        <label>
          Guichê:
          <select
            value={guicheSelecionado}
            onChange={(e) => setGuicheSelecionado(e.target.value)}
            style={{ marginLeft: 8, padding: 6 }}
          >
            {guiches.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <button onClick={() => chamarSenha(guicheSelecionado)} disabled={podeChamarProxima(guicheSelecionado) === false}>Chamar Próxima</button>
        <button onClick={() => finalizarAtendimento(guicheSelecionado)} className="small">Finalizar Atendimento</button>
      </div>

      <section>
        <h3>Fila (visual)</h3>
        <ol>
          {filaSenhas.filter(s => !s.descartada && s.emitidaEm?.slice(0, 10) === dataAtualFormatada).length === 0 ? (<span>FILA VAZIA</span>) :
          filaSenhas.filter(s => !s.descartada && s.emitidaEm?.slice(0, 10) === dataAtualFormatada).map((s) => (
            <li key={s.id}>
              {s.id} — {s.tipo}
              <button className="small" onClick={() => jogarForaSenha(s.id)} style={{ marginLeft: 8 }}>Descartar</button>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3>Histórico de atendimentos</h3>
        <table className="simple-table" aria-label="histórico">
          <thead>
            <tr><th>Senha</th><th>Tipo</th><th>Chamado</th><th>Finalizado</th><th>Guichê</th></tr>
          </thead>
          <tbody>
            {senhasAtendidas.slice(-20).reverse().map((r) => (
              <tr key={r.id + r.chamadoEm}>
                <td>{r.id}</td>
                <td>{r.tipo}</td>
                <td>{r.chamadoEm ? new Date(r.chamadoEm).toLocaleTimeString() : "-"}</td>
                <td>{r.finalizado ? new Date(r.atendidoEm).toLocaleTimeString() : "-"}</td>
                <td>{r.guiche || "-"}</td>
              </tr>
            ))}
            {senhasAtendidas.length === 0 && <tr><td colSpan="5">(nenhum registro)</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
