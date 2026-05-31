# Testes Automatizados — Quantum Quiz

Suíte de testes end-to-end com **Playwright** que abre um navegador de verdade e simula um usuário real (cliques, digitação, troca de aba, etc.).

## Pré-requisitos (primeira vez)

Na pasta do projeto, instale as dependências e baixe o navegador:

```bash
npm install
npx playwright install chromium
```

> O `npx playwright install` baixa o Chromium que o Playwright usa. Precisa ser feito uma vez só.

## Como rodar

```bash
npm test
```

Isso sobe o servidor Vite automaticamente, abre o Chromium em segundo plano e executa os 12 testes. Ao final mostra o resumo no terminal.

### Modo visual (recomendado para ver acontecendo)

```bash
npm run test:ui
```

Abre a interface do Playwright onde você vê cada passo do teste sendo executado, pode pausar, voltar e inspecionar o que falhou.

### Ver o relatório detalhado

```bash
npm run test:report
```

Abre um relatório HTML com prints e vídeos dos testes que falharam.

## O que é testado

**Área do Professor** (`tests/professor.spec.js`)
- Bloqueio de acesso com senha errada
- Acesso liberado com senha correta
- Criação de avaliação pela interface
- Configuração de tentativas e segurança
- Presença dos 5 tipos de questão

**Fluxo do Aluno** (`tests/aluno.spec.js`)
- Validação de campos obrigatórios
- Validação de nome completo e e-mail
- Realização completa da avaliação do início ao fim
- Registro do resultado com a nota correta
- Bloqueio de segunda tentativa quando o limite é 1

**Segurança e Dashboard** (`tests/seguranca.spec.js`)
- Detecção de troca de aba, registro de ocorrências e bloqueio automático
- Exibição de resultados e do log de segurança no painel do professor

## Observação

Os testes limpam o armazenamento local antes de cada um, então rodam sempre num estado limpo e não interferem nos seus dados reais de uso.
