import { expect } from '@playwright/test';

export const PROFESSOR_PASSWORD = 'professor123';

/**
 * Limpa todo o armazenamento local antes de cada teste,
 * garantindo um estado limpo e previsível.
 */
export async function limparDados(page) {
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Faz login na área do professor (Gerenciar Avaliações).
 */
export async function loginProfessor(page) {
  await page.goto('http://localhost:5173/GerenciarQuiz');
  await page.getByPlaceholder('Senha do professor').fill(PROFESSOR_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Minhas Avaliações' })).toBeVisible();
}

/**
 * Cria uma avaliação simples de múltipla escolha programaticamente
 * via localStorage (mais rápido e estável do que clicar em tudo).
 * Retorna o id da avaliação criada.
 */
export async function criarAvaliacaoViaStorage(page, opts = {}) {
  return await page.evaluate((o) => {
    const id = `${Date.now()}_test`;
    const quizzes = JSON.parse(localStorage.getItem('qz_quizzes') || '[]');
    quizzes.push({
      id,
      created_date: new Date().toISOString(),
      active: true,
      title: o.title || 'Avaliação de Teste - PIBID',
      description: o.description || 'Criada pelo teste automatizado',
      max_attempts: o.maxAttempts ?? 1,
      max_tab_warnings: o.maxTabWarnings ?? 3,
      security_action: o.securityAction || 'block',
      monitor_fullscreen: true,
      randomize: false,
      questions_to_show: null,
      question_count: 2,
    });
    localStorage.setItem('qz_quizzes', JSON.stringify(quizzes));

    const questions = JSON.parse(localStorage.getItem('qz_questions') || '[]');
    questions.push(
      { id: id + '_q1', quiz_id: id, order: 0, type: 'multiple_choice',
        question: 'Qual a capital do Brasil?', options: ['Rio', 'Brasília', 'São Paulo'], correct_answer: 'Brasília' },
      { id: id + '_q2', quiz_id: id, order: 1, type: 'true_false',
        question: 'A Terra é o terceiro planeta do sistema solar.', options: ['Verdadeiro', 'Falso'], correct_answer: 'Verdadeiro' },
    );
    localStorage.setItem('qz_questions', JSON.stringify(questions));

    // Define como avaliação principal
    localStorage.setItem('qz_config_main_quiz_id', JSON.stringify(id));
    return id;
  }, opts);
}

/**
 * Avança por todas as telas do tutorial até iniciar a avaliação.
 */
export async function passarTutorial(page) {
  // 4 cliques em "Próximo" + 1 em "Começar Quiz"
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /Próximo/ }).click();
  }
  await page.getByRole('button', { name: /Começar Quiz/ }).click();
}
