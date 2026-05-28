# 🚀 Quantum Quiz 2026 — Versão Local (sem Base44)

## ✅ O que foi adaptado

| Arquivo | O que mudou |
|---|---|
| `src/api/localStore.js` | **NOVO** — substitui o `@base44/sdk`. Salva tudo no `localStorage` |
| `src/api/entities.js` | Reescrito — exporta do `localStore.js` |
| `src/api/base44Client.js` | Stub vazio — sem chamadas externas |
| `src/lib/AuthContext.jsx` | Simplificado — sem autenticação remota |
| `src/lib/PageNotFound.jsx` | Reescrito — sem `base44.auth` |
| `src/pages/QuizAluno.jsx` | Usa `QuizAttempt` local |
| `src/pages/QuizProfessor.jsx` | Usa `QuizAttempt` local |
| `vite.config.js` | Removido `@base44/vite-plugin` |
| `package.json` | Removidas dependências `@base44/*` |

---

## 🛠️ Como rodar no VS Code

### Pré-requisitos
- Node.js 18+ instalado
- Terminal aberto na pasta do projeto

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no navegador.

---

## 📍 Rotas do App

| Rota | Descrição |
|---|---|
| `/` | Tela inicial com navegação |
| `/QuizAluno` | Quiz para o aluno responder |
| `/QuizProfessor` | Dashboard do professor (senha: `professor123`) |

---

## 🔑 Senha do Professor

A senha padrão é `professor123`.

Para alterar, edite a linha no arquivo `src/pages/QuizProfessor.jsx`:
```js
const CORRECT_PASSWORD = 'professor123'; // ← mude aqui
```

---

## 💾 Como os dados são armazenados

Todos os resultados ficam no **localStorage** do navegador, na chave `quantum_quiz_attempts`.

- Cada computador/navegador tem seus próprios dados
- Para exportar: use o botão **Exportar CSV** no dashboard do professor
- Para limpar: use o botão **Limpar Todos os Dados**

---

## 📦 Build para produção

```bash
npm run build
```

A pasta `dist/` gerada pode ser hospedada em qualquer servidor estático (GitHub Pages, Netlify, Vercel, etc.)

