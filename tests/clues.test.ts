import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from '../src/game/cases';
import { ruleStatus, solvePuzzle } from '../src/game/engine';
import { Placements, Puzzle, Rule } from '../src/game/types';
import { searchCase } from '../scripts/authoring/solve';
import { enrichCase } from '../scripts/authoring/enrich';
import { witnessStatement } from '../scripts/authoring/statements';

const fixture: Puzzle = {
  ...CASES[0],
  size: 4,
  rooms: CASES[0].rooms.slice(0, 2),
  layout: Array.from({ length: 4 }, () => [
    CASES[0].rooms[0].id,
    CASES[0].rooms[0].id,
    CASES[0].rooms[1].id,
    CASES[0].rooms[1].id,
  ]),
  people: CASES[0].people
    .slice(0, 4)
    .map((person, index) => ({ ...person, id: ['a', 'b', 'c', 'd'][index] })),
  victim: 'd',
  furniture: [],
  clues: [
    { person: 'a', text: '', rules: [{ type: 'between', first: 'b', second: 'c', axis: 'row' }] },
    { person: 'b', text: '', rules: [{ type: 'personDistance', person: 'c', distance: 5 }] },
    { person: 'c', text: '', rules: [{ type: 'differentRoom', person: 'a' }] },
    { person: 'd', text: '', rules: [] },
  ],
  solution: { a: 5, b: 0, c: 14, d: 11 },
};

test('between respects the named order, allows different columns, and rejects partial contradictions', () => {
  const rule: Rule = { type: 'between', first: 'b', second: 'c', axis: 'row' };
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 5 }), 'open');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 5, b: 0 }), 'open');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 5, c: 14 }), 'open');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 5, b: 10 }), 'broken');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 5, c: 2 }), 'broken');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 5, b: 7 }), 'broken');
  assert.equal(ruleStatus(fixture, 'a', rule, fixture.solution), 'met');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 5, b: 14, c: 0 }), 'broken');
  assert.equal(ruleStatus(fixture, 'a', { ...rule, axis: 'column' }, { a: 5, b: 8, c: 3 }), 'met');
  assert.equal(
    ruleStatus(fixture, 'a', { ...rule, axis: 'column' }, { a: 5, b: 8, c: 9 }),
    'broken',
  );
});

test('grid distance counts both axes including diagonals, furniture and room boundaries', () => {
  const rule: Rule = { type: 'personDistance', person: 'b', distance: 2 };
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 0 }), 'open');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 0, b: 5 }), 'met');
  assert.equal(ruleStatus(fixture, 'a', { ...rule, distance: 1 }, { a: 0, b: 5 }), 'broken');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 0, b: 2 }), 'met');
  const furnished = {
    ...fixture,
    furniture: [{ id: 'desk', name: 'Desk', kind: 'desk' as const, cell: 1 }],
  };
  assert.equal(ruleStatus(furnished, 'a', rule, { a: 0, b: 2 }), 'met');
});

test('different-room evidence waits for the other witness and compares actual room membership', () => {
  const rule: Rule = { type: 'differentRoom', person: 'b' };
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 0 }), 'open');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 0, b: 5 }), 'broken');
  assert.equal(ruleStatus(fixture, 'a', rule, { a: 0, b: 6 }), 'met');
});

function permutations(items: number[]): number[][] {
  return items.length === 0
    ? [[]]
    : items.flatMap((item) =>
        permutations(items.filter((other) => other !== item)).map((rest) => [item, ...rest]),
      );
}

const comparisonFixture: Puzzle = {
  ...fixture,
  rooms: CASES[0].rooms.slice(0, 3),
  layout: Array.from({ length: 4 }, () => [
    CASES[0].rooms[0].id,
    CASES[0].rooms[1].id,
    CASES[0].rooms[2].id,
    CASES[0].rooms[2].id,
  ]),
  furniture: [
    { id: 'desk', name: 'Desk', kind: 'desk', cell: 9 },
    { id: 'piano', name: 'Piano', kind: 'piano', cell: 2 },
  ],
  clues: [
    {
      person: 'a',
      text: '',
      rules: [
        { type: 'closerToObject', near: 'desk', far: 'piano' },
        { type: 'oneOfRooms', rooms: [CASES[0].rooms[0].id, CASES[0].rooms[1].id] },
      ],
    },
    { person: 'b', text: '', rules: [{ type: 'alone' }] },
    { person: 'c', text: '', rules: [{ type: 'closerThan', object: 'desk', person: 'b' }] },
    { person: 'd', text: '', rules: [] },
  ],
};

test('closer comparisons use grid distance, exclude ties and wait for the other witness', () => {
  const rule: Rule = { type: 'closerToObject', near: 'desk', far: 'piano' };
  assert.equal(ruleStatus(comparisonFixture, 'a', rule, { a: 5 }), 'met');
  assert.equal(ruleStatus(comparisonFixture, 'a', rule, { a: 6 }), 'broken');
  const tied = {
    ...comparisonFixture,
    furniture: comparisonFixture.furniture.map((object) =>
      object.id === 'piano' ? { ...object, cell: 1 } : object,
    ),
  };
  assert.equal(ruleStatus(tied, 'a', rule, { a: 5 }), 'broken');
  const comparison: Rule = { type: 'closerThan', object: 'desk', person: 'b' };
  assert.equal(ruleStatus(comparisonFixture, 'a', comparison, { a: 5 }), 'open');
  assert.equal(ruleStatus(comparisonFixture, 'a', comparison, { a: 5, b: 6 }), 'met');
  assert.equal(ruleStatus(comparisonFixture, 'a', comparison, { a: 5, b: 13 }), 'broken');
  assert.equal(
    ruleStatus(comparisonFixture, 'a', { ...comparison, object: 'missing' }, { a: 5 }),
    'broken',
  );
});

test('room alibis and landmark exclusions handle partial placements and room boundaries', () => {
  assert.equal(ruleStatus(comparisonFixture, 'a', { type: 'alone' }, { a: 5, b: 0 }), 'open');
  assert.equal(ruleStatus(comparisonFixture, 'a', { type: 'alone' }, { a: 5, b: 1 }), 'broken');
  assert.equal(ruleStatus(comparisonFixture, 'a', { type: 'alone' }, fixture.solution), 'met');
  const rooms: Rule = {
    type: 'oneOfRooms',
    rooms: [comparisonFixture.rooms[0].id, comparisonFixture.rooms[1].id],
  };
  assert.equal(ruleStatus(comparisonFixture, 'a', rooms, { a: 0 }), 'met');
  assert.equal(ruleStatus(comparisonFixture, 'a', rooms, { a: 5 }), 'met');
  assert.equal(ruleStatus(comparisonFixture, 'a', rooms, { a: 3 }), 'broken');
  assert.equal(
    ruleStatus(comparisonFixture, 'a', { type: 'notBeside', object: 'desk' }, { a: 5 }),
    'broken',
  );
  assert.equal(
    ruleStatus(comparisonFixture, 'a', { type: 'notBeside', object: 'desk' }, { a: 8 }),
    'met',
  );
});

test('both solvers match an independent exhaustive oracle for room alibis and distance comparisons', () => {
  const axes = permutations([0, 1, 2, 3]);
  const expected: Placements[] = [];
  const distance = (row: number, column: number, object: number) =>
    Math.abs(row - Math.floor(object / 4)) + Math.abs(column - (object % 4));
  for (const rows of axes)
    for (const columns of axes) {
      const cells = rows.map((row, index) => row * 4 + columns[index]);
      if (cells.some((cell) => cell === 2 || cell === 9)) continue;
      if (columns[0] >= 2 || columns[1] >= 2) continue;
      if (distance(rows[0], columns[0], 9) >= distance(rows[0], columns[0], 2)) continue;
      if (distance(rows[2], columns[2], 9) >= distance(rows[1], columns[1], 9)) continue;
      // The two singleton columns are occupied by a and b, so c shares the victim's room.
      expected.push(
        Object.fromEntries(['a', 'b', 'c', 'd'].map((id, index) => [id, cells[index]])),
      );
    }
  const canonical = (solutions: Placements[]) =>
    solutions.map((solution) => ['a', 'b', 'c', 'd'].map((id) => solution[id]).join(',')).sort();
  assert.ok(expected.length > 1);
  assert.deepEqual(canonical(solvePuzzle(comparisonFixture, {}, 1000)), canonical(expected));
  const forward = searchCase(comparisonFixture, 1000, 50000);
  assert.equal(forward.capped, false);
  assert.deepEqual(canonical(forward.solutions), canonical(expected));
});

test('both solvers agree with exhaustive enumeration for combined new deductions on both axes', () => {
  const axes = permutations([0, 1, 2, 3]);
  for (const axis of ['row', 'column'] as const) {
    const puzzle = structuredClone(fixture);
    puzzle.clues[0].rules = [{ type: 'between', first: 'b', second: 'c', axis }];
    const expected: Placements[] = [];
    // Independent oracle: 4! row assignments × 4! column assignments.
    // Vertical room strips contain exactly two people under the column rule.
    for (const rows of axes)
      for (const columns of axes) {
        const order = axis === 'row' ? rows : columns;
        if (!(order[1] < order[0] && order[0] < order[2])) continue;
        if (Math.abs(rows[1] - rows[2]) + Math.abs(columns[1] - columns[2]) !== 5) continue;
        if (columns[0] < 2 === columns[2] < 2) continue;
        expected.push(
          Object.fromEntries(['a', 'b', 'c', 'd'].map((id, i) => [id, rows[i] * 4 + columns[i]])),
        );
      }
    const canonical = (solutions: Placements[]) =>
      solutions.map((solution) => ['a', 'b', 'c', 'd'].map((id) => solution[id]).join(',')).sort();
    assert.ok(expected.length > 1);
    assert.deepEqual(canonical(solvePuzzle(puzzle, {}, 1000)), canonical(expected));
    const forward = searchCase(puzzle, 1000, 50000);
    assert.equal(forward.capped, false);
    assert.deepEqual(canonical(forward.solutions), canonical(expected));
  }
});

test('all witness text is deterministic and can be authored without reading an answer', () => {
  for (const puzzle of CASES) {
    const scene = new Proxy(puzzle, {
      get(target, key, receiver) {
        if (key === 'solution') throw new Error('Witness wording must not leak solution data');
        return Reflect.get(target, key, receiver);
      },
    });
    for (const clue of puzzle.clues) {
      const text = witnessStatement(scene, clue);
      assert.equal(text, clue.text, `${puzzle.number}: stale testimony for ${clue.person}`);
      assert.doesNotMatch(
        text,
        /undefined|NaN|And I was|introductions|invitation|grid steps|\b(row|column)\b/i,
      );
      assert.ok(text.length <= 220, `Overlong testimony: ${puzzle.number}/${clue.person}`);
      assert.ok(clue.rules.length <= 3, 'A witness should give at most three short facts');
      for (const rule of clue.rules) {
        assert.ok(
          !['row', 'column', 'objectRow', 'objectColumn', 'personDistance'].includes(rule.type),
          'Clues must not be coordinate lookups',
        );
        if (rule.type === 'relative')
          assert.equal(rule.distance, undefined, 'No fixed row or column offsets');
      }
    }
  }
});

test('clue refresh is repeatable and does not change saved scene identities or answers', () => {
  const examples = [
    CASES[0],
    ...CASES.filter((puzzle) =>
      puzzle.clues.some((clue) =>
        clue.rules.some(
          (rule) =>
            rule.type === 'between' ||
            rule.type === 'differentRoom' ||
            rule.type === 'personDistance',
        ),
      ),
    ).slice(0, 3),
  ];
  assert.equal(examples.length, 4, 'Novel deductions should be present in the campaign');
  for (const puzzle of examples) {
    assert.deepEqual(enrichCase(puzzle), puzzle);
  }
});
