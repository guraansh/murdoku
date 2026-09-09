import { test, expect } from '@playwright/test';
import { CASES } from '../../src/game/cases';
import { newSave, newSession } from '../../src/game/engine';

test('chapter celebration and share preview contain the correct spoiler-free record', async ({
  page,
}, testInfo) => {
  const save = newSave(CASES[9].id);
  for (const puzzle of CASES.slice(0, 10))
    save.sessions[puzzle.id] = {
      ...newSession(),
      placements: puzzle.solution,
      solved: true,
      elapsed: 123,
      hints: 2,
    };
  await page.addInitScript((save) => {
    localStorage.setItem('@murdoku/notebook/v1', JSON.stringify(save));
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: unknown) => {
        (window as any).sharedResult = data;
      },
    });
  }, save);
  await page.goto('/');
  await page.getByRole('button', { name: 'Case closed', exact: true }).click();
  await expect(page.getByTestId('chapter-celebration')).toContainText('Chapter 1 complete!');
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-chapter-complete.png` });
  await page.getByRole('button', { name: 'Share spoiler-free result' }).click();
  await expect(page.getByTestId('share-result-card')).toContainText('Case 010 closed');
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-share-result.png` });
  await page.getByRole('button', { name: 'Share this result' }).click();
  const shared = await page.evaluate(() => (window as any).sharedResult);
  expect(shared.text).toBe(
    'Cluewoven\nCase 010 closed\nTime: 02:03\nHints: 2\nA little logic. A little mystery.',
  );
  for (const person of CASES[9].people) expect(shared.text).not.toContain(person.name);
});

test('a single solved case does not claim chapter completion', async ({ page }) => {
  const save = newSave(CASES[0].id);
  save.sessions[CASES[0].id] = { ...newSession(), placements: CASES[0].solution, solved: true };
  await page.addInitScript(
    (save) => localStorage.setItem('@murdoku/notebook/v1', JSON.stringify(save)),
    save,
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Case closed', exact: true }).click();
  await expect(page.getByTestId('chapter-celebration')).toHaveCount(0);
});

test('practice teaches placement, elimination and accusation without changing the campaign', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'How to play', exact: true }).click();
  await page.getByRole('button', { name: 'Try a practice scene' }).click();
  await page.getByTestId('practice-cell-0').click();
  await expect(page.getByText('Select Nia, then tap A1.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Practice select Nia' }).click();
  await page.getByTestId('practice-cell-0').click();
  await page.getByRole('button', { name: 'Practice mark', exact: true }).click();
  await page.getByTestId('practice-cell-1').click();
  await expect(page.getByTestId('practice-cell-1')).toHaveAttribute('aria-label', /marked empty/);
  await page.getByRole('button', { name: 'Practice select Theo' }).click();
  await page.getByTestId('practice-cell-8').click();
  await page.getByRole('button', { name: 'Practice select Victim' }).click();
  await page.getByTestId('practice-cell-4').click();
  await page.getByRole('button', { name: 'Accuse Theo' }).click();
  await expect(page.getByText(/Theo is in the Hall. Look for/)).toBeVisible();
  await page.getByRole('button', { name: 'Accuse Nia' }).click();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-practice.png` });
  await page.getByRole('button', { name: 'Start investigating' }).click();
  await expect(page.getByTestId('placement-count')).toHaveText('0/6 placed');
  await page.getByRole('button', { name: 'How to play', exact: true }).click();
  await page.getByRole('button', { name: 'Try a practice scene' }).click();
  await expect(page.getByRole('heading', { name: 'Place your first suspect' })).toBeVisible();
});

test('support and offline privacy are reachable from settings', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'About & support', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'About & support', exact: true })).toBeVisible();
  await expect(page.getByText('guraanshpunjabi@gmail.com', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Report a puzzle problem' })).toBeVisible();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-support.png` });
  await page.getByRole('button', { name: 'Privacy policy', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Privacy policy', exact: true })).toBeVisible();
  await expect(page.getByText('Your game stays on your device', { exact: true })).toBeVisible();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-privacy.png` });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByTestId('placement-count')).toHaveText('0/6 placed');
});
