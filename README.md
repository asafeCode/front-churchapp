# ⛪ Front-ChurchApp

Frontend da aplicação **ChurchApp**, um sistema de gestão para igrejas com controle de acesso por perfil, fluxos administrativos e foco em UX, segurança e escalabilidade.

Este projeto consome a **API ChurchApp (ASP.NET Core)** e foi estruturado seguindo uma **arquitetura orientada a features**, facilitando manutenção, evolução e colaboração em times reais.

---

## 🚀 Visão Geral

O **Front-ChurchApp** é responsável por:

* Autenticação e controle de sessão
* Navegação baseada em perfis (Owner, Admin, Membro)
* Consumo de APIs REST
* Gestão de usuários, convites e fluxos administrativos
* Interface responsiva e previsível
* Separação clara de responsabilidades no frontend

O foco não é apenas “funcionar”, mas **ser sustentável em produção**.

---

## 🛠️ Stack Tecnológica

* ⚛️ **React**
* 🧠 **TypeScript**
* ⚡ **Vite**
* 🎨 **CSS modular**
* 🔐 **Context API** para estado global
* 🧩 **Arquitetura baseada em features**
* 🌐 Integração com APIs REST

---

## 🧱 Arquitetura do Projeto

O projeto segue um **modelo feature-based**, muito usado em aplicações médias e grandes.

### 📂 Estrutura de Pastas

```
src/
├── components/     # Componentes reutilizáveis (UI)
├── contexts/       # Contextos globais (auth, sessão, etc.)
├── features/       # Funcionalidades isoladas por domínio
├── guards/         # Guards de rota e controle de acesso
├── hooks/          # Hooks customizados
├── lib/            # Helpers, configs e abstrações
├── models/         # Tipos, interfaces e contratos
├── services/       # Comunicação com a API (HTTP)
├── App.tsx         # Composição principal da aplicação
├── main.tsx        # Entry point
├── App.css
└── index.css
```

---

## 🧩 Responsabilidade de Cada Camada

### `features/`

Cada feature representa um **caso de uso real do sistema**, contendo:

* Telas
* Componentes específicos
* Regras de UI
* Integração com services

➡️ Exemplo: fluxo de convite, cadastro, perfil, administração.

---

### `contexts/`

Gerencia **estado global**, como:

* Autenticação
* Usuário logado
* Permissões
* Sessão

➡️ Evita prop drilling e mantém previsibilidade.

---

### `guards/`

Responsável por **controle de acesso**:

* Bloqueio de rotas por perfil
* Redirecionamentos automáticos
* Proteção de telas sensíveis

➡️ Reflete diretamente as regras do backend.

---

### `services/`

Camada de comunicação com a API:

* Requests HTTP
* Configuração de headers
* Tokens
* Tratamento de erros

➡️ UI nunca fala direto com a API.

---

### `models/`

Contratos e tipagens:

* DTOs
* Requests
* Responses
* Enums

➡️ Backend e frontend falam a mesma “língua”.

---

### `hooks/`

Hooks customizados para:

* Reuso de lógica
* Abstração de comportamentos
* Código mais limpo nos componentes

---

## 🔐 Controle de Acesso por Perfil

A aplicação trabalha com **perfis bem definidos**:

* **Owner**: gestão de tenants
* **Admin**: operações administrativas
* **Membro**: acesso restrito ao próprio perfil

A UI respeita essas regras usando **guards**, refletindo fielmente o backend.

---

## ▶️ Executando o Projeto

### Pré-requisitos

* Node.js ≥ 16
* npm ou yarn

### Instalação

```bash
git clone https://github.com/asafeCode/front-churchapp.git
cd front-churchapp
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

---

## 🌱 Variáveis de Ambiente

Exemplo de `.env`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 💡 Destaques Técnicos

* Arquitetura orientada a domínio (features)
* Separação clara entre UI, estado, regras e serviços
* Tipagem forte end-to-end
* Controle de acesso no frontend
* Preparado para crescer sem virar spaghetti

---

## 📌 Projeto Relacionado

👉 **Backend:**
[https://github.com/asafeCode/api-churchapp](https://github.com/asafeCode/api-churchapp)

---

## 👤 Autor

**Matheus Asafe**
- Desenvolvedor Backend / Full-Stack
- 🔗 GitHub: [https://github.com/asafeCode](https://github.com/asafeCode)
- 🔗 LinkedIn: [https://www.linkedin.com/in/matheus-asafe](https://www.linkedin.com/in/matheus-asafe)
