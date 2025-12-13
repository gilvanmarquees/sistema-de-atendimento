# Sistema de Controle de Atendimento  
Projeto da Faculdade – Desenvolvimento Front-end com React

## 💭 Palavras do Desenvolvedor

Dei meu máximo nesse projeto. De verdade. Dediquei bastante tempo e esforço, sempre tentando deixar tudo cada vez mais perto do que eu tinha imaginado. Tenho uns 4 anos de experiência com Laravel e, sinceramente, eu tinha um pouco de medo de sair da minha zona de conforto — ainda mais usando um framework que já está meio ultrapassado… mas fazer o quê, é o que eu conhecia! 😂

Este semestre conheci o React e acabei gostando muito: a facilidade, a organização e o tanto de coisa incrível que dá pra fazer me surpreenderam. Sei que o projeto ainda tem algumas imperfeições, mas tentei melhorar sempre que podia — afinal, é meu primeiro contato com React, então dá um descontinho aí, né? KKKKKK

Minhas principais fontes foram a [documentação oficial do React](https://pt-br.react.dev/learn) e o [W3Schools](https://www.w3schools.com/react/). Usei IA também, mas foi só pra resolver alguns bugs teimosos que tavam tirando meu sono — eu juro! 😅

Espero que goste do projeto. Muito obrigado pelos ensinamentos! Aprendi bastante e, com certeza, vou continuar usando essa biblioteca maravilhosa daqui pra frente.

Abraçoooo!
**Att, Gilvan Marques**

---

## 📖 Sobre o Projeto

Este projeto foi desenvolvido para a disciplina de **Front-end Frameworks**, como parte da avaliação prática solicitada pelo professor.  
O objetivo é implementar um **sistema de controle de atendimento** com emissão de senhas, painel de chamadas e fluxo básico entre os agentes envolvidos.

---

## 👥 Integrantes do Grupo  

| Nome do Aluno | Matrícula |
|---------------|-----------|
| Gilvan Marques | 01837066 |
| Vinicius José Alves | 01737266 |
| Bruno da Cruz | 01812838 |
| Juan Pablo | 01786044 |
| Bruno Pereira | 11035946 |

---

## 🎯 Objetivo do Projeto

O sistema simula um ambiente real de atendimento, contendo:

- Emissão de senhas por tipo (SP, SE, SG)
- Chamada de senhas por guichê
- Finalização de atendimento
- Painel público mostrando as últimas chamadas
- Registro de histórico de atendimentos
- Contador diário de senhas emitidas
- Relatórios diários e mensais detalhados
- Cálculo automático de tempo médio de atendimento (TM)
- Operação totalmente em memória (sem backend)

Este projeto foi desenvolvido **somente com React**, sem uso de rotas, bancos ou localStorage.

---

## 🚀 Instalação e Execução

### Pré-requisitos
Antes de começar, certifique-se de ter instalado em seu computador:
- **Node.js** (versão 14 ou superior)
- **npm** (geralmente vem junto com o Node.js)

### Passo a Passo

**1. Clone o repositório**
```bash
git clone https://github.com/gilvanmarquees/sistema-de-atendimento.git
```

**2. Entre na pasta do projeto**
```bash
cd sistema-de-atendimento
```

**3. Instale as dependências**
```bash
npm install
```

**4. Inicie o servidor de desenvolvimento**
```bash
npm start
```

---

## 🔄 Como Funciona a Aplicação

### 1. Horário de Funcionamento
- O sistema opera das **7h às 17h** (horário de Brasília)
- Fora do expediente:
  - Não é possível emitir novas senhas
  - Não é possível chamar senhas
  - Indicador visual mostra "FECHADO" em vermelho
- Ao encerrar o expediente (manual ou automático):
  - Todas as senhas não atendidas são descartadas automaticamente
  - Sistema registra timestamp do descarte

### 2. Emissão de Senha
- O **cliente** vai até o **Totem (AC)** e escolhe o tipo de atendimento:
  - **SP** - Prioritária (idosos, gestantes, deficientes)
  - **SE** - Retirada de Exames
  - **SG** - Atendimento Geral
- A senha é gerada no formato `YYMMDD-TTNN` (ex: `241212-SP01`)
- O **Agente Sistema (AS)** também pode emitir senhas manualmente
- ⚠️ Só funciona durante o expediente (7h-17h)

### 3. Acompanhamento
- O cliente visualiza sua posição na fila através do **Painel de Chamadas**
- O painel mostra:
  - Senha atualmente sendo chamada
  - Últimas 5 chamadas
  - Resumo do dia (emitidas, chamadas, na fila, descartadas)

### 4. Chamada do Cliente
- O **Atendente (AA)** seleciona seu guichê (1, 2 ou 3)
- Clica em "Chamar Próxima" para chamar a senha seguindo a regra de prioridade:
  - **1x SP → 1x SE → 1x SP → 1x SG** (repetindo o ciclo)
- A senha chamada aparece no painel com destaque
- O sistema calcula automaticamente o tempo estimado de atendimento
- ⚠️ Só funciona durante o expediente (7h-17h)

### 5. Atendimento
- O atendente realiza o atendimento
- Ao finalizar, clica em "Finalizar Atendimento"
- A senha é marcada como atendida e registrada no histórico
- O guichê fica livre para chamar a próxima senha

### 6. Descarte de Senhas
- Senhas que não foram atendidas podem ser descartadas pelo atendente
- O sistema registra a data/hora do descarte para relatórios
- **Descarte automático às 17h**: senhas não chamadas são descartadas
- Botão "Encerrar Expediente" permite descarte manual antecipado

### 7. Relatórios
- **Relatório Diário (AS)**: mostra todas as senhas do dia com estatísticas
- **Relatório Mensal**: permite filtrar por mês/ano e ver dados históricos
- Ambos incluem tempo médio de atendimento (TM) e detalhamento completo

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

## 📋 Checklist das Regras
✅ = Feito | ❌ = Não feito | ➖ = Incompleto

- ✅ **Agentes AS, AA e AC**
- ✅ **Tipos de senha SP, SG e SE**
- ✅ **Tempos médios de atendimento (TM)**
- ✅ **Regra de Prioridade das Chamadas: 1x SP > 1x SE | SG > 1x SP > 1x SE | SG**
- ✅ **Horário de Funcionamento (7h às 17h com descarte automático)**
- ✅ **Descarte de senhas com timestamp**
- ✅ **Formato da numeração da senha (YYMMDD-TTNN)**
- ✅ **Guichês (1, 2 e 3 — podendo expandir)**
- ✅ **Painel de chamadas com design limpo**
- ✅ **Relatórios (Diário e Mensal)**
- ✅ **Tecnologia Frontend: React**

---

## ⚠️ Limitações Conhecidas

### Simulação de Data/Hora
- **Data/Hora de Emissão e Atendimento**: Como o sistema utiliza data simulada para testes, as senhas emitidas, chamadas e finalizadas no mesmo momento (simulado) terão timestamps idênticos ou muito próximos nos relatórios.
- **Comportamento esperado**: Em um ambiente real de produção, esses timestamps seriam naturalmente diferentes devido ao tempo real de atendimento.
- **Impacto**: Isso não afeta a funcionalidade do sistema, apenas a visualização realista dos intervalos de tempo nos relatórios quando testado com data simulada.

### Como alterar para Data/Hora Real

Se você deseja que o sistema use a data e hora real do sistema em vez da simulação, siga os passos abaixo:

**1. Abra o arquivo `src/App.js`**

**2. Localize as linhas que inicializam os estados de data/hora (aproximadamente linhas 60-65):**
```javascript
const [dataAtualSimulada, setDataAtualSimulada] = useState(new Date());
const [horarioSimulado, setHorarioSimulado] = useState(new Date());
```

**3. Remova ou comente os inputs de data/hora no header** (linhas ~345-380) para evitar que o usuário altere manualmente.

**4. Substitua as referências de `dataAtualSimulada` por `new Date()` nas seguintes funções:**
- `criarSenha()` - linha ~116: `const agora = new Date();` (já usa dataAtualSimulada)
- `finalizarAtendimento()` - linha ~251: usar `new Date().toISOString()`
- `jogarForaSenha()` - linha ~265: usar `new Date().toISOString()`
- `descartarSenhasForaExpediente()` - linha ~285: usar `new Date().toISOString()`

**5. Para o horário de funcionamento**, substitua `horarioSimulado` por `new Date()` nas verificações:
- `criarSenha()` - linha ~112: `if (!estaNoHorarioFuncionamento(new Date()))`
- `chamarSenha()` - linha ~151: `if (!estaNoHorarioFuncionamento(new Date()))`

**Exemplo de alteração:**
```javascript
// ANTES (simulado):
function criarSenha(tipo, emissor = "AC") {
  if (!estaNoHorarioFuncionamento(horarioSimulado)) {
    alert(`Fora do horário...`);
    return;
  }
  const agora = dataAtualSimulada;
  // ...
}

// DEPOIS (real):
function criarSenha(tipo, emissor = "AC") {
  if (!estaNoHorarioFuncionamento(new Date())) {
    alert(`Fora do horário...`);
    return;
  }
  const agora = new Date();
  // ...
}
```

⚠️ **Atenção**: Ao fazer essa alteração, o sistema passará a usar a data/hora real do computador, e você não poderá mais simular datas diferentes para testes de relatórios mensais.

---

## 📝 Versionamento detalhado

### v2.2.1 - 12/12/2024
**Correções:**
- 🛠️ **Correção de timestamps simulados**
  - Senhas finalizadas agora usam `dataAtualSimulada` em vez de data real
  - Senhas descartadas agora usam `dataAtualSimulada` em vez de data real

- 🛠️ **Correção de status nos relatórios**
  - Senhas descartadas agora aparecem com status "Descartada" em vez de "Pendente"

**Melhorias:**
- 🔧 Documentação de limitações conhecidas sobre simulação de data/hora

### v2.1.0 - 12/12/2024
**Novidades:**
- ✨ **Controle de Horário de Funcionamento**
  - Atendimento das 7h às 17h
  - Bloqueio de emissão de senhas fora do expediente
  - Bloqueio de chamadas fora do expediente
  - Descarte automático de senhas ao encerrar expediente
  - Indicador visual de status (ABERTO/FECHADO)
  - Botão manual "Encerrar Expediente" no header

**Melhorias:**
- 🔧 Alertas informativos sobre horário de funcionamento
- 🔧 Interface atualizada com status em tempo real

### v2.0.0 - 12/12/2024
**Novidades:**
- ✨ Implementação completa do sistema de Tempo Médio (TM)
  - SP: 15±5 minutos (variação aleatória)
  - SG: 5 minutos fixos
  - SE: sem tempo médio
- ✨ Relatórios diários e mensais detalhados
  - Quantitativo geral e por tipo
  - Tabelas com todas as senhas do período
  - Estatísticas de TM por tipo
- ✨ Registro de timestamp de descarte (descartadaEm)
- ✨ Painel de chamadas reformulado
  - Design preto/branco/cinza clean
  - Resumo horizontal discreto
  - Layout sem scroll vertical
  - Visualização clara das últimas chamadas e próximas da fila

**Melhorias:**
- 🔧 Lógica de prioridade cíclica aprimorada
- 🔧 Cálculo automático de tempo estimado de fim de atendimento
- 🔧 Organização de código com useMemo para performance
- 🔧 Filtros de mês/ano nos relatórios

### v1.0.0 - Versão Inicial
**Funcionalidades:**
- Sistema básico de emissão de senhas
- Chamada por guichê
- Painel de visualização
- Histórico de atendimentos
- Simulação de data para testes

---

## 🛠️ Tecnologias Utilizadas

- **React.js**
- **JavaScript ES6+**
- **CSS3**
- **Hooks (useState, useMemo, useRef)**
- **Estrutura de pastas organizada em `views/`**
