# Documento de Arquitetura Técnica - ConectaIES

## 1. Visão Geral e Alinhamento com Requisitos

O design arquitetônico do ConectaIES visa construir uma plataforma robusta, escalável e otimizada para a **comunicação em tempo real**, suportando o principal **KPI de Resposta Rápida (TMR)** definido no PRD.

| Requisito de Negócio (KPI) | Solução Arquitetural |
| :--- | :--- |
| **Tempo Médio de Resposta (TMR < 4h)** | Uso de **WebSockets (Socket.IO)** e **Redis** para notificações instantâneas de novas solicitações no Dashboard Admin. |
| **Interface Inclusiva/Acessível** | Front-End em **Angular** com **Angular Material** (que possui forte suporte a Acessibilidade - A11y). |
| **Transparência e Histórico** | Modelagem de dados com a tabela `EventHistory` no **MySQL** para rastrear todas as alterações de status e comunicações. |

---

## 2. Arquitetura Front-End (Angular)

O Front-End é projetado como uma **Single Page Application (SPA)** de alta performance, baseada na robustez do ecossistema Angular.

### Stack Tecnológica

| Componente | Tecnologia Selecionada | Justificativa |
| :--- | :--- | :--- |
| **Framework Base** | **Angular (Última Versão)** | Estrutura completa, forte tipagem e alinhamento com a preferência de desenvolvimento para projetos complexos e de longo prazo. |
| **Linguagem** | **TypeScript** | Nativo do Angular, garante segurança e manutenibilidade. |
| **Estilização** | **Angular Material** e/ou **Tailwind CSS** | Angular Material simplifica o cumprimento das diretrizes de **WCAG/Acessibilidade** e oferece componentes prontos. Tailwind pode ser usado para customizações rápidas. |
| **Gerenciamento de Estado** | **RxJS** (Serviços e Observables) | Essencial para lidar com os fluxos de dados assíncronos e o consumo dos eventos de WebSockets para atualizações em tempo real. |

### Estrutura e Comunicação

| Estrutura Angular | Exemplo | Função |
| :--- | :--- | :--- |
| **Módulos de Domínio** | `AdminModule`, `StudentModule`, `SharedModule` | Isolar funcionalidades. O `AdminModule` gerencia o Dashboard (US-401). |
| **Serviços** | `RealTimeNotifierService` | Componente CRÍTICO que inicia a conexão **WebSocket** e expõe *Observables* para o Dashboard Admin e a tela de Acompanhamento de Solicitações. |
| **Comunicação** | **RESTful** para operações CRUD; **WebSockets** para notificações e atualizações de status. | Otimização para a primeira resposta e visualização em tempo real do status das solicitações. |

---

## 3. Arquitetura Back-End (Serviços e Dados)

O Back-End é a fonte da verdade para o sistema, projetado para suportar alta concorrência de I/O e a complexidade do fluxo de gestão.

### Stack Tecnológica

| Componente | Tecnologia Selecionada | Justificativa |
| :--- | :--- | :--- |
| **Linguagem/Framework** | **Node.js com Express** | Excelente desempenho em I/O (operação de entrada/saída), fundamental para lidar com múltiplas conexões de **WebSockets** de forma eficiente. |
| **Banco de Dados Principal** | **MySQL (InnoDB)** | Banco de dados relacional robusto e maduro. Responsável pela **integridade transacional** e persistência de todos os dados do sistema (Solicitações, Usuários, Histórico). |
| **Banco de Dados Secundário** | **Redis** | Essencial para a **Resposta Rápida**. Utilizado para caching de alta velocidade, sessões de usuário e gerenciamento temporário do estado do WebSockets. |
| **Comunicação em Tempo Real** | **Socket.IO** | Biblioteca padrão para implementar comunicação bidirecional em Node.js, garantindo a notificação imediata do Admin (US-401) e do Usuário (US-202). |

### Modelagem de Dados Chave (MySQL)

O foco da modelagem está no rastreamento de tempo para o KPI e na transparência do histórico.

| Tabela Chave | Campos Relevantes para KPI/Transparência | Finalidade |
| :--- | :--- | :--- |
| **Solicitation** | `id`, `user_id`, `status`, `created_at`, **`first_response_at`** | **CRÍTICO:** O campo `first_response_at` é usado diretamente para calcular e medir o **TMR**. |
| **User** | `id`, `tipo_perfil` (Aluno/Prof/Adm), `email` | Gerenciamento de Permissões e Perfis. |
| **EventHistory** | `solicitation_id`, `event_type` (StatusChange, Comment), `timestamp` | Cria a **Linha do Tempo** completa para cada solicitação (CA 202.3), garantindo a transparência. |

### Estratégia de Tempo Real (KPI TMR)

1.  **Gatilho:** Uma nova solicitação é inserida no **MySQL**.
2.  **Ação:** O **Serviço de Solicitações** do Back-End imediatamente envia uma mensagem de **WebSocket** para o **Dashboard Admin** (US-401).
3.  **Visualização:** O Front-End (Angular) recebe a mensagem via RxJS e atualiza o contador de "Novas Solicitações" em tempo real.
4.  **Conclusão TMR:** Quando o Admin executa a primeira resposta (`PATCH /solicitations/{id}`), o Back-End atualiza o campo `first_response_at` no MySQL e notifica o usuário via WebSocket, zerando o contador do TMR.

---

## 4. Infraestrutura e Deployment

1.  **Hospedagem:** Cloud Provider (AWS/Google Cloud/Azure).
2.  **Conteinerização:** Uso de **Docker** para empacotar o Front-End (Angular) e o Back-End (Node.js).
3.  **Orquestração:** **Kubernetes** é a opção de longo prazo para gerenciar a escalabilidade dos serviços, especialmente o cluster de **Socket.IO** para alta disponibilidade.