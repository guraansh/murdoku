export type Placements = Record<string, number>;
export type FurnitureKind =
  | 'desk'
  | 'books'
  | 'plant'
  | 'globe'
  | 'stove'
  | 'sofa'
  | 'table'
  | 'piano'
  | 'flowers'
  | 'easel'
  | 'records'
  | 'trunk'
  | 'lamp';
export type Person = {
  id: string;
  name: string;
  role: string;
  color: string;
  skin: string;
  hair: string;
  style: 'bob' | 'bun' | 'curls' | 'moustache' | 'hat' | 'glasses';
};
export type Room = { id: string; name: string; color: string; ink: string };
export type Furniture = { id: string; name: string; kind: FurnitureKind; cell: number };
export type Rule =
  | { type: 'room'; room: string }
  | { type: 'notRoom'; room: string }
  | { type: 'oneOfRooms'; rooms: [string, string] }
  | { type: 'alone' }
  | { type: 'row' | 'column'; value: number }
  | { type: 'beside' | 'notBeside' | 'objectColumn' | 'objectRow'; object: string }
  | { type: 'closerToObject'; near: string; far: string }
  | { type: 'closerThan'; person: string; object: string }
  | {
      type: 'relative';
      person: string;
      direction: 'north' | 'south' | 'east' | 'west';
      distance?: number;
    }
  | { type: 'sameRoom'; person: string }
  | { type: 'differentRoom'; person: string }
  | { type: 'personDistance'; person: string; distance: number }
  | { type: 'between'; first: string; second: string; axis: 'row' | 'column' };
export type Clue = { person: string; text: string; rules: Rule[] };
export type Puzzle = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  location: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Challenging' | 'Expert' | 'Master';
  rating?: {
    score: number;
    candidates: number;
    relationships: number;
    directClues: number;
    searchNodes: number;
  };
  minutes: string;
  size: number;
  rooms: Room[];
  layout: string[][];
  furniture: Furniture[];
  people: Person[];
  victim: string;
  clues: Clue[];
  solution: Placements;
  introduction: string;
  conclusion: string;
};
export type Snapshot = { placements: Placements; marks: number[] };
export type GameSession = Snapshot & {
  history: Snapshot[];
  checkedClues: string[];
  elapsed: number;
  hints: number;
  solved: boolean;
};
export type SaveData = {
  version: 1;
  activeCase: string;
  sessions: Record<string, GameSession>;
  tutorialSeen: boolean;
  haptics: boolean;
  sound?: boolean;
};
