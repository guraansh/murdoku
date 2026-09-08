import { Clue, Puzzle, Rule } from '../../src/game/types';

// Render only the supplied evidence. The answer is deliberately absent from this type.
type Scene = Pick<Puzzle, 'size' | 'rooms' | 'people' | 'furniture' | 'victim'>;

function tellRule(scene: Scene, rule: Rule): string {
  const name = (id: string) => {
    const person = scene.people.find((item) => item.id === id);
    if (!person) throw new Error(`Unknown witness ${id}`);
    return person.name;
  };
  const room = (id: string) => {
    const item = scene.rooms.find((item) => item.id === id);
    if (!item) throw new Error(`Unknown room ${id}`);
    return item.name.toLowerCase();
  };
  const object = (id: string) => {
    const item = scene.furniture.find((item) => item.id === id);
    if (!item) throw new Error(`Unknown landmark ${id}`);
    return item.name.toLowerCase();
  };
  switch (rule.type) {
    case 'room':
      return `I was in the ${room(rule.room)}.`;
    case 'notRoom':
      return `I wasn't in the ${room(rule.room)}.`;
    case 'oneOfRooms':
      return `I was in either the ${room(rule.rooms[0])} or the ${room(rule.rooms[1])}.`;
    case 'alone':
      return 'I had the room to myself.';
    case 'beside':
      return `I was beside the ${object(rule.object)}.`;
    case 'notBeside':
      return `I wasn't beside the ${object(rule.object)}.`;
    case 'sameRoom':
      return `${name(rule.person)} and I were in the same room.`;
    case 'differentRoom':
      return `${name(rule.person)} and I were in different rooms.`;
    case 'closerToObject':
      return `I was closer to the ${object(rule.near)} than to the ${object(rule.far)}.`;
    case 'closerThan':
      return `The ${object(rule.object)} ${object(rule.object) === 'orchids' ? 'were' : 'was'} closer to me than to ${name(rule.person)}.`;
    case 'between':
      return `${rule.axis === 'row' ? 'North to south' : 'West to east'}: ${name(rule.first)}, me, ${name(rule.second)}.`;
    case 'relative': {
      const axis = rule.direction === 'north' || rule.direction === 'south' ? 'row' : 'column';
      return rule.distance === undefined
        ? `I was ${rule.direction} of ${name(rule.person)}.`
        : `I was ${rule.distance} ${axis}${rule.distance === 1 ? '' : 's'} ${rule.direction} of ${name(rule.person)}.`;
    }
    // Legacy authoring rules remain supported; playable cases exclude these giveaways.
    case 'row':
      return `I was in row ${rule.value + 1}.`;
    case 'column':
      return `I was in column ${String.fromCharCode(65 + rule.value)}.`;
    case 'objectColumn':
      return `I was in the ${object(rule.object)}'s column.`;
    case 'objectRow':
      return `I was in the ${object(rule.object)}'s row.`;
    case 'personDistance':
      return `${rule.distance} grid steps separated ${name(rule.person)} and me.`;
  }
}

export function witnessStatement(scene: Scene, clue: Pick<Clue, 'person' | 'rules'>): string {
  const person = scene.people.find((item) => item.id === clue.person);
  if (!person) throw new Error(`Unknown witness ${clue.person}`);
  if (person.id === scene.victim)
    return `${person.name} shared a room with just one person: the murderer.`;
  return clue.rules.map((rule) => tellRule(scene, rule)).join(' ');
}

export function refreshStatements(puzzle: Puzzle): Puzzle {
  return {
    ...puzzle,
    clues: puzzle.clues.map((clue) => ({ ...clue, text: witnessStatement(puzzle, clue) })),
  };
}
