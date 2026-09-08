import { Person, Puzzle, Room } from './types';

const person = (
  id: string,
  name: string,
  role: string,
  color: string,
  style: Person['style'],
  skin = '#E6B98F',
  hair = '#493D37',
): Person => ({ id, name, role, color, style, skin, hair });
const room = (id: string, name: string, color: string, ink: string): Room => ({
  id,
  name,
  color,
  ink,
});
const quadrants = (a: string, b: string, c: string, d: string) =>
  Array.from({ length: 6 }, (_, row) =>
    Array.from({ length: 6 }, (_, col) => (row < 3 ? (col < 3 ? a : b) : col < 3 ? c : d)),
  );

export const LEGACY_CASES: Puzzle[] = [
  {
    id: 'briarwood',
    number: '001',
    title: 'A Very Quiet Evening',
    subtitle: 'Trouble is brewing at Briarwood Manor.',
    location: 'Briarwood Manor',
    difficulty: 'Beginner',
    minutes: '5–10',
    size: 6,
    rooms: [
      room('study', 'Study', '#F0D9C8', '#8C6049'),
      room('garden', 'Conservatory', '#DDE5CD', '#64724D'),
      room('parlour', 'Parlour', '#E1DDED', '#7D7190'),
      room('kitchen', 'Kitchen', '#F0E5BC', '#8B7B43'),
    ],
    layout: quadrants('study', 'garden', 'parlour', 'kitchen'),
    furniture: [
      { id: 'desk', name: 'Writing desk', kind: 'desk', cell: 1 },
      { id: 'books', name: 'Bookcase', kind: 'books', cell: 6 },
      { id: 'plant', name: 'Potted palm', kind: 'plant', cell: 3 },
      { id: 'fern', name: 'Fern', kind: 'plant', cell: 11 },
      { id: 'flowers', name: 'Flowers', kind: 'flowers', cell: 16 },
      { id: 'sofa', name: 'Sofa', kind: 'sofa', cell: 18 },
      { id: 'globe', name: 'Globe', kind: 'globe', cell: 26 },
      { id: 'table', name: 'Coffee table', kind: 'table', cell: 30 },
      { id: 'stove', name: 'Stove', kind: 'stove', cell: 28 },
      { id: 'teatable', name: 'Tea table', kind: 'table', cell: 23 },
    ],
    people: [
      person('ada', 'Ada', 'The niece', '#B8725C', 'bob'),
      person('felix', 'Felix', 'The botanist', '#748B6A', 'glasses', '#A77958', '#302E2B'),
      person('mabel', 'Mabel', 'The housekeeper', '#9B8BAA', 'bun', '#EAC29D', '#D6D1BF'),
      person('otto', 'Otto', 'The chef', '#BE9E57', 'moustache', '#DFAC87', '#594332'),
      person('iris', 'Iris', 'The journalist', '#688F94', 'curls', '#AF7957', '#3F3029'),
      person('victor', 'Victor', 'The victim', '#91938A', 'hat', '#DEBDA1', '#8A8073'),
    ],
    victim: 'victor',
    clues: [
      {
        person: 'ada',
        text: 'I was in the top row of the study, beside the writing desk.',
        rules: [
          { type: 'room', room: 'study' },
          { type: 'row', value: 0 },
          { type: 'beside', object: 'desk' },
        ],
      },
      {
        person: 'felix',
        text: 'I was in the conservatory, beside the fern.',
        rules: [
          { type: 'room', room: 'garden' },
          { type: 'beside', object: 'fern' },
        ],
      },
      {
        person: 'mabel',
        text: 'I was in the parlour, in the same column as the globe.',
        rules: [
          { type: 'room', room: 'parlour' },
          { type: 'objectColumn', object: 'globe' },
        ],
      },
      {
        person: 'otto',
        text: 'I was in the kitchen, beside the stove.',
        rules: [
          { type: 'room', room: 'kitchen' },
          { type: 'beside', object: 'stove' },
        ],
      },
      {
        person: 'iris',
        text: 'I was in the bottom row, in column D.',
        rules: [
          { type: 'row', value: 5 },
          { type: 'column', value: 3 },
        ],
      },
      { person: 'victor', text: 'Victor was alone with the murderer in the same room.', rules: [] },
    ],
    solution: { ada: 0, felix: 10, mabel: 20, otto: 29, iris: 33, victor: 13 },
    introduction:
      'The tea is cold. The clock has stopped. And Victor Briarwood will not be joining his guests for dinner. Six people, four rooms, and one very suspicious evening. Everyone’s statement is true—even the killer’s. Find where they stood, and the floor plan will tell the rest.',
    conclusion:
      'Ada was at A1 and Victor at B3, alone together in the study. Felix was tending the conservatory, Mabel was in the parlour, and Otto and Iris were in the kitchen. The room placements leave just one possible culprit: Ada.',
  },
  {
    id: 'encore',
    number: '002',
    title: 'The Last Encore',
    subtitle: 'The final note was not in the score.',
    location: 'The Bellweather Club',
    difficulty: 'Intermediate',
    minutes: '10–15',
    size: 6,
    rooms: [
      room('gallery', 'Gallery', '#F0D9C8', '#8C6049'),
      room('music', 'Music room', '#E1DDED', '#7D7190'),
      room('terrace', 'Terrace', '#DDE5CD', '#64724D'),
      room('lounge', 'Lounge', '#F0E5BC', '#8B7B43'),
    ],
    layout: quadrants('gallery', 'music', 'terrace', 'lounge'),
    furniture: [
      { id: 'piano', name: 'Piano', kind: 'piano', cell: 4 },
      { id: 'easel', name: 'Easel', kind: 'easel', cell: 7 },
      { id: 'sculpture', name: 'Side table', kind: 'table', cell: 0 },
      { id: 'roses', name: 'Rose bush', kind: 'flowers', cell: 25 },
      { id: 'bench', name: 'Bench', kind: 'sofa', cell: 19 },
      { id: 'records', name: 'Record player', kind: 'records', cell: 28 },
      { id: 'books', name: 'Bookshelf', kind: 'books', cell: 23 },
      { id: 'plant', name: 'Palm', kind: 'plant', cell: 17 },
    ],
    people: [
      person('beatrice', 'Beatrice', 'The soprano', '#A57B92', 'bun', '#CE9873', '#322C2C'),
      person('hugo', 'Hugo', 'The art dealer', '#A27F5A', 'moustache'),
      person('celia', 'Celia', 'The critic', '#7C997C', 'bob', '#A87558', '#403129'),
      person('leon', 'Leon', 'The pianist', '#7B8DAB', 'glasses'),
      person('violet', 'Violet', 'The florist', '#AB88A9', 'curls', '#E9C19F', '#8A553C'),
      person('ambrose', 'Ambrose', 'The victim', '#91938A', 'hat'),
    ],
    victim: 'ambrose',
    clues: [
      {
        person: 'beatrice',
        text: 'I was in the music room, beside the piano.',
        rules: [
          { type: 'room', room: 'music' },
          { type: 'beside', object: 'piano' },
        ],
      },
      {
        person: 'hugo',
        text: 'I was in the gallery, beside the easel and east of Celia.',
        rules: [
          { type: 'room', room: 'gallery' },
          { type: 'beside', object: 'easel' },
          { type: 'relative', person: 'celia', direction: 'east' },
        ],
      },
      {
        person: 'celia',
        text: 'I was on the terrace, exactly two rows north of Violet.',
        rules: [
          { type: 'room', room: 'terrace' },
          { type: 'relative', person: 'violet', direction: 'north', distance: 2 },
        ],
      },
      {
        person: 'leon',
        text: 'I was in the lounge, beside the record player and west of Ambrose.',
        rules: [
          { type: 'room', room: 'lounge' },
          { type: 'beside', object: 'records' },
          { type: 'relative', person: 'ambrose', direction: 'west' },
        ],
      },
      {
        person: 'violet',
        text: 'I was in the bottom row, in the same column as the rose bush.',
        rules: [
          { type: 'row', value: 5 },
          { type: 'objectColumn', object: 'roses' },
        ],
      },
      {
        person: 'ambrose',
        text: 'Ambrose was alone with the murderer in the same room.',
        rules: [],
      },
    ],
    solution: { beatrice: 5, hugo: 8, celia: 18, leon: 27, violet: 31, ambrose: 16 },
    introduction:
      'A private recital, a room full of old rivals, and a conductor who never took his final bow. The guests remember where they stood when the music stopped. Their statements are true; their intentions are another matter.',
    conclusion:
      'Beatrice stood at F1 and Ambrose at E3, the only two people in the music room. Hugo was in the gallery, Celia and Violet were on the terrace, and Leon was in the lounge. Beatrice’s encore was her last alibi.',
  },
  {
    id: 'midnight',
    number: '003',
    title: 'Murder on the Marigold',
    subtitle: 'A one-way ticket. An unscheduled ending.',
    location: 'The Marigold Express',
    difficulty: 'Challenging',
    minutes: '15–20',
    size: 7,
    rooms: [
      room('cabin', 'Sleeper cabin', '#E1DDED', '#7D7190'),
      room('dining', 'Dining car', '#F0D9C8', '#8C6049'),
      room('corridor', 'Corridor', '#F0E5BC', '#8B7B43'),
      room('luggage', 'Luggage', '#DDE5CD', '#64724D'),
      room('lounge', 'Lounge', '#DBE4E8', '#657C87'),
    ],
    layout: [
      ['cabin', 'cabin', 'cabin', 'dining', 'dining', 'dining', 'dining'],
      ['cabin', 'cabin', 'cabin', 'dining', 'dining', 'dining', 'dining'],
      ['cabin', 'cabin', 'cabin', 'dining', 'dining', 'dining', 'dining'],
      ['corridor', 'corridor', 'corridor', 'corridor', 'luggage', 'luggage', 'luggage'],
      ['corridor', 'corridor', 'corridor', 'corridor', 'luggage', 'luggage', 'luggage'],
      ['lounge', 'lounge', 'lounge', 'lounge', 'luggage', 'luggage', 'luggage'],
      ['lounge', 'lounge', 'lounge', 'lounge', 'luggage', 'luggage', 'luggage'],
    ],
    furniture: [
      { id: 'suitcase', name: 'Suitcase', kind: 'trunk', cell: 1 },
      { id: 'lamp', name: 'Lamp', kind: 'lamp', cell: 12 },
      { id: 'easel', name: 'Easel', kind: 'easel', cell: 28 },
      { id: 'trunk', name: 'Trunk', kind: 'trunk', cell: 34 },
      { id: 'chair', name: 'Armchair', kind: 'sofa', cell: 37 },
      { id: 'books', name: 'Bookcase', kind: 'books', cell: 44 },
      { id: 'table', name: 'Dining table', kind: 'table', cell: 10 },
      { id: 'plant', name: 'Plant', kind: 'plant', cell: 20 },
      { id: 'bed', name: 'Sofa', kind: 'sofa', cell: 14 },
    ],
    people: [
      person('nora', 'Nora', 'The novelist', '#AC7892', 'bob'),
      person('edgar', 'Edgar', 'The investor', '#A0895F', 'hat', '#BD8761', '#48372B'),
      person('june', 'June', 'The painter', '#7F9B78', 'curls'),
      person('silas', 'Silas', 'The porter', '#688A98', 'moustache', '#9F7055', '#292C2B'),
      person('pearl', 'Pearl', 'The jeweller', '#A58CAF', 'bun', '#EBC4A2', '#D8D1BC'),
      person('theo', 'Theo', 'The student', '#B77B62', 'glasses'),
      person('oswald', 'Oswald', 'The victim', '#91938A', 'moustache', '#DCB694', '#A19B8A'),
    ],
    victim: 'oswald',
    clues: [
      {
        person: 'nora',
        text: 'I was in the sleeper cabin, beside the suitcase.',
        rules: [
          { type: 'room', room: 'cabin' },
          { type: 'beside', object: 'suitcase' },
        ],
      },
      {
        person: 'edgar',
        text: 'I was in the dining car, beside the lamp and east of Oswald.',
        rules: [
          { type: 'room', room: 'dining' },
          { type: 'beside', object: 'lamp' },
          { type: 'relative', person: 'oswald', direction: 'east' },
        ],
      },
      {
        person: 'june',
        text: 'I was in the corridor, in the same column as the easel.',
        rules: [
          { type: 'room', room: 'corridor' },
          { type: 'objectColumn', object: 'easel' },
        ],
      },
      {
        person: 'silas',
        text: 'I was in the luggage room, beside the trunk, two rows north of Theo.',
        rules: [
          { type: 'room', room: 'luggage' },
          { type: 'beside', object: 'trunk' },
          { type: 'relative', person: 'theo', direction: 'north', distance: 2 },
        ],
      },
      {
        person: 'pearl',
        text: 'I was in the lounge, beside the armchair and north of Theo.',
        rules: [
          { type: 'room', room: 'lounge' },
          { type: 'beside', object: 'chair' },
          { type: 'relative', person: 'theo', direction: 'north' },
        ],
      },
      {
        person: 'theo',
        text: 'I was in the bottom row, west of and beside the bookcase.',
        rules: [
          { type: 'row', value: 6 },
          { type: 'column', value: 1 },
          { type: 'beside', object: 'books' },
        ],
      },
      { person: 'oswald', text: 'Oswald was alone with the murderer in the same room.', rules: [] },
    ],
    solution: { nora: 2, edgar: 13, june: 21, silas: 33, pearl: 38, theo: 43, oswald: 18 },
    introduction:
      'The Marigold Express has stopped between stations. In the dining car, an untouched supper is growing cold. Seven passengers can account for their positions, but only the floor plan can account for Oswald’s final moments.',
    conclusion:
      'Edgar at G2 and Oswald at E3 were the only people in the dining car. Nora was in the sleeper cabin, June in the corridor, Silas with the luggage, and Pearl and Theo in the lounge. Edgar’s position is the evidence that closes the case.',
  },
];
