import { test, expect } from '@playwright/test';
import { CASES } from '../../src/game/cases';
import { newSave } from '../../src/game/engine';

test('small master scene offers larger targets and labelled rooms without losing controls', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const puzzle = CASES[99];
  await page.addInitScript(
    (save) => localStorage.setItem('@murdoku/notebook/v1', JSON.stringify(save)),
    newSave(puzzle.id),
  );
  await page.goto('/');
  const enlarge = page.getByRole('button', { name: 'Larger board squares' });
  await expect(enlarge).toBeVisible();
  await page.getByTestId(`person-${puzzle.people[0].id}`).scrollIntoViewIfNeeded();
  for (const person of puzzle.people) {
    const control = page.getByTestId(`person-${person.id}`);
    await control.scrollIntoViewIfNeeded();
    const box = await control.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await expect(control).toHaveAttribute('aria-label', `Select ${person.name}`);
  }
  await enlarge.click();
  await expect(enlarge).toHaveAttribute('aria-expanded', 'true');
  const square = page.getByTestId('cell-80');
  await square.scrollIntoViewIfNeeded();
  const settingsBox = await page.getByRole('button', { name: 'Settings', exact: true }).boundingBox();
  expect(settingsBox!.x).toBeGreaterThanOrEqual(0);
  expect(settingsBox!.x + settingsBox!.width).toBeLessThanOrEqual(320);
  expect(await page.getByTestId('play-screen').evaluate((element) => element.scrollLeft)).toBe(0);
  const box = await square.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  await expect(square).toHaveAttribute(
    'aria-label',
    new RegExp(puzzle.rooms.find((room) => room.id === puzzle.layout[8][8])!.name),
  );
  await page.screenshot({ path: `artifacts/audit-02-${testInfo.project.name}-large-board.png` });
  await page.getByRole('button', { name: 'Check scene', exact: true }).click();
  await expect(page.getByText(/No contradictions in the evidence so far/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('enlarged browser text keeps support and privacy usable', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'About & support', exact: true }).click();
  // Browser reflow stress test, not an assertion about native Dynamic Type.
  await page.evaluate(() => {
    const entries = [...document.querySelectorAll<HTMLElement>('[role="dialog"] *')]
      .filter((element) =>
        [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        ),
      )
      .map((element) => ({
        element,
        size: parseFloat(getComputedStyle(element).fontSize),
        line: parseFloat(getComputedStyle(element).lineHeight),
      }));
    for (const { element, size, line } of entries) {
      element.style.fontSize = `${size * 1.5}px`;
      element.style.lineHeight = `${(Number.isFinite(line) ? line : size * 1.5) * 1.5}px`;
    }
  });
  await page.getByRole('button', { name: 'Privacy policy', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/audit-03-${testInfo.project.name}-large-text.png` });
  await page.getByRole('button', { name: 'Privacy policy', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Privacy policy', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByTestId('placement-count')).toBeVisible();
});
