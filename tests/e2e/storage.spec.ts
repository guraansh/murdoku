import { test, expect } from '@playwright/test';
import { CASES } from '../../src/game/cases';
import { newSave, newSession } from '../../src/game/engine';

test('failed notebook reads never overwrite progress and retry restores it', async ({ page }) => {
  const puzzle = CASES[0];
  const saved = newSave(puzzle.id);
  saved.sessions[puzzle.id] = {
    ...newSession(),
    placements: { [puzzle.people[0].id]: puzzle.solution[puzzle.people[0].id] },
    elapsed: 123,
  };
  const raw = JSON.stringify(saved);
  await page.addInitScript(
    ({ raw }) => {
      const key = '@murdoku/notebook/v1';
      localStorage.setItem(key, raw);
      const get = Storage.prototype.getItem;
      const set = Storage.prototype.setItem;
      let attempts = 0;
      (window as any).notebookWrites = 0;
      Storage.prototype.getItem = function (name) {
        if (name === key && attempts++ < 2) throw new Error('Temporary read failure');
        return get.call(this, name);
      };
      Storage.prototype.setItem = function (name, value) {
        if (name === key) (window as any).notebookWrites++;
        return set.call(this, name, value);
      };
    },
    { raw },
  );
  await page.goto('/');
  const retry = page.getByRole('button', { name: 'Retry opening notebook' });
  await expect(retry).toBeVisible();
  await retry.click();
  await expect(retry).toBeVisible();
  expect(await page.evaluate(() => (window as any).notebookWrites)).toBe(0);
  await retry.click();
  await expect(page.getByTestId('placement-count')).toHaveText('1/6 placed');
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('@murdoku/notebook/v1')!),
  );
  expect(restored.sessions[puzzle.id].placements).toEqual(saved.sessions[puzzle.id].placements);
  expect(restored.sessions[puzzle.id].elapsed).toBeGreaterThanOrEqual(123);
});

test('failed writes retain the live game and can be retried', async ({ page }) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    (window as any).failWrites = true;
    Storage.prototype.setItem = function (name, value) {
      if (name === '@murdoku/notebook/v1' && (window as any).failWrites)
        throw new Error('Temporary write failure');
      return set.call(this, name, value);
    };
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Retry saving' })).toBeVisible();
  await page.getByTestId(`cell-${CASES[0].solution[CASES[0].people[0].id]}`).click();
  await expect(page.getByTestId('placement-count')).toHaveText('1/6 placed');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.evaluate(() => {
    (window as any).failWrites = false;
  });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Retry saving' }).click();
  await expect(page.getByRole('button', { name: 'Retry saving' })).toHaveCount(0);
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('@murdoku/notebook/v1')!),
  );
  expect(Object.keys(restored.sessions[CASES[0].id].placements)).toHaveLength(1);
});
