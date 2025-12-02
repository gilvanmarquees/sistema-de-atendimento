// src/views/ViewAC.jsx
import React from "react";

export default function ViewAC({ tiposSenha, criarSenhaTotem, filaSenhas, totalEmitidas }) {
    return (
        <div className="view">
            <h2>AC - Totem (Cliente)</h2>
            <p>Escolha o tipo de senha:</p>
            <div className="btn-row">
                {tiposSenha.map((t) => (
                    <button key={t.codigo} onClick={() => criarSenhaTotem(t.codigo)}>{t.label}</button>
                ))}
            </div>
            <small>Senhas emitidas hoje: {totalEmitidas}</small>

            <section className="queue-preview">
                <h3>Fila atual (próximas)</h3>
                <ol>
                    {filaSenhas.map((s) => (
                        <li key={s.id}>{s.id} — {s.tipo} — {new Date(s.emitidaEm).toLocaleTimeString()}</li>
                    ))}
                    {filaSenhas.length === 0 && <li>(vazia)</li>}
                </ol>
            </section>
        </div>
    );
}