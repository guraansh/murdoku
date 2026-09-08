import { mkdirSync, writeFileSync } from 'node:fs';
import { LEGACY_CASES } from '../src/game/legacyCases';
import { DIFFICULTY_BANDS } from '../src/game/campaign';
import { coordinate, roomAt, ruleStatus, solvePuzzle } from '../src/game/engine';
import { Person, Puzzle, Rule } from '../src/game/types';
import { CAST, HOOKS, OBJECTS, SETTINGS, TITLES } from './authoring/stories';
import { initialDomains, rateCase, searchCase } from './authoring/solve';

const PALETTE = [
  ['#F0D9C8', '#8C6049'],
  ['#DDE5CD', '#64724D'],
  ['#E1DDED', '#7D7190'],
  ['#F0E5BC', '#8B7B43'],
  ['#DBE4E8', '#657C87'],
  ['#EBD8DC', '#906878'],
];
const COLORS = [
  '#B8725C',
  '#748B6A',
  '#9B8BAA',
  '#BE9E57',
  '#688F94',
  '#A57B92',
  '#A27F5A',
  '#7B8DAB',
  '#AB88A9',
];
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rng = () => number;
const pick = <T>(items: T[], rng: Rng): T => items[Math.floor(rng() * items.length)];
function shuffle<T>(items: T[], rng: Rng) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const adjacent = (cell: number, n: number) =>
  [cell - n, cell + n, cell % n ? cell - 1 : -1, cell % n < n - 1 ? cell + 1 : -1].filter(
    (value) => value >= 0 && value < n * n,
  );

function layoutFor(n: number, count: number, rng: Rng) {
  const rects = [{ x: 0, y: 0, w: n, h: n }];
  while (rects.length < count) {
    const choices = rects
      .map((rect, index) => ({ rect, index }))
      .filter(({ rect }) => rect.w >= 4 || rect.h >= 4)
      .sort((a, b) => b.rect.w * b.rect.h - a.rect.w * a.rect.h);
    if (!choices.length) throw new Error('Cannot partition scene');
    const { rect, index } = choices[0];
    const vertical = rect.h < 4 || (rect.w >= 4 && rng() > 0.5);
    const split = 2 + Math.floor(rng() * ((vertical ? rect.w : rect.h) - 3));
    rects.splice(
      index,
      1,
      ...(vertical
        ? [
            { ...rect, w: split },
            { ...rect, x: rect.x + split, w: rect.w - split },
          ]
        : [
            { ...rect, h: split },
            { ...rect, y: rect.y + split, h: rect.h - split },
          ]),
    );
  }
  const flat = new Array<string>(n * n);
  rects.forEach((rect, i) => {
    for (let y = rect.y; y < rect.y + rect.h; y++)
      for (let x = rect.x; x < rect.x + rect.w; x++) flat[y * n + x] = `room-${i}`;
  });
  // Gently vary the walls, retaining connected rooms of at least four squares.
  for (let step = 0; step < n * 2; step++) {
    const cell = Math.floor(rng() * n * n),
      source = flat[cell];
    const target = adjacent(cell, n).find((next) => flat[next] !== source);
    const sourceCells = flat
      .map((id, pos) => (id === source && pos !== cell ? pos : -1))
      .filter((pos) => pos >= 0);
    if (target === undefined || sourceCells.length < 4) continue;
    const reached = new Set([sourceCells[0]]),
      pending = [sourceCells[0]];
    while (pending.length)
      for (const next of adjacent(pending.pop()!, n))
        if (next !== cell && flat[next] === source && !reached.has(next)) {
          reached.add(next);
          pending.push(next);
        }
    if (reached.size === sourceCells.length) flat[cell] = flat[target];
  }
  return Array.from({ length: n }, (_, row) => flat.slice(row * n, (row + 1) * n));
}

function makeScene(tier: number, seed: number): Puzzle {
  const rng = random(seed),
    n = DIFFICULTY_BANDS[tier].size,
    roomCount = tier < 2 ? 4 : tier === 2 ? 5 : 6;
  const setting = SETTINGS[tier * 2 + (seed % 2)];
  const layout = layoutFor(n, roomCount, rng);
  const rooms = Array.from({ length: roomCount }, (_, i) => ({
    id: `room-${i}`,
    name: setting.rooms[i],
    color: PALETTE[i][0],
    ink: PALETTE[i][1],
  }));
  let cells: number[] = [],
    victimCell = -1;
  for (let tries = 0; tries < 100; tries++) {
    cells = shuffle(
      Array.from({ length: n }, (_, i) => i),
      rng,
    ).map((column, row) => row * n + column);
    const pairs = cells.filter(
      (cell) =>
        cells.filter(
          (other) =>
            layout[Math.floor(other / n)][other % n] === layout[Math.floor(cell / n)][cell % n],
        ).length === 2,
    );
    if (pairs.length) {
      victimCell = pick(pairs, rng);
      break;
    }
  }
  if (victimCell < 0) throw new Error('No victim pair');
  cells = [
    ...shuffle(
      cells.filter((cell) => cell !== victimCell),
      rng,
    ),
    victimCell,
  ];
  const people: Person[] = shuffle(CAST, rng)
    .slice(0, n)
    .map(([name, role, style], i) => ({
      id: name.toLowerCase(),
      name,
      role: i === n - 1 ? 'The victim' : role,
      style,
      color: i === n - 1 ? '#91938A' : COLORS[i],
      skin: pick(['#E6B98F', '#A77958', '#EAC29D', '#AF7957', '#CE9873'], rng),
      hair: pick(['#493D37', '#302E2B', '#8A553C', '#D6D1BF'], rng),
    }));
  const objectCells = new Set<number>();
  for (const cell of cells) {
    const options = adjacent(cell, n).filter(
      (other) =>
        layout[Math.floor(cell / n)][cell % n] === layout[Math.floor(other / n)][other % n] &&
        !cells.includes(other),
    );
    if (options.length && rng() < 0.8) objectCells.add(pick(options, rng));
  }
  const empty = shuffle(
    Array.from({ length: n * n }, (_, cell) => cell).filter(
      (cell) => !cells.includes(cell) && !objectCells.has(cell),
    ),
    rng,
  );
  const furnitureCount = Math.min(18, n + 3 + Math.floor(rng() * 3));
  for (const cell of empty) {
    if (objectCells.size >= furnitureCount) break;
    objectCells.add(cell);
  }
  const objects = shuffle(OBJECTS, rng);
  const puzzle: Puzzle = {
    id: `generated-${seed}`,
    number: '000',
    title: '',
    subtitle: '',
    location: setting.location,
    difficulty: DIFFICULTY_BANDS[tier].name,
    minutes: ['5–10', '10–15', '15–20', '20–30', '30–45'][tier],
    size: n,
    rooms,
    layout,
    furniture: [...objectCells].map((cell, i) => ({
      id: `object-${i}`,
      kind: objects[i][0],
      name: objects[i][1],
      cell,
    })),
    people,
    victim: people[n - 1].id,
    clues: people.map((person) => ({ person: person.id, text: '', rules: [] })),
    solution: Object.fromEntries(people.map((person, i) => [person.id, cells[i]])),
    introduction: `${setting.hook} ${people[n - 1].name} has been found dead. ${setting.detail} Everyone’s statement is true. Reconstruct the scene to discover who was alone with the victim.`,
    conclusion: '',
  };
  return puzzle;
}

function rulePool(puzzle: Puzzle, person: string, tier: number): Rule[] {
  const cell = puzzle.solution[person],
    row = Math.floor(cell / puzzle.size),
    column = cell % puzzle.size;
  const rules: Rule[] = [{ type: 'room', room: roomAt(puzzle, cell) }];
  if (tier >= 2)
    for (const room of puzzle.rooms)
      if (room.id !== roomAt(puzzle, cell)) rules.push({ type: 'notRoom', room: room.id });
  if (tier === 0 || (tier < 3 && person === puzzle.people[0].id))
    rules.push({ type: 'row', value: row }, { type: 'column', value: column });
  for (const object of puzzle.furniture) {
    for (const type of ['beside', 'objectColumn', 'objectRow'] as const) {
      const rule = { type, object: object.id };
      if (ruleStatus(puzzle, person, rule, puzzle.solution) === 'met') rules.push(rule);
    }
  }
  if (tier > 0)
    for (const other of puzzle.people) {
      if (other.id === person || (other.id === puzzle.victim && tier < 3)) continue;
      if (
        other.id !== puzzle.victim &&
        roomAt(puzzle, puzzle.solution[other.id]) === roomAt(puzzle, cell)
      )
        rules.push({ type: 'sameRoom', person: other.id });
      const dr = row - Math.floor(puzzle.solution[other.id] / puzzle.size),
        dc = column - (puzzle.solution[other.id] % puzzle.size);
      for (const [direction, distance] of [
        [dr > 0 ? 'south' : 'north', Math.abs(dr)],
        [dc > 0 ? 'east' : 'west', Math.abs(dc)],
      ] as const) {
        rules.push({ type: 'relative', person: other.id, direction });
        rules.push({ type: 'relative', person: other.id, direction, distance });
      }
    }
  return rules;
}
const isRelationship = (rule: Rule) => rule.type === 'relative' || rule.type === 'sameRoom';
function meetsProfile(puzzle: Puzzle, tier: number) {
  const rules = puzzle.clues.flatMap((clue) => clue.rules);
  const relations = rules.filter(isRelationship).length;
  const direct = rules.filter((rule) => rule.type === 'row' || rule.type === 'column').length;
  const negatives = rules.filter((rule) => rule.type === 'notRoom').length;
  return (
    relations >= [0, 2, 3, 4, 6][tier] &&
    (tier < 3 ? direct >= 2 : direct === 0) &&
    negatives >= [0, 0, 0, 1, 2][tier]
  );
}

function author(puzzle: Puzzle, tier: number, seed: number): Puzzle | null {
  const rng = random(seed ^ 0x79ba12),
    suspects = puzzle.clues.filter((clue) => clue.person !== puzzle.victim);
  const pools = new Map(
    suspects.map((clue) => [clue.person, shuffle(rulePool(puzzle, clue.person, tier), rng)]),
  );
  for (const [i, clue] of suspects.entries()) {
    const pool = pools.get(clue.person)!;
    const unary = pool.filter(
      (rule) =>
        !isRelationship(rule) &&
        rule.type !== 'row' &&
        rule.type !== 'column' &&
        (tier < 4 || rule.type !== 'room'),
    );
    clue.rules = [pick(unary, rng)];
    if (tier < 3 && i === 0)
      clue.rules = pool.filter((rule) => rule.type === 'row' || rule.type === 'column');
    if (i < [0, 2, 3, 4, 6][tier]) clue.rules.push(pick(pool.filter(isRelationship), rng));
    if (i < [0, 0, 0, 1, 2][tier])
      clue.rules.push(
        pick(
          pool.filter(
            (rule) =>
              rule.type === 'notRoom' &&
              !clue.rules.some((existing) => JSON.stringify(existing) === JSON.stringify(rule)),
          ),
          rng,
        ),
      );
  }
  let result = searchCase(puzzle);
  for (let step = 0; result.solutions.length !== 1 && step < 45; step++) {
    if (result.capped || result.solutions.length === 0) return null;
    const alternative =
      result.solutions.find((solution) =>
        suspects.some((clue) => solution[clue.person] !== puzzle.solution[clue.person]),
      ) ?? result.solutions[0];
    const choices = suspects
      .flatMap((clue) =>
        pools
          .get(clue.person)!
          .filter(
            (rule) =>
              !clue.rules.some((existing) => JSON.stringify(existing) === JSON.stringify(rule)) &&
              ruleStatus(puzzle, clue.person, rule, alternative) === 'broken',
          )
          .map((rule) => ({
            clue,
            rule,
            cost: clue.rules.length * 8 + (tier > 0 && !isRelationship(rule) ? 2 : 0) + rng() * 3,
          })),
      )
      .filter((choice) => choice.clue.rules.length < 4)
      .sort((a, b) => a.cost - b.cost);
    if (!choices.length) return null;
    choices[0].clue.rules.push(choices[0].rule);
    result = searchCase(puzzle);
  }
  if (result.capped || result.solutions.length !== 1) return null;
  for (const clue of shuffle(suspects, rng))
    for (const rule of shuffle(clue.rules, rng)) {
      if (clue.rules.length <= 1) continue;
      const before = [...clue.rules];
      clue.rules = [...clue.rules];
      clue.rules.splice(clue.rules.indexOf(rule), 1);
      if (!meetsProfile(puzzle, tier)) {
        clue.rules = before;
        continue;
      }
      const check = searchCase(puzzle, 2, 12000);
      if (check.capped || check.solutions.length !== 1) clue.rules = before;
    }
  if (!meetsProfile(puzzle, tier)) return null;
  const domains = initialDomains(puzzle).slice(0, -1);
  if (
    tier === 4 &&
    (domains.some((domain) => domain.length < 2) ||
      domains.reduce((sum, domain) => sum + domain.length, 0) < 35)
  )
    return null;
  puzzle.rating = rateCase(puzzle, tier);
  return puzzle;
}

function statement(puzzle: Puzzle, rule: Rule): string {
  const roomName = (id: string) => puzzle.rooms.find((room) => room.id === id)!.name.toLowerCase();
  if (rule.type === 'room') return `in the ${roomName(rule.room)}`;
  if (rule.type === 'notRoom') return `not in the ${roomName(rule.room)}`;
  if (rule.type === 'row' || rule.type === 'column') {
    if (rule.type === 'column') return `in column ${String.fromCharCode(65 + rule.value)}`;
    return rule.value === 0
      ? 'in the top row'
      : rule.value === puzzle.size - 1
        ? 'in the bottom row'
        : `in row ${rule.value + 1}`;
  }
  if (rule.type === 'sameRoom')
    return `in the same room as ${puzzle.people.find((person) => person.id === rule.person)!.name}`;
  if (rule.type === 'relative') {
    const name = puzzle.people.find((person) => person.id === rule.person)!.name;
    const axis = rule.direction === 'north' || rule.direction === 'south' ? 'row' : 'column';
    return `${rule.distance === undefined ? '' : `exactly ${rule.distance} ${axis}${rule.distance === 1 ? '' : 's'} `}${rule.direction} of ${name}`;
  }
  if (!('object' in rule)) throw new Error('Unsupported statement rule');
  const object = puzzle.furniture.find((item) => item.id === rule.object)!.name.toLowerCase();
  return rule.type === 'beside'
    ? `beside the ${object}`
    : `in the same ${rule.type === 'objectColumn' ? 'column' : 'row'} as the ${object}`;
}
function finish(puzzle: Puzzle, level: number) {
  puzzle.number = String(level).padStart(3, '0');
  if (!puzzle.id.startsWith('generated-')) return puzzle;
  puzzle.id = `case-${puzzle.number}`;
  puzzle.title = TITLES[level - 1];
  const setting = SETTINGS[Math.floor((level - 1) / 10)];
  puzzle.location = setting.location;
  puzzle.rooms.forEach((room, index) => {
    room.name = setting.rooms[index];
  });
  const victimName = puzzle.people.find((person) => person.id === puzzle.victim)!.name;
  puzzle.introduction = `${HOOKS[level - 1]} ${victimName} has been found dead at ${setting.location}. Every statement in your notebook is true. Reconstruct the scene to discover who was alone with the victim.`;
  puzzle.subtitle = `An unexplained death at ${puzzle.location}.`;
  for (const clue of puzzle.clues)
    clue.text =
      clue.person === puzzle.victim
        ? `${puzzle.people.find((person) => person.id === puzzle.victim)!.name} was alone with the murderer in the same room.`
        : clue.rules
            .map((rule, index) => `${index ? 'And I was' : 'I was'} ${statement(puzzle, rule)}.`)
            .join(' ');
  const victimCell = puzzle.solution[puzzle.victim],
    victim = puzzle.people.find((person) => person.id === puzzle.victim)!;
  const killer = puzzle.people.find(
    (person) =>
      person.id !== puzzle.victim &&
      roomAt(puzzle, puzzle.solution[person.id]) === roomAt(puzzle, victimCell),
  )!;
  const room = puzzle.rooms.find((room) => room.id === roomAt(puzzle, victimCell))!;
  puzzle.conclusion = `${killer.name} at ${coordinate(puzzle.solution[killer.id], puzzle.size)} and ${victim.name} at ${coordinate(victimCell, puzzle.size)} were the only two people in the ${room.name.toLowerCase()}. Every other suspect was in a different room. All statements and all row and column constraints agree with this scene, leaving ${killer.name} as the only possible culprit.`;
  return puzzle;
}

const book: Puzzle[] = [];
if (TITLES.length !== 100 || HOOKS.length !== 100)
  throw new Error('The campaign needs exactly 100 titles and narrative hooks.');
for (let tier = 0; tier < 5; tier++) {
  const cases: Puzzle[] = [];
  const legacy = LEGACY_CASES[tier] ? structuredClone(LEGACY_CASES[tier]) : null;
  if (legacy) {
    legacy.rating = rateCase(legacy, tier);
    cases.push(legacy);
  }
  let attempts = 0;
  while (cases.length < 20 && attempts < 600) {
    const seed = 570000 + tier * 10000 + ++attempts;
    try {
      const next = author(makeScene(tier, seed), tier, seed);
      if (!next || (legacy && next.rating!.score < legacy.rating!.score)) continue;
      cases.push(next);
      console.log(
        `${DIFFICULTY_BANDS[tier].name}: ${cases.length}/20 · score ${next.rating!.score} · seed ${seed}`,
      );
    } catch (error) {
      if (attempts % 100 === 0) console.log(`Retrying scene ${seed}: ${String(error)}`);
    }
  }
  if (cases.length !== 20)
    throw new Error(
      `Only ${cases.length} ${DIFFICULTY_BANDS[tier].name} cases after ${attempts} attempts`,
    );
  cases.sort(
    (a, b) =>
      a.rating!.score - b.rating!.score ||
      (a === legacy ? -1 : b === legacy ? 1 : a.id.localeCompare(b.id)),
  );
  book.push(...cases.map((puzzle, i) => finish(puzzle, tier * 20 + i + 1)));
}
// Never publish a catalog unless a second solver agrees on every answer.
for (const puzzle of book) {
  const solutions = solvePuzzle(puzzle);
  if (
    solutions.length !== 1 ||
    puzzle.people.some((person) => solutions[0][person.id] !== puzzle.solution[person.id])
  ) {
    throw new Error(`Independent verification failed for case ${puzzle.number}`);
  }
}
writeFileSync('src/game/casebook.json', JSON.stringify(book, null, 2) + '\n');
mkdirSync('artifacts', { recursive: true });
writeFileSync(
  'artifacts/casebook-validation.json',
  JSON.stringify(
    book.map((puzzle) => ({
      id: puzzle.id,
      number: puzzle.number,
      difficulty: puzzle.difficulty,
      size: puzzle.size,
      ...puzzle.rating,
    })),
    null,
    2,
  ) + '\n',
);
console.log('Wrote 100 deterministic cases to src/game/casebook.json.');
