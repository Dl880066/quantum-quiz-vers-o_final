import { test, expect } from '@playwright/test';
import { limparDados, loginProfessor, PROFESSOR_PASSWORD } from './helpers.js';

test.describe('Área do Professor', () => {

  test.beforeEach(async ({ page }) => {
    await limparDados(page);
  });

  test('bloqueia acesso com senha errada', async ({ page }) => {
    await page.goto('http://localhost:5173/GerenciarQuiz');
    await page.getByPlaceholder('Senha do professor').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText('Senha incorreta!')).toBeVisible();
  });

  test('permite acesso com senha correta', async ({ page }) => {
    await loginProfessor(page);
    await expect(page.getByText('avaliação(ões) criada(s)')).toBeVisible();
  });

  test('cria uma nova avaliação completa pela interface', async ({ page }) => {
    await loginProfessor(page);
    await page.getByRole('button', { name: /Nova Avaliação/ }).click();
    await expect(page.getByRole('heading', { name: 'Nova Avaliação' })).toBeVisible();

    // Título
    await page.getByPlaceholder(/Avaliação de Português/).fill('Prova de Geografia');

    // Enunciado
    await page.getByPlaceholder('Digite a pergunta aqui...').fill('Qual o maior país do mundo?');

    // Alternativas
    const alts = page.getByPlaceholder(/Alternativa [A-D]/);
    await alts.nth(0).fill('Brasil');
    await alts.nth(1).fill('Rússia');
    await alts.nth(2).fill('China');

    // Marca a 2ª alternativa (Rússia) como correta.
    // Cada alternativa tem um círculo (button redondo) à esquerda do input.
    // Selecionamos os círculos pela classe rounded-full e clicamos no de índice 1.
    const circulos = page.locator('button.rounded-full.border-2');
    await circulos.nth(1).click();

    // Salva
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Volta para a lista e a avaliação aparece
    await expect(page.getByText('Prova de Geografia')).toBeVisible({ timeout: 8000 });
  });

  test('configura tentativas e segurança ao criar', async ({ page }) => {
    await loginProfessor(page);
    await page.getByRole('button', { name: /Nova Avaliação/ }).click();

    await page.getByText('Número limitado').click();
    await expect(page.getByPlaceholder('Ex: 3')).toBeVisible();

    await expect(page.getByText('Segurança e Monitoramento')).toBeVisible();
    await expect(page.getByText(/Máx. de saídas de foco/)).toBeVisible();
    await expect(page.getByText('Ação ao atingir o limite')).toBeVisible();
  });

  test('os 5 tipos de questão estão disponíveis', async ({ page }) => {
    await loginProfessor(page);
    await page.getByRole('button', { name: /Nova Avaliação/ }).click();

    await expect(page.getByRole('button', { name: 'Múltipla Escolha' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verdadeiro / Falso' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preencher Lacuna' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Associar / Arrastar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ordenar Sequência' })).toBeVisible();
  });
});
