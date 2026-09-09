import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from '../src/game/cases';
import { CHAPTERS, DIFFICULTY_BANDS, chapterOf } from '../src/game/campaign';
import { LEGACY_CASES } from '../src/game/legacyCases';
import { progressiveHint } from '../src/game/hints';
import { initialDomains, rateCase } from '../scripts/authoring/solve';
import { minimumPossibilities } from '../scripts/authoring/enrich';
import {
  coordinate,
  culprit,
  editSession,
  getHint,
  newSession,
  placementProblem,
  restoreSave,
  ruleStatus,
  solvePuzzle,
  undoSession,
  violations,
} from '../src/game/engine';

test('progressive hint eliminations preserve the solution throughout every case', () => {
  for (const puzzle of CASES) {
    const placements: Record<string, number> = {};
    for (let count = 0; count < puzzle.people.length; count++) {
      const lead = progressiveHint(puzzle, placements)!;
      assert.ok(lead);
      const answer = puzzle.solution[lead.reveal.person];
      assert.equal(lead.reveal.cell, answer);
      assert.ok(
        lead.candidates.includes(answer),
        `${puzzle.id}: explanation eliminated the answer`,
      );
      for (const cell of lead.candidates)
        assert.deepEqual(violations(puzzle, { ...placements, [lead.reveal.person]: cell }), []);
      assert.ok(lead.evidence.length);
      placements[lead.reveal.person] = answer;
    }
    assert.equal(progressiveHint(puzzle, placements), null);
  }
});

test('a mistaken placement produces a recovery lead instead of a fabricated position deduction', () => {
  const puzzle = CASES[0];
  const person = puzzle.people[0].id;
  const cell = Array.from({ length: puzzle.size ** 2 }, (_, index) => index).find(
    (cell) => cell !== puzzle.solution[person] && !placementProblem(puzzle, {}, person, cell),
  )!;
  const lead = progressiveHint(puzzle, { [person]: cell })!;
  assert.equal(lead.reveal.person, person);
  assert.equal(lead.reveal.cell, undefined);
  assert.deepEqual(lead.candidates, []);
  assert.ok(lead.deduction.includes('Revisit') || lead.deduction.includes('cannot extend'));
});

test('100 distinct case files retain their order across ten chapters and increasing difficulty bands', () => {
  assert.equal(CASES.length, 100);
  for (const key of ['id', 'title', 'introduction'] as const)
    assert.equal(new Set(CASES.map((puzzle) => puzzle[key])).size, 100, `Duplicate ${key}`);
  const fingerprints = CASES.map((puzzle) =>
    JSON.stringify({
      size: puzzle.size,
      layout: puzzle.layout,
      objects: puzzle.furniture.map((item) => item.cell).sort((a, b) => a - b),
      people: Object.values(puzzle.solution).sort((a, b) => a - b),
    }),
  );
  assert.equal(
    new Set(fingerprints).size,
    100,
    'Cases must be different puzzles, not renamed copies',
  );
  for (const [index, puzzle] of CASES.entries()) {
    assert.equal(puzzle.number, String(index + 1).padStart(3, '0'));
    assert.ok(puzzle.rating && Number.isFinite(puzzle.rating.score));
    if (index > 0 && index % 20 === 0)
      assert.ok(
        puzzle.rating.score >= CASES[index - 1].rating!.score,
        `Difficulty regression at case ${puzzle.number}`,
      );
    assert.equal(chapterOf(puzzle), Math.floor(index / 10) + 1);
  }
  for (const chapter of CHAPTERS) {
    const cases = CASES.filter((puzzle) => chapterOf(puzzle) === chapter.number);
    assert.equal(cases.length, 10);
    assert.equal(Number(cases[0].number), chapter.from);
    assert.equal(Number(cases[9].number), chapter.to);
  }
});

test('difficulty bands increase scene size and deductive load, with no witness giving an exact location', () => {
  let previousAverage = 0;
  for (const [tier, band] of DIFFICULTY_BANDS.entries()) {
    const cases = CASES.slice(band.from - 1, band.to);
    assert.equal(cases.length, 20);
    for (const puzzle of cases) {
      assert.equal(puzzle.difficulty, band.name);
      assert.equal(puzzle.size, band.size);
      assert.deepEqual(puzzle.rating, rateCase(puzzle, tier), `Stale rating for ${puzzle.number}`);
      assert.equal(puzzle.rating!.directClues, 0);
      for (const [index, domain] of initialDomains(puzzle).entries()) {
        if (puzzle.people[index].id !== puzzle.victim)
          assert.ok(
            domain.length >= minimumPossibilities(Number(puzzle.number)),
            'Witnesses must leave multiple possibilities to combine with other evidence',
          );
      }
    }
    const average = cases.reduce((sum, puzzle) => sum + puzzle.rating!.candidates, 0) / 20;
    assert.ok(
      average > previousAverage,
      'Each band should leave more possibilities to reason through',
    );
    previousAverage = average;
  }
});

test('the original three cases and their saved investigations survive campaign expansion', () => {
  const saved = Object.fromEntries(
    LEGACY_CASES.map((puzzle) => [
      puzzle.id,
      { ...newSession(), placements: puzzle.solution, solved: true, hints: 2, elapsed: 123 },
    ]),
  );
  const restored = restoreSave(
    JSON.stringify({ version: 1, activeCase: 'midnight', sessions: saved, tutorialSeen: true }),
    CASES,
  );
  assert.equal(restored.activeCase, 'midnight');
  for (const original of LEGACY_CASES) {
    const current = CASES.find((puzzle) => puzzle.id === original.id)!;
    for (const key of ['solution', 'furniture', 'layout', 'people'] as const)
      assert.deepEqual(current[key], original[key]);
    assert.deepEqual(
      violations(current, original.solution),
      [],
      'Old completed scenes must satisfy the new evidence',
    );
    assert.deepEqual(restored.sessions[original.id], saved[original.id]);
  }
});

for (const puzzle of CASES) {
  test(`${puzzle.title}: the clues yield exactly one independently computed solution`, () => {
    assert.equal(puzzle.people.length, puzzle.size);
    assert.equal(puzzle.clues.length, puzzle.people.length);
    assert.equal(new Set(puzzle.people.map((person) => person.id)).size, puzzle.size);
    assert.deepEqual(
      puzzle.clues.map((clue) => clue.person).sort(),
      puzzle.people.map((person) => person.id).sort(),
    );
    assert.equal(new Set(puzzle.rooms.map((room) => room.id)).size, puzzle.rooms.length);
    assert.equal(new Set(puzzle.furniture.map((item) => item.name)).size, puzzle.furniture.length);
    for (const clue of puzzle.clues) {
      assert.ok(clue.text.length > 0);
      if (clue.person !== puzzle.victim)
        assert.ok(clue.rules.length > 0, 'Every suspect should offer a statement');
      assert.equal(
        new Set(clue.rules.map((rule) => JSON.stringify(rule))).size,
        clue.rules.length,
        'Statements must not repeat identical evidence',
      );
      for (const rule of clue.rules) {
        if (rule.type === 'between') {
          assert.notEqual(rule.first, rule.second);
          for (const id of [rule.first, rule.second])
            assert.ok(puzzle.people.some((person) => person.id === id && id !== clue.person));
        }
        if ('person' in rule)
          assert.ok(
            puzzle.people.some((person) => person.id === rule.person && person.id !== clue.person),
          );
        if ('room' in rule) assert.ok(puzzle.rooms.some((room) => room.id === rule.room));
        if (rule.type === 'oneOfRooms') {
          assert.notEqual(rule.rooms[0], rule.rooms[1]);
          for (const id of rule.rooms) assert.ok(puzzle.rooms.some((room) => room.id === id));
        }
        if (rule.type === 'closerToObject') {
          assert.notEqual(rule.near, rule.far);
          for (const id of [rule.near, rule.far])
            assert.ok(puzzle.furniture.some((object) => object.id === id));
        }
        if ('object' in rule) assert.ok(puzzle.furniture.some((item) => item.id === rule.object));
        assert.equal(ruleStatus(puzzle, clue.person, rule, puzzle.solution), 'met');
      }
    }
    assert.equal(puzzle.layout.length, puzzle.size);
    assert.ok(
      puzzle.layout.every(
        (row) =>
          row.length === puzzle.size &&
          row.every((id) => puzzle.rooms.some((room) => room.id === id)),
      ),
    );
    assert.equal(new Set(puzzle.furniture.map((item) => item.cell)).size, puzzle.furniture.length);
    assert.ok(
      puzzle.furniture.every(
        (item) => Number.isInteger(item.cell) && item.cell >= 0 && item.cell < puzzle.size ** 2,
      ),
    );
    for (const room of puzzle.rooms) {
      const cells = puzzle.layout
        .flat()
        .map((id, cell) => (id === room.id ? cell : -1))
        .filter((cell) => cell >= 0);
      assert.ok(cells.length >= 4);
      const visited = new Set([cells[0]]),
        pending = [cells[0]];
      while (pending.length) {
        const cell = pending.pop()!;
        for (const next of cells)
          if (
            !visited.has(next) &&
            Math.abs(Math.floor(cell / puzzle.size) - Math.floor(next / puzzle.size)) +
              Math.abs((cell % puzzle.size) - (next % puzzle.size)) ===
              1
          ) {
            visited.add(next);
            pending.push(next);
          }
      }
      assert.equal(visited.size, cells.length, `${room.name} must be a connected room`);
    }
    const solutions = solvePuzzle(puzzle);
    assert.equal(solutions.length, 1, JSON.stringify(solutions));
    assert.deepEqual(solutions[0], puzzle.solution);
    assert.deepEqual(violations(puzzle, puzzle.solution), []);
    assert.ok(culprit(puzzle, puzzle.solution));
  });
  test(`${puzzle.title}: every hint leads to the same solvable scene`, () => {
    const placements: Record<string, number> = {};
    while (Object.keys(placements).length < puzzle.people.length) {
      const hint = getHint(puzzle, placements);
      assert.ok(hint && hint.cell !== undefined);
      placements[hint.person] = hint.cell;
      assert.deepEqual(violations(puzzle, placements), []);
    }
    assert.deepEqual(placements, puzzle.solution);
    assert.equal(getHint(puzzle, placements), null);
  });
}

test('row, column, occupied furniture and out-of-bounds placement are rejected', () => {
  const puzzle = CASES[0];
  assert.match(placementProblem(puzzle, { ada: 0 }, 'iris', 2)!, /row 1/);
  assert.match(placementProblem(puzzle, { ada: 0 }, 'iris', 12)!, /column A/);
  assert.match(placementProblem(puzzle, {}, 'ada', 1)!, /Writing desk/i);
  assert.ok(placementProblem(puzzle, {}, 'ada', -1));
  assert.ok(placementProblem(puzzle, {}, 'ada', 36));
  assert.equal(placementProblem(puzzle, { ada: 0 }, 'ada', 2), null);
});

test('beside excludes diagonals and squares across a room boundary', () => {
  const puzzle = CASES[0];
  assert.equal(ruleStatus(puzzle, 'ada', { type: 'beside', object: 'desk' }, { ada: 0 }), 'met');
  assert.equal(ruleStatus(puzzle, 'ada', { type: 'beside', object: 'desk' }, { ada: 8 }), 'broken');
  assert.equal(
    ruleStatus(puzzle, 'ada', { type: 'beside', object: 'plant' }, { ada: 2 }),
    'broken',
  );
});

test('relative evidence waits for the other person and respects direction and distance', () => {
  const puzzle = CASES.find((item) => item.id === 'encore')!;
  const rule = { type: 'relative', person: 'violet', direction: 'north', distance: 2 } as const;
  assert.equal(ruleStatus(puzzle, 'celia', rule, { celia: 18 }), 'open');
  assert.equal(ruleStatus(puzzle, 'celia', rule, { celia: 18, violet: 31 }), 'met');
  assert.equal(ruleStatus(puzzle, 'celia', rule, { celia: 24, violet: 31 }), 'broken');
});

test('an incomplete or contradictory scene cannot reveal a culprit', () => {
  assert.equal(culprit(CASES[0], { ada: 0, victor: 13 }), null);
  assert.equal(culprit(CASES[0], { ...CASES[0].solution, ada: 2 }), null);
  assert.equal(culprit(CASES[0], CASES[0].solution), 'ada');
});

test('undo restores both placements and notes without mutating history', () => {
  const initial = newSession();
  const first = editSession(initial, { placements: { ada: 0 }, marks: [2] });
  const second = editSession(first, { placements: { ada: 2 }, marks: [3] });
  assert.deepEqual(undoSession(second).placements, { ada: 0 });
  assert.deepEqual(undoSession(second).marks, [2]);
  assert.deepEqual(initial.placements, {});
  assert.deepEqual(first.placements, { ada: 0 });
  assert.equal(editSession({ ...first, solved: true }, { placements: {}, marks: [] }).solved, true);
});

test('a wrong placement receives a corrective hint instead of a contradictory tile', () => {
  const hint = getHint(CASES[0], { ada: 2 });
  assert.equal(hint?.person, 'ada');
  assert.equal(hint?.cell, undefined);
  assert.match(hint?.text ?? '', /Revisit/);
});

test('corrupt and stale saves recover safely; completed games survive reload', () => {
  assert.equal(restoreSave('invalid json', CASES).activeCase, 'briarwood');
  assert.deepEqual(restoreSave(JSON.stringify({ version: 5, sessions: {} }), CASES).sessions, {});
  const raw = JSON.stringify({
    version: 1,
    activeCase: 'missing',
    tutorialSeen: true,
    sessions: {
      briarwood: { ...newSession(), placements: CASES[0].solution, solved: true, elapsed: 87 },
      encore: { ...newSession(), placements: { hugo: -7 } },
      midnight: { ...newSession(), solved: true },
    },
  });
  const restored = restoreSave(raw, CASES);
  assert.equal(restored.sessions.briarwood.solved, true);
  assert.equal(restored.sessions.briarwood.elapsed, 87);
  assert.equal(restored.sessions.encore, undefined);
  assert.equal(restored.sessions.midnight.solved, false);
  assert.equal(restored.activeCase, 'briarwood');
  assert.equal(restored.tutorialSeen, true);
});

test('coordinates use visible column letters and one-based rows', () => {
  assert.equal(coordinate(0, 6), 'A1');
  assert.equal(coordinate(33, 6), 'D6');
  assert.equal(coordinate(48, 7), 'G7');
});
