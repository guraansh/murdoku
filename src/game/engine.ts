import { Clue, GameSession, Placements, Puzzle, Rule, SaveData, Snapshot } from './types';

export const coordinate = (cell: number, size: number) =>
  `${String.fromCharCode(65 + (cell % size))}${Math.floor(cell / size) + 1}`;
export const roomAt = (puzzle: Puzzle, cell: number) =>
  puzzle.layout[Math.floor(cell / puzzle.size)]?.[cell % puzzle.size];
export const newSession = (): GameSession => ({
  placements: {},
  marks: [],
  history: [],
  checkedClues: [],
  elapsed: 0,
  hints: 0,
  solved: false,
});
export const newSave = (firstCase: string): SaveData => ({
  version: 1,
  activeCase: firstCase,
  sessions: {},
  tutorialSeen: false,
  haptics: true,
});

export function ruleStatus(
  puzzle: Puzzle,
  person: string,
  rule: Rule,
  placements: Placements,
): 'met' | 'open' | 'broken' {
  const cell = placements[person];
  if (cell === undefined) return 'open';
  const row = Math.floor(cell / puzzle.size),
    column = cell % puzzle.size;
  const room = roomAt(puzzle, cell);
  let matches = false;
  if (rule.type === 'room') matches = room === rule.room;
  if (rule.type === 'notRoom') matches = room !== rule.room;
  if (rule.type === 'row') matches = row === rule.value;
  if (rule.type === 'column') matches = column === rule.value;
  if (rule.type === 'beside' || rule.type === 'objectColumn' || rule.type === 'objectRow') {
    const object = puzzle.furniture.find((item) => item.id === rule.object);
    if (!object) return 'broken';
    const objectRow = Math.floor(object.cell / puzzle.size),
      objectColumn = object.cell % puzzle.size;
    if (rule.type === 'beside')
      matches =
        room === roomAt(puzzle, object.cell) &&
        Math.abs(row - objectRow) + Math.abs(column - objectColumn) === 1;
    if (rule.type === 'objectColumn') matches = column === objectColumn;
    if (rule.type === 'objectRow') matches = row === objectRow;
  }
  if (rule.type === 'relative' || rule.type === 'sameRoom') {
    const other = placements[rule.person];
    if (other === undefined) return 'open';
    if (rule.type === 'sameRoom') matches = room === roomAt(puzzle, other);
    else {
      const delta =
        rule.direction === 'north'
          ? Math.floor(other / puzzle.size) - row
          : rule.direction === 'south'
            ? row - Math.floor(other / puzzle.size)
            : rule.direction === 'west'
              ? (other % puzzle.size) - column
              : column - (other % puzzle.size);
      matches = rule.distance === undefined ? delta > 0 : delta === rule.distance;
    }
  }
  return matches ? 'met' : 'broken';
}

export function clueStatus(puzzle: Puzzle, clue: Clue, placements: Placements) {
  if (placements[clue.person] === undefined) return 'open';
  if (clue.person === puzzle.victim) {
    const occupants = Object.values(placements).filter(
      (cell) => roomAt(puzzle, cell) === roomAt(puzzle, placements[puzzle.victim]),
    );
    if (occupants.length > 2) return 'broken';
    if (Object.keys(placements).length < puzzle.people.length) return 'open';
    return occupants.length === 2 ? 'met' : 'broken';
  }
  const statuses = clue.rules.map((rule) => ruleStatus(puzzle, clue.person, rule, placements));
  return statuses.includes('broken') ? 'broken' : statuses.includes('open') ? 'open' : 'met';
}

export function placementProblem(
  puzzle: Puzzle,
  placements: Placements,
  person: string,
  cell: number,
): string | null {
  if (!puzzle.people.some((item) => item.id === person)) return 'Unknown person.';
  if (!Number.isInteger(cell) || cell < 0 || cell >= puzzle.size ** 2)
    return 'Choose a square on the floor plan.';
  const furniture = puzzle.furniture.find((item) => item.cell === cell);
  if (furniture)
    return `The ${furniture.name.toLowerCase()} occupies this square. People need an empty square.`;
  for (const [other, position] of Object.entries(placements)) {
    if (other === person) continue;
    const name = puzzle.people.find((item) => item.id === other)?.name ?? 'Someone';
    if (position === cell) return `${name} is already in this square.`;
    if (Math.floor(position / puzzle.size) === Math.floor(cell / puzzle.size))
      return `${name} is already in row ${Math.floor(cell / puzzle.size) + 1}. One person per row.`;
    if (position % puzzle.size === cell % puzzle.size)
      return `${name} is already in column ${String.fromCharCode(65 + (cell % puzzle.size))}. One person per column.`;
  }
  return null;
}

export function violations(puzzle: Puzzle, placements: Placements): string[] {
  const errors = new Set<string>();
  for (const [person, cell] of Object.entries(placements)) {
    const problem = placementProblem(puzzle, placements, person, cell);
    if (problem) errors.add(problem);
  }
  for (const clue of puzzle.clues) {
    if (clueStatus(puzzle, clue, placements) === 'broken') {
      const person = puzzle.people.find((item) => item.id === clue.person)!;
      errors.add(
        clue.person === puzzle.victim
          ? 'The victim must share a room with exactly one suspect.'
          : `${person.name}'s position contradicts their statement.`,
      );
    }
  }
  return [...errors];
}

export function culprit(puzzle: Puzzle, placements: Placements): string | null {
  if (
    Object.keys(placements).length !== puzzle.people.length ||
    violations(puzzle, placements).length
  )
    return null;
  const suspects = puzzle.people.filter(
    (person) =>
      person.id !== puzzle.victim &&
      roomAt(puzzle, placements[person.id]) === roomAt(puzzle, placements[puzzle.victim]),
  );
  return suspects.length === 1 ? suspects[0].id : null;
}

/** Constraint search is independent of the authored answer; it detects ambiguous cases. */
export function solvePuzzle(puzzle: Puzzle, initial: Placements = {}, limit = 2): Placements[] {
  const solutions: Placements[] = [];
  if (violations(puzzle, initial).length) return solutions;
  const blocked = new Set(puzzle.furniture.map((item) => item.cell));
  const domains = Object.fromEntries(
    puzzle.people.map((person) => [
      person.id,
      Array.from({ length: puzzle.size ** 2 }, (_, cell) => cell).filter(
        (cell) =>
          !blocked.has(cell) &&
          puzzle.clues
            .filter((clue) => clue.person === person.id)
            .every((clue) =>
              clue.rules.every(
                (rule) => ruleStatus(puzzle, person.id, rule, { [person.id]: cell }) !== 'broken',
              ),
            ),
      ),
    ]),
  );
  const consistent = (positions: Placements) =>
    puzzle.clues.every((clue) => clueStatus(puzzle, clue, positions) !== 'broken');
  function search(positions: Placements) {
    if (solutions.length >= limit) return;
    if (Object.keys(positions).length === puzzle.people.length) {
      if (culprit(puzzle, positions)) solutions.push({ ...positions });
      return;
    }
    let next = '',
      candidates: number[] = [];
    for (const person of puzzle.people) {
      if (positions[person.id] !== undefined) continue;
      const legal = domains[person.id].filter(
        (cell) =>
          !placementProblem(puzzle, positions, person.id, cell) &&
          consistent({ ...positions, [person.id]: cell }),
      );
      if (!legal.length) return;
      if (!next || legal.length < candidates.length) {
        next = person.id;
        candidates = legal;
      }
    }
    for (const cell of candidates) {
      search({ ...positions, [next]: cell });
      if (solutions.length >= limit) return;
    }
  }
  search(initial);
  return solutions;
}

export function editSession(session: GameSession, next: Snapshot): GameSession {
  if (session.solved) return session;
  return {
    ...session,
    ...next,
    history: [
      ...session.history.slice(-99),
      { placements: { ...session.placements }, marks: [...session.marks] },
    ],
  };
}
export function undoSession(session: GameSession): GameSession {
  const previous = session.history.at(-1);
  return !previous || session.solved
    ? session
    : { ...session, ...previous, history: session.history.slice(0, -1) };
}

export function getHint(
  puzzle: Puzzle,
  placements: Placements,
): { person: string; cell?: number; text: string } | null {
  const misplaced = puzzle.people.find(
    (person) =>
      placements[person.id] !== undefined && placements[person.id] !== puzzle.solution[person.id],
  );
  if (misplaced)
    return {
      person: misplaced.id,
      text: `Revisit ${misplaced.name}'s position. It cannot fit all the evidence. Remove or move this person, then reread their statement.`,
    };
  const remaining = puzzle.people.filter((person) => placements[person.id] === undefined);
  if (!remaining.length) return null;
  const ranked = remaining.map((person) => ({
    person,
    count: Array.from({ length: puzzle.size ** 2 }, (_, cell) => cell).filter(
      (cell) =>
        !placementProblem(puzzle, placements, person.id, cell) &&
        !violations(puzzle, { ...placements, [person.id]: cell }).length,
    ).length,
  }));
  ranked.sort((a, b) => a.count - b.count);
  const person = ranked[0].person;
  const cell = puzzle.solution[person.id];
  const clue = puzzle.clues.find((item) => item.person === person.id)!;
  return {
    person: person.id,
    cell,
    text: `${person.name} belongs at ${coordinate(cell, puzzle.size)}. ${person.id === puzzle.victim ? 'After placing the suspects, this is the remaining row and column. The victim shares this room with just one suspect.' : `${clue.text} Combine this with the occupied rows and columns.`}`,
  };
}

/** Saves are untrusted input: malformed data must never strand the app at launch. */
export function restoreSave(raw: string | null, puzzles: Puzzle[]): SaveData {
  const fallback = newSave(puzzles[0].id);
  if (!raw) return fallback;
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !data.sessions || typeof data.sessions !== 'object') return fallback;
    const sessions: Record<string, GameSession> = {};
    for (const puzzle of puzzles) {
      const saved = data.sessions[puzzle.id];
      if (
        !saved ||
        !saved.placements ||
        typeof saved.placements !== 'object' ||
        Array.isArray(saved.placements)
      )
        continue;
      const validSnapshot = (snapshot: Snapshot) =>
        snapshot &&
        snapshot.placements &&
        typeof snapshot.placements === 'object' &&
        !Array.isArray(snapshot.placements) &&
        Object.entries(snapshot.placements).every(
          ([id, cell]) =>
            puzzle.people.some((person) => person.id === id) &&
            Number.isInteger(cell) &&
            cell >= 0 &&
            cell < puzzle.size ** 2 &&
            !puzzle.furniture.some((item) => item.cell === cell),
        ) &&
        Array.isArray(snapshot.marks) &&
        snapshot.marks.every(
          (cell) => Number.isInteger(cell) && cell >= 0 && cell < puzzle.size ** 2,
        );
      if (!validSnapshot(saved)) continue;
      sessions[puzzle.id] = {
        ...newSession(),
        placements: saved.placements,
        marks: [...new Set<number>(saved.marks)],
        history: Array.isArray(saved.history)
          ? saved.history
              .filter(validSnapshot)
              .slice(-100)
              .map((snapshot: Snapshot) => ({
                placements: snapshot.placements,
                marks: snapshot.marks,
              }))
          : [],
        checkedClues: Array.isArray(saved.checkedClues)
          ? saved.checkedClues.filter((id: string) =>
              puzzle.people.some((person) => person.id === id),
            )
          : [],
        elapsed:
          Number.isFinite(saved.elapsed) && saved.elapsed >= 0 ? Math.floor(saved.elapsed) : 0,
        hints: Number.isFinite(saved.hints) && saved.hints >= 0 ? Math.floor(saved.hints) : 0,
        solved: saved.solved === true && culprit(puzzle, saved.placements) !== null,
      };
    }
    return {
      ...fallback,
      sessions,
      activeCase: puzzles.some((puzzle) => puzzle.id === data.activeCase)
        ? data.activeCase
        : fallback.activeCase,
      tutorialSeen: data.tutorialSeen === true,
      haptics: data.haptics !== false,
    };
  } catch {
    return fallback;
  }
}
