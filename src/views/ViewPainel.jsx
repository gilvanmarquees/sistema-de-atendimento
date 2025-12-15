import React, { useEffect } from "react";

export default function ViewPainel({ ultimasChamadas, filaSenhas, dataAtualFormatada, relatorio }) {
  useEffect(() => {
    document.title = "Painel de Chamadas";
  }, []);

  const ultimasChamadas5 = ultimasChamadas.filter(c => c.chamadoEm?.slice(0, 10) === dataAtualFormatada).slice(0, 5);
  const proximasFila = filaSenhas.filter(s => s.emitidaEm?.slice(0, 10) === dataAtualFormatada && !s.descartada).slice(0, 10);

  return (
    <div className="view painel-chamadas">
      <header className="painel-header">
        <h1>PAINEL DE CHAMADAS</h1>
        <span className="small">use fullscreen para melhor visualização</span>
      </header>

      <div className="painel-principal">
        {/* Última chamada em destaque */}
        {ultimasChamadas5.length > 0 && (
          <div className="chamada-atual">
            <div className="chamada-label">SENHA CHAMADA</div>
            <div className="chamada-senha">{ultimasChamadas5[0].id}</div>
            <div className="chamada-guiche">
              <span className="guiche-label">GUICHÊ</span>
              <span className="guiche-numero">{ultimasChamadas5[0].guiche}</span>
            </div>
            <div className="chamada-tipo">{ultimasChamadas5[0].tipo === "SP" ? "PRIORITÁRIA" : ultimasChamadas5[0].tipo === "SE" ? "EXAMES" : "GERAL"}</div>
          </div>
        )}

        {ultimasChamadas5.length === 0 && (
          <div className="chamada-atual sem-chamada">
            <div className="chamada-label">AGUARDANDO</div>
            <div className="chamada-senha" style={{fontSize: "2rem"}}>Nenhuma senha chamada</div>
          </div>
        )}
      </div>

        {/* Últimas chamadas */}
        <div className="painel-section" style={{marginTop:"15px"}}>
          <h3 className="section-title">Últimas Chamadas</h3>
          <div className="chamadas-lista">
            {ultimasChamadas5.slice(1).map((c, index) => (
              <div key={c.id} className="chamada-item">
                <span className="item-numero">{index + 2}º</span>
                <span className="item-senha">{c.id}</span>
                <span className="item-guiche">Guichê {c.guiche}</span>
                <span className={`item-tipo tipo-${c.tipo.toLowerCase()}`}>{c.tipo}</span>
              </div>
            ))}
            {ultimasChamadas5.length <= 1 && (
              <div className="chamada-vazia">Nenhuma chamada anterior</div>
            )}
          </div>
        </div>

      {/* Resumo do dia */}
      <div className="painel-resumo">
        <div className="resumo-item">
          <div className="resumo-valor">{relatorio.emitidas}</div>
          <div className="resumo-label">Emitidas</div>
        </div>
        <div className="resumo-item">
          <div className="resumo-valor">{ultimasChamadas.filter(s => s.chamadoEm?.slice(0, 10) === dataAtualFormatada).length}</div>
          <div className="resumo-label">Chamadas</div>
        </div>
        <div className="resumo-item">
          <div className="resumo-valor">{proximasFila.length}</div>
          <div className="resumo-label">Na Fila</div>
        </div>
        <div className="resumo-item">
          <div className="resumo-valor">{filaSenhas.filter(s => s.descartada && s.emitidaEm?.slice(0, 10) === dataAtualFormatada).length}</div>
          <div className="resumo-label">Descartadas</div>
        </div>
      </div>
    </div>
  );
}
