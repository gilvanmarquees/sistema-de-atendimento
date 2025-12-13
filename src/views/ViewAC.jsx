import React, { useEffect } from "react";

export default function ViewAC({ tiposSenha, criarSenha, filaSenhas, totalEmitidas, dataAtualFormatada}) {
    useEffect(() =>{
            document.title = "AC - Totem (Cliente)";
        },[]);
    return (
        <div className="view">
            <h2>AC - Totem (Cliente)</h2>
            <p>Escolha o tipo de senha:</p>
            <div className="btn-row">
                {tiposSenha.map((t) => (
                    <button key={t.codigo} onClick={() => criarSenha(t.codigo)}>{t.label}</button>
                ))}
            </div>
            <small>Senhas emitidas hoje: {totalEmitidas}</small>
        </div>
    );
}