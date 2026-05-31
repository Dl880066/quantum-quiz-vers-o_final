import { test, expect } from '@playwright/test';
import { limparDados, criarAvaliacaoViaStorage, passarTutorial, PROFESSOR_PASSWORD } from './helpers.js';

test.describe('Segurança — Detecção de troca de aba', () => {

  test('registra ocorrências e bloqueia ao atingir o limite', async ({ page, context }) => {
    await limparDados(page);
    // Limite baixo (2 avisos) e ação de bloquear, para o teste ser rápido
    await criarAvaliacaoViaStorage(page, { maxTabWarnings: 2, securityAction: 'block' });

    await page.goto('http://localhost:5173/QuizAluno');
    await page.locator('#name').fill('Aluno Vigiado');
    await page.locator('#email').fill('vigiado@teste.com');
    await page.getByRole('button', { name: /Continuar para a Avaliação/ }).click();
    await passarTutorial(page);
    await expect(page.getByText('Questão 1 de 2')).toBeVisible();

    // Simula troca de aba disparando o evento de visibilidade duas vezes
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
        document.dispatchEvent(new Event('visibilitychange'));
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForTimeout(300);
    }

    // Ao atingir 2 ocorrências, a avaliação é bloqueada
    await expect(page.getByText('Avaliação Bloqueada')).toBeVisible({ timeout: 5000 });

    // E as ocorrências ficaram registradas no log de segurança
    const logs = await page.evaluate(() => JSON.parse(localStorage.getItem('qz_security_log') || '[]'));
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs.every(l => l.event === 'tab_switch')).toBeTruthy();
  });
});

test.describe('Dashboard do Professor', () => {

  test('exibe resultados e logs de segurança', async ({ page }) => {
    await limparDados(page);
    const quizId = await criarAvaliacaoViaStorage(page, { title: 'Prova X - PIBID' });

    // Insere um resultado e um log diretamente
    await page.evaluate((id) => {
      localStorage.setItem('qz_attempts', JSON.stringify([{
        id: 'a1', quiz_id: id, quiz_title: 'Prova X - PIBID',
        student_name: 'Ana Paula', student_email: 'ana@teste.com',
        score: 8, max_score: 10, attempt_number: 1, tab_switches: 1,
        duration_minutes: 4.5, created_date: new Date().toISOString(),
      }]));
      localStorage.setItem('qz_security_log', JSON.stringify([{
        id: 'l1', quiz_id: id, student_name: 'Ana Paula', student_email: 'ana@teste.com',
        event: 'tab_switch', question_index: 0, timestamp: new Date().toISOString(),
      }]));
    }, quizId);

    // Login
    await page.goto('http://localhost:5173/QuizProfessor');
    await page.getByPlaceholder('Senha').fill(PROFESSOR_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Aba de resultados
    await expect(page.getByText('Ana Paula')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('ana@teste.com')).toBeVisible();
    await expect(page.getByText('8.00', { exact: true })).toBeVisible();

    // Aba de segurança
    await page.getByRole('button', { name: /Log de Segurança/ }).click();
    await expect(page.getByText('Troca de aba')).toBeVisible();
  });
});
