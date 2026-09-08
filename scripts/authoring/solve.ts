import { culprit, roomAt, ruleStatus } from '../../src/game/engine';
import { Placements, Puzzle } from '../../src/game/types';

export function initialDomains(puzzle: Puzzle) {
  const blocked = new Set(puzzle.furniture.map((item) => item.cell));
  return puzzle.people.map((person) =>
    Array.from({ length: puzzle.size ** 2 }, (_, cell) => cell).filter(
      (cell) =>
        !blocked.has(cell) &&
        puzzle.clues
          .find((clue) => clue.person === person.id)!
          .rules.every(
            (rule) => ruleStatus(puzzle, person.id, rule, { [person.id]: cell }) !== 'broken',
          ),
    ),
  );
}

/** Offline forward-checking solver. The in-game engine independently verifies its results. */
export function searchCase(puzzle: Puzzle, limit = 2, budget = 30000) {
  const n = puzzle.size;
  const ids = puzzle.people.map((person) => person.id);
  const victim = ids.indexOf(puzzle.victim);
  const rooms = Array.from({ length: n ** 2 }, (_, cell) => roomAt(puzzle, cell));
  const pairs: ((a: number, b: number) => boolean)[][][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => []),
  );
  for (const clue of puzzle.clues) {
    const i = ids.indexOf(clue.person);
    for (const rule of clue.rules) {
      if (rule.type !== 'relative' && rule.type !== 'sameRoom') continue;
      const j = ids.indexOf(rule.person);
      const check =
        rule.type === 'sameRoom'
          ? (a: number, b: number) => rooms[a] === rooms[b]
          : (a: number, b: number) => {
              const delta =
                rule.direction === 'north'
                  ? Math.floor(b / n) - Math.floor(a / n)
                  : rule.direction === 'south'
                    ? Math.floor(a / n) - Math.floor(b / n)
                    : rule.direction === 'east'
                      ? (a % n) - (b % n)
                      : (b % n) - (a % n);
              return rule.distance === undefined ? delta > 0 : delta === rule.distance;
            };
      pairs[i][j].push(check);
      pairs[j][i].push((b, a) => check(a, b));
    }
  }
  const compatible = (i: number, a: number, j: number, b: number) =>
    Math.floor(a / n) !== Math.floor(b / n) &&
    a % n !== b % n &&
    pairs[i][j].every((check) => check(a, b));
  let nodes = 0,
    branches = 0,
    capped = false;
  const solutions: Placements[] = [];
  function search(domains: number[][], positions: number[]) {
    if (solutions.length >= limit || capped) return;
    if (++nodes > budget) {
      capped = true;
      return;
    }
    let next = -1;
    for (let i = 0; i < n; i++)
      if (positions[i] < 0 && (next < 0 || domains[i].length < domains[next].length)) next = i;
    if (next < 0) {
      const placements = Object.fromEntries(ids.map((id, i) => [id, positions[i]]));
      if (culprit(puzzle, placements)) solutions.push(placements);
      return;
    }
    if (domains[next].length > 1) branches++;
    for (const cell of domains[next]) {
      const placed = [...positions];
      placed[next] = cell;
      const victimRoom = placed[victim] >= 0 ? rooms[placed[victim]] : null;
      const occupants = victimRoom
        ? placed.filter((pos) => pos >= 0 && rooms[pos] === victimRoom).length
        : 0;
      if (occupants > 2) continue;
      const narrowed = domains.map((domain, i) =>
        placed[i] >= 0
          ? [placed[i]]
          : domain.filter(
              (candidate) =>
                compatible(next, cell, i, candidate) &&
                !(occupants === 2 && rooms[candidate] === victimRoom),
            ),
      );
      if (narrowed.some((domain) => domain.length === 0)) continue;
      search(narrowed, placed);
      if (solutions.length >= limit || capped) return;
    }
  }
  search(
    initialDomains(puzzle),
    ids.map(() => -1),
  );
  return { solutions, nodes, branches, capped };
}

export function rateCase(puzzle: Puzzle, tier: number): NonNullable<Puzzle['rating']> {
  const rules = puzzle.clues.flatMap((clue) => clue.rules);
  const candidates = initialDomains(puzzle).reduce(
    (sum, domain, i) => sum + (puzzle.people[i].id === puzzle.victim ? 0 : domain.length),
    0,
  );
  const relationships = rules.filter(
    (rule) => rule.type === 'relative' || rule.type === 'sameRoom',
  ).length;
  const directClues = rules.filter((rule) => rule.type === 'row' || rule.type === 'column').length;
  const negatives = rules.filter((rule) => rule.type === 'notRoom').length;
  const result = searchCase(puzzle);
  return {
    score:
      tier * 1000 +
      Math.round(
        candidates * 1.5 +
          relationships * 4 +
          negatives * 3 -
          directClues * 3 +
          Math.min(result.branches, 100) / 2,
      ),
    candidates,
    relationships,
    directClues,
    searchNodes: result.nodes,
  };
}
