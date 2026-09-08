import { roomAt, ruleStatus } from '../../src/game/engine';
import { Puzzle, Rule } from '../../src/game/types';
import { initialDomains, rateCase, relationshipWeight, searchCase } from './solve';
import { refreshStatements } from './statements';

function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Later chapters leave more possible squares per witness, requiring combined evidence.
export function minimumPossibilities(level: number) {
  const tier = Math.floor((level - 1) / 20);
  return [2, 4, 7, 10, 14][tier] + Math.floor(((level - 1) % 20) / 10);
}

function evidencePool(puzzle: Puzzle, person: string): Rule[] {
  const level = Number(puzzle.number);
  const cell = puzzle.solution[person];
  const here = roomAt(puzzle, cell);
  const possible: Rule[] = [{ type: 'room', room: here }, { type: 'alone' }];
  for (const room of puzzle.rooms) {
    if (room.id === here) continue;
    possible.push({ type: 'notRoom', room: room.id });
    if (level > 10)
      possible.push({ type: 'oneOfRooms', rooms: [here, room.id].sort() as [string, string] });
  }
  for (const object of puzzle.furniture) {
    possible.push({ type: 'beside', object: object.id }, { type: 'notBeside', object: object.id });
    if (level > 10)
      for (const other of puzzle.furniture)
        if (object.id !== other.id)
          possible.push({ type: 'closerToObject', near: object.id, far: other.id });
  }
  const others = puzzle.people.filter((other) => other.id !== person);
  for (const other of others) {
    // Sharing a room with the victim would name the murderer outright.
    if (other.id !== puzzle.victim) possible.push({ type: 'sameRoom', person: other.id });
    possible.push({ type: 'differentRoom', person: other.id });
    for (const direction of ['north', 'south', 'west', 'east'] as const)
      possible.push({ type: 'relative', person: other.id, direction });
    if (level > 10)
      for (const object of puzzle.furniture)
        possible.push({ type: 'closerThan', person: other.id, object: object.id });
  }
  if (level > 40)
    for (const first of others)
      for (const second of others)
        if (first.id !== second.id)
          for (const axis of ['row', 'column'] as const)
            possible.push({ type: 'between', first: first.id, second: second.id, axis });
  return possible.filter((rule) => ruleStatus(puzzle, person, rule, puzzle.solution) === 'met');
}

const preference = (rule: Rule) => {
  switch (rule.type) {
    case 'beside':
    case 'sameRoom':
    case 'alone':
      return 0;
    case 'room':
    case 'differentRoom':
      return 0.4;
    case 'oneOfRooms':
    case 'closerThan':
      return 0.8;
    case 'closerToObject':
    case 'between':
      return 1.1;
    case 'notRoom':
    case 'notBeside':
      return 1.4;
    default:
      return 2.5;
  }
};

type Candidate = { rule: Rule; domain: Set<number>; tie: number };

/** Rebuild concise deductive evidence on the same scene and answer; no coordinate rules. */
export function enrichCase(original: Puzzle): Puzzle {
  const level = Number(original.number);
  const tier = Math.floor((level - 1) / 20);
  const minimum = minimumPossibilities(level);
  const pools = original.people.map((person) => evidencePool(original, person.id));
  const cells = Array.from({ length: original.size ** 2 }, (_, cell) => cell).filter(
    (cell) => !original.furniture.some((object) => object.cell === cell),
  );
  for (let attempt = 0; attempt < 12; attempt++) {
    const rng = random(810000 + level * 100 + attempt);
    const puzzle = structuredClone(original);
    puzzle.clues = puzzle.people.map((person) => ({ person: person.id, text: '', rules: [] }));
    const candidates: Candidate[][] = pools.map((pool, index) =>
      pool.map((rule) => ({
        rule,
        domain: new Set(
          cells.filter(
            (cell) =>
              ruleStatus(puzzle, puzzle.people[index].id, rule, {
                [puzzle.people[index].id]: cell,
              }) !== 'broken',
          ),
        ),
        tie: rng(),
      })),
    );
    const domains = puzzle.people.map(() => [...cells]);
    const usedType = (type: Rule['type']) =>
      puzzle.clues.reduce(
        (sum, clue) => sum + clue.rules.filter((rule) => rule.type === type).length,
        0,
      );
    for (const [i, clue] of puzzle.clues.entries()) {
      if (clue.person === puzzle.victim) continue;
      const start = candidates[i]
        .filter(
          (candidate) =>
            relationshipWeight(candidate.rule) === 0 && candidate.domain.size >= minimum,
        )
        .sort(
          (a, b) =>
            (a.domain.size - b.domain.size) * 0.3 +
            preference(a.rule) -
            preference(b.rule) +
            (usedType(a.rule.type) - usedType(b.rule.type)) * 1.2 +
            (a.tie - b.tie) * (attempt + 1),
        )[0];
      if (start) {
        clue.rules.push(start.rule);
        domains[i] = domains[i].filter((cell) => start.domain.has(cell));
      }
    }
    let result = searchCase(puzzle, 6, 5000);
    for (
      let step = 0;
      step < puzzle.size * 4 && (result.solutions.length !== 1 || result.capped);
      step++
    ) {
      const alternatives = result.solutions.filter((solution) =>
        puzzle.people.some((person) => solution[person.id] !== puzzle.solution[person.id]),
      );
      if (!alternatives.length) break;
      const choices = puzzle.clues
        .flatMap((clue, i) => {
          if (clue.person === puzzle.victim || clue.rules.length >= 3) return [];
          return candidates[i].flatMap((candidate) => {
            if (clue.rules.includes(candidate.rule)) return [];
            if (clue.rules.some((rule) => rule.type === candidate.rule.type)) return [];
            const remaining = domains[i].filter((cell) => candidate.domain.has(cell));
            if (remaining.length < minimum) return [];
            const removed = alternatives.filter(
              (solution) => ruleStatus(puzzle, clue.person, candidate.rule, solution) === 'broken',
            ).length;
            if (!removed) return [];
            return [
              {
                i,
                candidate,
                remaining,
                cost:
                  clue.rules.length * 1.7 +
                  preference(candidate.rule) +
                  usedType(candidate.rule.type) * 1.2 +
                  candidate.tie * (0.5 + attempt * 0.15) -
                  (removed / alternatives.length) * 5,
              },
            ];
          });
        })
        .sort((a, b) => a.cost - b.cost);
      const best = choices[0];
      if (!best) break;
      puzzle.clues[best.i].rules.push(best.candidate.rule);
      domains[best.i] = best.remaining;
      result = searchCase(puzzle, 6, 5000);
    }
    if (result.capped || result.solutions.length !== 1) continue;
    if (
      puzzle.people.some((person) => result.solutions[0][person.id] !== puzzle.solution[person.id])
    )
      throw new Error(`Answer changed at ${level}`);
    // Remove evidence that does no deductive work. Keep at least one fact per witness.
    for (const clue of puzzle.clues)
      for (const rule of [...clue.rules].reverse()) {
        if (clue.rules.length <= 1) continue;
        const before = clue.rules;
        clue.rules = before.filter((item) => item !== rule);
        const check = searchCase(puzzle, 2, 5000);
        if (check.capped || check.solutions.length !== 1) clue.rules = before;
      }
    if (puzzle.clues.some((clue) => clue.person !== puzzle.victim && clue.rules.length === 0))
      continue;
    puzzle.rating = rateCase(puzzle, tier);
    if (puzzle.rating.searchNodes > 5000) continue;
    if (
      initialDomains(puzzle).some(
        (domain, index) => puzzle.people[index].id !== puzzle.victim && domain.length < minimum,
      )
    )
      throw new Error(`Clue gives away a square at ${level}`);
    return refreshStatements(puzzle);
  }
  throw new Error(`Could not author concise, uniquely solvable evidence for case ${level}`);
}
