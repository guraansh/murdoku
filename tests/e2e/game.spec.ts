import { test, expect } from '@playwright/test';
import { CASES } from '../../src/game/cases';
import { CHAPTERS, chapterOf } from '../../src/game/campaign';
import { coordinate, culprit, getHint, placementProblem, violations } from '../../src/game/engine';

async function tapPerson(page: import('@playwright/test').Page, id: string) {
  const person = page.getByTestId(`person-${id}`);
  // React Native Web nests the horizontal tray inside the page scroller. Centering
  // the target first avoids the page scroller aligning it beneath the notebook.
  await person.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'center' }));
  await person.click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'A Very Quiet Evening', exact: true }),
  ).toBeVisible();
});

test('the first scene renders without runtime errors or horizontal clipping', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.reload();
  await expect(page.getByTestId('cell-35')).toBeVisible();
  await expect(page.getByTestId('placement-count')).toHaveText('0/6 placed');
  for (const room of CASES[0].rooms)
    await expect(page.getByTestId(`room-label-${room.id}`)).toHaveText(room.name);
  await expect(page.getByTestId('room-legend')).toHaveCount(0);
  const board = await page.getByTestId('cell-35').boundingBox();
  expect(board!.x + board!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-game.png`, fullPage: true });
});

test('room labels stay separated from neighboring rooms and furniture', async ({ page }) => {
  const puzzle = CASES[80];
  await page.getByRole('button', { name: 'Back to case files', exact: true }).click();
  await page.getByTestId('chapter-9').click();
  await page.getByTestId(`open-case-${puzzle.id}`).click();
  await expect(page.getByRole('heading', { name: puzzle.title, exact: true })).toBeVisible();

  const intersects = (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  const labels = await Promise.all(
    puzzle.rooms.map(
      async (room) =>
        [room.id, await page.getByTestId(`room-label-${room.id}`).boundingBox()] as const,
    ),
  );
  for (let index = 0; index < labels.length; index += 1) {
    expect(labels[index][1]).toBeTruthy();
    for (let other = index + 1; other < labels.length; other += 1) {
      expect(intersects(labels[index][1]!, labels[other][1]!)).toBe(false);
    }
  }
  for (const object of puzzle.furniture) {
    const tile = await page.getByTestId(`cell-${object.cell}`).boundingBox();
    expect(tile).toBeTruthy();
    for (const [, label] of labels) expect(intersects(label!, tile!)).toBe(false);
  }
});

test('tutorial, placement rules, marks and undo work together', async ({ page }) => {
  await page.getByRole('button', { name: 'How to play', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A mystery in every square.' })).toBeVisible();
  await page.getByRole('button', { name: 'Let’s investigate' }).click();
  await expect(page.getByText('A new detective? Your first clue is right here.')).toHaveCount(0);
  await page.getByTestId('cell-1').click();
  await expect(page.getByText(/writing desk occupies this square/)).toBeVisible();
  await tapPerson(page, 'iris');
  await page.getByTestId('cell-33').click();
  await expect(page.getByTestId('cell-33')).toHaveAttribute('aria-label', /Iris/);
  await tapPerson(page, 'ada');
  await page.getByTestId('cell-32').click();
  await expect(page.getByText(/Iris is already in row 6/)).toBeVisible();
  await page.getByRole('button', { name: 'Toggle pencil marks' }).click();
  await page.getByTestId('cell-2').click();
  await expect(page.getByTestId('cell-2')).toHaveAttribute('aria-label', /marked empty/);
  await page.getByRole('button', { name: 'Undo last move' }).click();
  await expect(page.getByTestId('cell-2')).not.toHaveAttribute('aria-label', /marked empty/);
  await page.getByRole('button', { name: 'Toggle pencil marks' }).click();
  const wrongCell = Array.from({ length: 36 }, (_, cell) => cell).find(
    (cell) =>
      !placementProblem(CASES[0], { iris: 33 }, 'ada', cell) &&
      violations(CASES[0], { iris: 33, ada: cell }).includes(
        "Ada's position contradicts their statement.",
      ),
  )!;
  await page.getByTestId(`cell-${wrongCell}`).click();
  await page.getByRole('button', { name: 'Check scene', exact: true }).click();
  await expect(page.getByText("Ada's position contradicts their statement.")).toBeVisible();
});

test('placements, reviewed clues, marks, hints and undo history survive a reload', async ({
  page,
}) => {
  const hint = getHint(CASES[0], {})!;
  const hintPerson = CASES[0].people.find((person) => person.id === hint.person)!;
  const square = coordinate(hint.cell!, CASES[0].size);
  await page.getByRole('button', { name: 'Get a hint' }).click();
  await page.getByRole('button', { name: 'Reveal a hint' }).click();
  await expect(page.getByText(new RegExp(`${hintPerson.name} belongs at ${square}`))).toBeVisible();
  await page.getByRole('button', { name: `Show ${square} on the board` }).click();
  await page.getByTestId(`cell-${hint.cell}`).click();
  await page.getByRole('checkbox', { name: `Mark ${hintPerson.name}'s clue as reviewed` }).click();
  await expect(
    page.getByRole('checkbox', { name: `Mark ${hintPerson.name}'s clue as reviewed` }),
  ).toBeChecked();
  await page.getByRole('button', { name: 'Toggle pencil marks' }).click();
  await page.getByTestId('cell-2').click();
  await expect
    .poll(async () =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('@murdoku/notebook/v1')!).sessions.briarwood.marks,
      ),
    )
    .toEqual([2]);
  await page.reload();
  await expect(page.getByTestId('placement-count')).toHaveText('1/6 placed');
  await expect(
    page.getByRole('checkbox', { name: `Mark ${hintPerson.name}'s clue as reviewed` }),
  ).toBeChecked();
  await expect(page.getByTestId('cell-2')).toHaveAttribute('aria-label', /marked empty/);
  await page.getByRole('button', { name: 'Undo last move' }).click();
  await expect(page.getByTestId('cell-2')).not.toHaveAttribute('aria-label', /marked empty/);
  await page.getByRole('button', { name: 'Get a hint' }).click();
  await expect(page.getByText('1 hint used in this case')).toBeVisible();
});

test('a case in each difficulty can be completed, with progression and saved results', async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const representatives = [CASES[0], CASES[20], CASES[40], CASES[60], CASES[99]];
  for (const [index, puzzle] of representatives.entries()) {
    if (index > 0) {
      await page.getByTestId(`chapter-${chapterOf(puzzle)}`).click();
      await page.getByTestId(`open-case-${puzzle.id}`).click();
    }
    if (index === 4) {
      await expect(page.getByText(puzzle.furniture[0].name, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Furniture key', exact: true }).click();
      await expect(page.getByText(puzzle.furniture[0].name, { exact: true })).toBeHidden();
      await page.getByRole('button', { name: 'Furniture key', exact: true }).click();
      const square = await page.getByTestId('cell-0').boundingBox();
      expect(square!.width).toBeGreaterThanOrEqual(44);
      const portrait = await page.getByTestId(`person-${puzzle.people[8].id}`).boundingBox();
      expect(portrait!.width).toBeGreaterThanOrEqual(44);
      expect(portrait!.height).toBeLessThanOrEqual(90);
      await page.screenshot({
        path: `artifacts/${testInfo.project.name}-master-case.png`,
        fullPage: true,
      });
    }
    for (const [person, cell] of Object.entries(puzzle.solution)) {
      await tapPerson(page, person);
      await page.getByTestId(`cell-${cell}`).click();
    }
    await page.getByRole('button', { name: 'Solve case', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'So, who did it?' })).toBeVisible();
    const killer = culprit(puzzle, puzzle.solution)!;
    if (index === 0) {
      await page.getByTestId('accuse-felix').click();
      await page.getByRole('button', { name: 'Make your accusation' }).click();
      await expect(page.getByText(/Look again: the killer/)).toBeVisible();
    }
    await page.getByTestId(`accuse-${killer}`).click();
    await page.getByRole('button', { name: 'Make your accusation' }).click();
    await expect(page.getByRole('heading', { name: 'Case closed.' })).toBeVisible();
    if (index === 0)
      await page.screenshot({ path: `artifacts/${testInfo.project.name}-solved.png` });
    if (index === 0) {
      await page.getByTestId('next-case').click();
      await expect(page.getByRole('heading', { name: CASES[1].title, exact: true })).toBeVisible();
      await expect(page.getByTestId('placement-count')).toHaveText('0/6 placed');
      await page.getByRole('button', { name: 'Back to case files', exact: true }).click();
    } else {
      if (index === 4) {
        await expect(page.getByTestId('next-case')).toHaveCount(0);
        await expect(page.getByText(/95 earlier mysteries are still waiting/)).toBeVisible();
      }
      await page.getByRole('button', { name: 'Back to the case files' }).click();
    }
    await expect(page.getByText(`${index + 1} of 100 cases closed`)).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-casebook.png`,
    fullPage: false,
  });
  await page.reload();
  await expect(page.getByTestId('placement-count')).toHaveText('9/9 placed');
  await page.getByRole('button', { name: 'Case closed', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Case closed.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('all 100 case files are reachable through ten chapters', async ({ page }) => {
  await page.getByRole('button', { name: 'Back to case files', exact: true }).click();
  await expect(page.getByText('0 of 100 cases closed')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled();
  const reached: string[] = [];
  for (const chapter of CHAPTERS) {
    await page.getByTestId(`chapter-${chapter.number}`).click();
    await expect(page.getByRole('heading', { name: chapter.name, exact: true })).toBeVisible();
    await expect(page.getByTestId(`chapter-${chapter.number}`)).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const cards = page.locator('[data-testid^="open-case-"]');
    await expect(cards).toHaveCount(10);
    reached.push(
      ...(await cards.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-testid')!),
      )),
    );
  }
  expect(new Set(reached).size).toBe(100);
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByTestId('open-case-case-100').click();
  await expect(
    page.getByRole('heading', { name: 'The Hundredth Case', exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('placement-count')).toHaveText('0/9 placed');
});

test('pause freezes the timer, and corrupt local data recovers safely', async ({ page }) => {
  await page.getByRole('button', { name: 'Pause investigation' }).click();
  const before = await page.getByTestId('timer').textContent();
  await page.waitForTimeout(2100);
  expect(await page.getByTestId('timer').textContent()).toBe(before);
  await page.getByRole('button', { name: 'Resume investigation' }).click();
  await expect(page.getByTestId('timer')).not.toHaveText(before!);
  await page.evaluate(() => localStorage.setItem('@murdoku/notebook/v1', '{broken'));
  await page.reload();
  await expect(page.getByTestId('placement-count')).toHaveText('0/6 placed');
});
