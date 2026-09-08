import { Puzzle } from './types';

export const DIFFICULTY_BANDS: {
  name: Puzzle['difficulty'];
  from: number;
  to: number;
  size: number;
  description: string;
}[] = [
  {
    name: 'Beginner',
    from: 1,
    to: 20,
    size: 6,
    description: 'Learn to read the scene with direct locations and furniture clues.',
  },
  {
    name: 'Intermediate',
    from: 21,
    to: 40,
    size: 6,
    description: 'Follow the connections between suspects and combine their alibis.',
  },
  {
    name: 'Challenging',
    from: 41,
    to: 60,
    size: 7,
    description: 'Larger scenes, fewer starting points, and longer chains of deduction.',
  },
  {
    name: 'Expert',
    from: 61,
    to: 80,
    size: 8,
    description: 'Use exclusions and linked statements without exact row or column clues.',
  },
  {
    name: 'Master',
    from: 81,
    to: 100,
    size: 9,
    description: 'Untangle the broadest alibis across our most intricate floor plans.',
  },
];
export const CHAPTERS = [
  'First Investigations',
  'Uninvited Guests',
  'Behind the Alibis',
  'Private Affairs',
  'Departures & Disappearances',
  'The Long Shadow',
  'An Expert Eye',
  'Nothing Is Accidental',
  'The Master’s Notebook',
  'The Final Deductions',
].map((name, index) => ({
  number: index + 1,
  name,
  from: index * 10 + 1,
  to: index * 10 + 10,
  band: DIFFICULTY_BANDS[Math.floor(index / 2)],
}));

export const chapterOf = (puzzle: Puzzle) => Math.floor((Number(puzzle.number) - 1) / 10) + 1;
