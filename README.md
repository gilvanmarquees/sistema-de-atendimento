# Sistema de Controle de Atendimento  
Projeto da Faculdade – Desenvolvimento Front-end com React

Este projeto foi desenvolvido para a disciplina de **Front-end Frameworks**, como parte da avaliação prática solicitada pelo professor.  
O objetivo é implementar um **sistema de controle de atendimento** com emissão de senhas, painel de chamadas e fluxo básico entre os agentes envolvidos.

---

## 👥 Integrantes do Grupo  

### Nome do Aluno | Matrícula

- **Gilvan Marques      | 01837066**
- **Vinicius José Alves | 01737266**
- **Bruno da Cruz       | 01812838**
- **Juan Pablo          | 01786044**
- **Bruno Pereira       | 11035946**

---

## 🎯 Objetivo do Projeto

O sistema simula um ambiente real de atendimento, contendo:

- Emissão de senhas por tipo (SP, SE, SG)
- Chamada de senhas por guichê
- Finalização de atendimento
- Painel público mostrando as últimas chamadas
- Registro de histórico de atendimentos
- Contador diário de senhas emitidas
- Operação totalmente em memória (sem backend)

Este projeto foi desenvolvido **somente com React**, sem uso de rotas, bancos ou localStorage.

---

## 🧩 Componentes do Sistema

O sistema possui 4 telas principais:

### **1. AC – Agente Cliente (Totem)**  
Onde o cliente retira sua senha escolhendo o tipo de atendimento.

### **2. AS – Agente Sistema**  
Responsável por emitir senhas manualmente e reiniciar o sistema.

### **3. AA – Agente Atendente**  
Onde o atendente:
- escolhe o guichê,
- chama a próxima senha,
- finaliza o atendimento atual,
- descarta senhas se necessário.

### **4. Painel de Chamadas**  
Mostra:
- as últimas senhas chamadas,
- resumo do atendimento,
- próximas senhas da fila.

---

## 🛠️ Tecnologias Utilizadas

- **React.js**
- **JavaScript ES6+**
- **CSS3**
- **Hooks (useState, useMemo, useRef)**
- **Estrutura de pastas organizada em `views/`**

---

## 📋 Checklist das Regras
✅ = Feito | ❌ = Não feito | ➖ = Incompleto

- ✅ **Agentes AS, AA e AC**
- ✅ **Tipos de senha SP, SG e SE**
- ❌ **Tempos médios de atendimento**
- ✅ **Regra de Prioridade das Chamadas**
- ❌ **Horário de Funcionamento**
- ✅ **Descarte natural de senhas**
- ✅ **Formato da numeração da senha (YYMMDD-PPSQ)**
- ✅ **Guichês**
- ✅ **Painel de chamadas**
- ➖ **Relatórios**
- ✅ **Tecnologia Frontend: React**