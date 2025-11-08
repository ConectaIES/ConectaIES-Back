
# Documento de Requisitos de Produto (PRD) - ConectaIES

## 1. Detalhes do Documento

| Campo | Detalhe |
| :--- | :--- |
| **Nome do Produto/Funcionalidade** | ConectaIES - Plataforma de Gestão Inclusiva e Participativa |
| **Data da Criação** | (Data da Conclusão) |
| **Status** | Finalizado e Validado (PO) |
| **Agente PM Responsável** | BMad Product Manager |
| **Próximo Agente (Handoff)** | Desenvolvimento (IDE) |

## 2. Visão, Objetivos e Motivação

| Campo | Detalhe |
| :--- | :--- |
| **Visão do Produto** | Ser a plataforma essencial para Instituições de Ensino Superior (IES) que buscam um ambiente acadêmico mais inclusivo, participativo e eficiente. |
| **Problema Resolvido** | Falta de canais estruturados e em tempo real para o registro de feedback e a solicitação de assistência, resultando em lentidão na identificação de problemas e baixa participação da comunidade. |
| **Objetivo de Negócio** | Promover a melhoria contínua da qualidade educacional através da transparência na gestão e do fortalecimento da comunicação e tomada de decisões estratégicas. |
| **Público-Alvo Primário** | Instituições de Ensino Superior (IES). |
| **Usuários Finais** | Alunos, Professores e Administradores da IES. |

## 3. Metas de Sucesso (KPIs)

O sucesso será medido pela eficácia da IES em responder e resolver as necessidades da comunidade.

| KPI (Métrica) | Descrição | Meta Inicial |
| :--- | :--- | :--- |
| **Tempo Médio de Resposta (TMR)** | Média de tempo entre a criação de uma solicitação e a primeira resposta do administrador/responsável. | **TMR abaixo de 4 horas** para 90% das solicitações. |
| **Tempo Médio de Resolução (TMRs)** | Média de tempo entre a criação de uma solicitação e a marcação como 'Resolvida'. | **TMRs abaixo de 48 horas** para solicitações críticas. |
| **Taxa de Engajamento** | % de Alunos e Professores ativos (registrando solicitações/feedback) mensalmente. | 50% de Engajamento Mensal após 3 meses de lançamento. |

---

## 4. Funcionalidades Chave (Épicos)

| ID do Épico | Título | Descrição |
| :--- | :--- | :--- |
| **EPIC-100** | Gestão de Usuários e Perfis (Geral) | Implementar a estrutura de autenticação e perfis, garantindo que Alunos, Professores e Administradores tenham acesso e permissões adequadas. |
| **EPIC-200** | Módulo de Solicitação e Assistência (Alunos/Professores) | Permitir que os usuários finais criem solicitações de assistência sem limites de categoria, como apoio à locomoção, intérprete de libras, questões acadêmicas, etc. Inclui acompanhamento do status. |
| **EPIC-300** | Módulo de Feedback Estruturado (Alunos/Professores) | Permitir que os usuários forneçam feedback contínuo sobre didática, infraestrutura, serviços e outros pontos de melhoria, com opções de categorização e anonimato. |
| **EPIC-400** | Dashboard e Gestão Administrativa (Administrador) | Criar a interface para os Administradores receberem, visualizarem, analisarem, atribuírem e gerenciarem o ciclo de vida completo de todas as solicitações e feedbacks. **Foco em atingir o KPI de resposta rápida.** |
| **EPIC-500** | Comunicação e Notificações (Geral) | Implementar um sistema de notificação em tempo real para manter os usuários informados sobre o status de suas requisições e para avisos gerais da IES. |

---

## 5. Backlog Refinado (Histórias de Usuário)

### US-201: Criação de Nova Solicitação de Assistência

| Campo | Detalhe |
| :--- | :--- |
| **Épico Pai** | EPIC-200: Módulo de Solicitação e Assistência |
| **Prioridade (MoSCoW)** | MUST HAVE (Deve Ter) |
| **Descrição** | **Como um** **Aluno** ou **Professor**, **eu quero** uma tela simples e intuitiva para **criar e enviar uma nova solicitação de assistência**, **para que eu possa** rapidamente comunicar minhas necessidades específicas à IES e garantir que o processo de **resposta rápida** seja iniciado imediatamente. |

#### Critérios de Aceitação (CAs)

| ID do CA | Critério de Aceitação |
| :--- | :--- |
| **CA 201.1** | O sistema deve apresentar um formulário de criação com campos obrigatórios: **Título**, **Descrição** e uma seleção do **Tipo de Solicitação** (ex: Apoio à Locomoção, Interpretação de Libras, Outros). |
| **CA 201.2** | O formulário deve permitir que o usuário adicione **anexos** (arquivos de imagem ou documento) para fornecer contexto à solicitação (limite de 3 anexos por solicitação). |
| **CA 201.3** | O campo **Descrição** deve permitir texto livre para cobrir qualquer tipo de necessidade não listada, mantendo o requisito de **solicitações abertas**. |
| **CA 201.4** | Após o envio, o usuário deve receber uma **notificação de confirmação** que inclua um número de protocolo único (Ex: SOL-2025-0001) e o tempo médio esperado para a primeira resposta (KPI). |
| **CA 201.5** | Imediatamente após o envio, a solicitação deve ser visível no **Dashboard Administrativo** (EPIC-400) e o administrador responsável deve ser **notificado** em tempo real. |

### US-202: Acompanhamento e Interação em Solicitações Ativas

| Campo | Detalhe |
| :--- | :--- |
| **Épico Pai** | EPIC-200: Módulo de Solicitação e Assistência |
| **Prioridade (MoSCoW)** | MUST HAVE (Deve Ter) |
| **Descrição** | **Como um Aluno** ou **Professor**, **eu quero** visualizar uma lista de todas as minhas solicitações ativas e a capacidade de interagir com cada uma delas, **para que eu possa** monitorar o progresso (status), receber a comunicação da IES e responder a dúvidas ou fornecer informações adicionais. |

#### Critérios de Aceitação (CAs)

| ID do CA | Critério de Aceitação |
| :--- | :--- |
| **CA 202.1** | Deve existir uma tela ("Minhas Solicitações") que exiba uma lista cronológica de todas as solicitações enviadas pelo usuário (ativas e resolvidas). |
| **CA 202.2** | Cada item da lista deve mostrar o **Título**, o **Status Atual** (ex: Aberto, Em Análise, Em Execução, Resolvido) e a **data/hora da última atualização** de forma clara. |
| **CA 202.3** | Ao selecionar uma solicitação, o usuário deve visualizar uma **linha do tempo de eventos** (histórico) que registre todas as mudanças de status e comunicações internas da IES, garantindo transparência. |
| **CA 202.4** | O usuário deve poder **adicionar comentários/mensagens** e novos **anexos** a uma solicitação ativa, e essa nova informação deve notificar o administrador responsável (garantindo o fluxo de comunicação de duas vias). |
| **CA 202.5** | O usuário deve ser capaz de **marcar uma solicitação como resolvida** por conta própria, caso o administrador ainda não o tenha feito, ou solicitar a **reabertura** de uma solicitação resolvida dentro de 7 dias. |

### US-401: Visualização e Atribuição de Novas Solicitações

| Campo | Detalhe |
| :--- | :--- |
| **Épico Pai** | EPIC-400: Dashboard e Gestão Administrativa |
| **Prioridade (MoSCoW)** | MUST HAVE (Deve Ter) |
| **Descrição** | **Como um Administrador** da IES, **eu quero** um **dashboard claro e atualizado em tempo real** que me alerte imediatamente sobre novas solicitações de assistência e me permita **atribuir e iniciar a análise** rapidamente, **para que eu possa** garantir que o Tempo Médio de Resposta (TMR) da IES seja atingido. |

#### Critérios de Aceitação (CAs) e Refinamentos

| ID do CA | Critério de Aceitação | Refinamento do PO |
| :--- | :--- | :--- |
| **CA 401.1** | O dashboard deve ter um filtro "Novas Solicitações" que exiba apenas pedidos no status **"Aberto"** ou **"Não Visto"** e que tenha um contador de urgência piscando ou destacado. | N/A |
| **CA 401.2** | A lista de solicitações deve ser **ordenável e filtrável** por: Data de Criação, Tipo de Solicitação e, mais importante, **Tempo Restante para Resposta** (destacando as que estão próximas de violar o TMR de 4 horas). | **O Back-End deve expor um campo calculado (Ex: `time_to_tmm_breach`) em minutos ou segundos para que o Front-End possa fazer a ordenação precisa e destaque de cor.** |
| **CA 401.3** | Ao clicar em uma nova solicitação, o Administrador deve ver todos os detalhes (Título, Descrição, Anexos e dados do Aluno/Professor), e o status da solicitação deve ser alterado automaticamente para **"Em Análise"**. | N/A |
| **CA 401.4** | O Administrador deve ter um campo de ação imediata para **Atribuir** a solicitação a outro membro da equipe de gestão (com um seletor de usuários cadastrados) e adicionar uma nota interna de acompanhamento. | N/A |
| **CA 401.5** | O Administrador deve conseguir enviar uma **primeira resposta** diretamente ao usuário através de um campo de chat/comentário, e esta ação deve zerar o contador do TMR. | **O Architect deve confirmar que a ação que envia a primeira resposta também atualiza o campo `first_response_at` no MySQL de forma atômica e dispara a notificação em tempo real para o usuário (via WebSocket).** |

---

## 6. Sumário das Decisões de Arquitetura

Este sumário técnico foi validado e está alinhado com os requisitos de **tempo real** e **resposta rápida**.

| Camada | Tecnologia Principal | Motivação |
| :--- | :--- | :--- |
| **Front-End** | **Angular** com **RxJS** e **Angular Material** | Estrutura robusta, forte tipagem, e gerenciamento de estado reativo para interfaces em tempo real (Dashboard Admin e Acompanhamento). |
| **Back-End (Serviços)** | **Node.js/Express** com **Socket.IO** | Melhor escolha para I/O-bound e comunicação em **tempo real** (WebSockets), crucial para o KPI de TMR. |
| **Banco de Dados Principal** | **MySQL (InnoDB)** | Armazenamento persistente e transacional das Solicitações, Usuários e Histórico de Eventos (`EventHistory`), essenciais para o cálculo do TMR. |
| **Banco de Dados Secundário** | **Redis** | Utilizado para *caching* de alta velocidade, sessões e gerenciamento de estado de conexão, otimizando a performance do Dashboard Admin. |