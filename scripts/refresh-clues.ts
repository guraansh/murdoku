import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { solvePuzzle } from '../src/game/engine';
import { Puzzle } from '../src/game/types';
import { enrichCase } from './authoring/enrich';
import { searchCase } from './authoring/solve';

const original = JSON.parse(readFileSync('src/game/casebook.json', 'utf8')) as Puzzle[];
const book = original.map((puzzle) => {
  const next = enrichCase(puzzle);
  for (const key of [
    'id',
    'number',
    'size',
    'layout',
    'rooms',
    'furniture',
    'people',
    'victim',
    'solution',
  ] as const)
    assert.deepEqual(next[key], puzzle[key], `Saved scene changed: ${puzzle.id}.${key}`);
  const verified = solvePuzzle(next);
  assert.equal(verified.length, 1, `Ambiguous case ${next.number}`);
  assert.deepEqual(verified[0], puzzle.solution, `Answer changed for ${next.number}`);
  const second = searchCase(next);
  assert.equal(second.capped, false);
  assert.deepEqual(second.solutions, verified);
  console.log(
    `Verified case ${next.number}: ${next.clues.reduce((sum, clue) => sum + clue.rules.length, 0)} facts, ${next.rating!.candidates} candidate squares`,
  );
  return next;
});

// Write only once the entire catalog passes both solvers.
writeFileSync('src/game/casebook.json', JSON.stringify(book, null, 2) + '\n');
const counts: Record<string, number> = {};
for (const puzzle of book)
  for (const clue of puzzle.clues)
    for (const rule of clue.rules) counts[rule.type] = (counts[rule.type] ?? 0) + 1;
mkdirSync('artifacts', { recursive: true });
writeFileSync(
  'artifacts/clue-refresh.json',
  JSON.stringify({ cases: book.length, rules: counts }, null, 2),
);
console.log(JSON.stringify({ cases: book.length, rules: counts }));
