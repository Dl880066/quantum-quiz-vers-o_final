import { test, expect } from '@playwright/test';
import { limparDados, criarAvaliacaoViaStorage, passarTutorial } from './helpers.js';

test.describe('Fluxo do Aluno', () => {

  test.beforeEach(async ({ page }) => {
    await limparDados(page);
    await criarAvaliacaoViaStorage(page);
  });

  test('valida campos obrigatórios na identificação', async ({ page }) => {
    await page.goto('http://localhost:5173/QuizAluno');
    await expect(page.getByRole('heading', { name: 'Identificação' })).toBeVisible();

    await page.getByRole('button', { name: /Continuar para a Avaliação/ }).click();
    await expect(page.getByText('Nome é obrigatório')).toBeVisible();
    await expect(page.getByText('E-mail é obrigatório')).toBeVisible();
  });

  test('exige nome completo (validação JS)', async ({ page }) => {
    await page.goto('http://localhost:5173/QuizAluno');
    // Nome incompleto + e-mail VÁLIDO: o navegador não bloqueia o submit,
    // então a validação JS roda e mostra o erro do nome.
    await page.locator('#name').fill('João');
    await page.locator('#email').fill('joao@teste.com');
    await page.getByRole('button', { name: /Continuar para a Avaliação/ }).click();

    const erros = page.locator('p.text-pink-400');
    await expect(erros.first()).toBeVisible({ timeout: 5000 });
    const tudo = (await erros.allTextContents()).join(' | ');
    expect(tudo).toContain('Digite seu nome completo');
  });

  test('valida e-mail pela checagem nativa do navegador', async ({ page }) => {
    await page.goto('http://localhost:5173/QuizAluno');
    await page.locator('#name').fill('João Silva');
    await page.locator('#email').fill('email-invalido');
    await page.getByRole('button', { name: /Continuar para a Avaliação/ }).click();

    // O input type="email" aciona a validação nativa do navegador, que bloqueia o envio.
    // Confirmamos que o campo é considerado inválido pelo navegador.
    const emailValido = await page.locator('#email').evaluate(el => el.checkValidity());
    expect(emailValido).toBe(false);
    // E que permanecemos na tela de identificação (não avançou para o tutorial).
    await expect(page.getByRole('heading', { name: 'Identificação' })).toBeVisible();
  });

  test('aluno completa a avaliação inteira', async ({ page }) => {
    await page.goto('http://localhost:5173/QuizAluno');

    await page.locator('#name').fill('Maria Santos');
    await page.locator('#email').fill('maria@teste.com');
    await page.getByRole('button', { name: /Continuar para a Avaliação/ }).click();

    await passarTutorial(page);

    // Questão 1 (múltipla escolha)
    await expect(page.getByText('Questão 1 de 2')).toBeVisible();
    await page.getByText('Brasília').click();
    await page.getByRole('button', { name: 'Confirmar Resposta' }).click();

    // Questão 2 (V/F) — usa o botão exato VERDADEIRO (não o texto do botão de confirmar)
    await expect(page.getByText('Questão 2 de 2')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'VERDADEIRO', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar Resposta' }).click();

    await expect(page.getByText('Avaliação Concluída!')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Parabéns, Maria/)).toBeVisible();
  });

  test('registra o resultado no armazenamento após concluir', async ({ page }) => {
    await page.goto('http://localhost:5173/QuizAluno');
    await page.locator('#name').fill('Carlos Lima');
    await page.locator('#email').fill('carlos@teste.com');
    await page.getByRole('button', { name: /Continuar para a Avaliação/ }).click();
    await passarTutorial(page);

    await page.getByText('Brasília').click();
    await page.getByRole('button', { name: 'Confirmar Resposta' }).click();
    await page.getByRole('button', { name: 'VERDADEIRO', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar Resposta' }).click();
    await expect(page.getByText('Avaliação Concluída!')).toBeVisible({ timeout: 5000 });

    const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('qz_attempts') || '[]'));
    expect(attempts.length).toBe(1);
    expect(attempts[0].student_name).toBe('Carlos Lima');
    expect(attempts[0].score).toBe(10);
    expect(attempts[0].attempt_number).toBe(1);
  });
});

test.describe('Controle de Tentativas', () => {

  test('bloqueia segunda tentativa quando o limite é 1', async ({ page }) => {
    await limparDados(page);
    const quizId = await criarAvaliacaoViaStorage(page, { maxAttempts: 1 });

    await page.evaluate((id) => {
      const att = JSON.parse(localStorage.getItem('qz_attempts') || '[]');
      att.push({ id: 'prev', quiz_id: id, student_email: 'repetido@teste.com', score: 5, attempt_number: 1, created_date: new Date().toISOString() });
      localStorage.setItem('qz_attempts', JSON.stringify(att));
    }, quizId);

    await page.goto('http://localhost:5173/QuizAluno');
    await page.locator('#name').fill('Aluno Repetido');
    await page.locator('#email').fill('repetido@teste.com');
    await page.getByRole('button', { name: /Continuar para a Avaliação/ }).click();

    await expect(page.getByText(/atingiu o limite de tentativas/)).toBeVisible();
  });
});