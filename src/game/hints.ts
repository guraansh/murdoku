import { clueStatus, getHint, placementProblem, violations } from './engine';
import { Placements, Puzzle } from './types';

/** Explain eliminations using the same public rules the player can inspect. */
export function progressiveHint(puzzle: Puzzle, placements: Placements) {
  const reveal = getHint(puzzle, placements);
  if (!reveal) return null;
  const person = puzzle.people.find((item) => item.id === reveal.person)!;
  const own = puzzle.clues.find((clue) => clue.person === person.id)!;
  const evidence = puzzle.clues.filter(
    (clue) =>
      clue.person === person.id ||
      clue.rules.some(
        (rule) =>
          ('person' in rule && rule.person === person.id) ||
          (rule.type === 'between' && (rule.first === person.id || rule.second === person.id)),
      ),
  );
  if (reveal.cell === undefined) {
    const problems = violations(puzzle, placements);
    return {
      reveal,
      evidence,
      deduction: problems.length
        ? `The current scene breaks these rules: ${problems.join(' ')} Revisit ${person.name} and check the quoted evidence before placing them again.`
        : `No single statement is visibly contradicted yet, but ${person.name}’s current position cannot extend to a complete solution of all the evidence. Remove that token and compare the remaining possibilities with the other witnesses.`,
      candidates: [] as number[],
    };
  }
  let candidates = Array.from({ length: puzzle.size ** 2 }, (_, cell) => cell).filter(
    (cell) => !placementProblem(puzzle, placements, person.id, cell),
  );
  const steps = [
    `Start with ${candidates.length} squares after excluding furniture and rows or columns used by other people.`,
  ];
  for (const clue of puzzle.clues) {
    const before = candidates.length;
    candidates = candidates.filter(
      (cell) => clueStatus(puzzle, clue, { ...placements, [person.id]: cell }) !== 'broken',
    );
    if (candidates.length < before) {
      const witness = puzzle.people.find((item) => item.id === clue.person)!;
      steps.push(
        `${witness.name}’s evidence — “${clue.text}” — rules out ${before - candidates.length} more, leaving ${candidates.length}.`,
      );
      if (!evidence.includes(clue)) evidence.push(clue);
    }
  }
  steps.push(
    candidates.length === 1
      ? 'Only one square survives those checks. Find it on the board, or reveal the position below.'
      : `${candidates.length} possibilities remain. These are not all guaranteed solutions: compare the still-unplaced witnesses and their shared rows, columns, and rooms before deciding. You can reveal the final position if you need it.`,
  );
  return {
    reveal,
    evidence: evidence.length ? evidence : [own],
    deduction: steps.join('\n\n'),
    candidates,
  };
}
