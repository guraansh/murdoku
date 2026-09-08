import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Lightbulb,
  Pause,
  Pencil,
  Settings2,
  Undo2,
  Armchair,
} from 'lucide-react-native';
import { InvestigationProps, timeLabel } from './Investigation';
import { GameBoard } from './GameBoard';
import { FurnitureArt, Portrait } from './Illustrations';
import { Button, Eyebrow, Type } from './primitives';
import { colors, fonts } from './theme';
import { Motion } from './Motion';
import { coordinate, ruleStatus } from '../game/engine';

export function PlayScreen(p: InvestigationProps & { settings: () => void }) {
  const [bounds, setBounds] = useState({ width: 360, height: 720 });
  const [objects, setObjects] = useState(false);
  const [objectIndex, setObjectIndex] = useState(0);
  const [cluePage, setCluePage] = useState(0);
  const personIndex = Math.max(
    0,
    p.puzzle.people.findIndex((x) => x.id === p.selected),
  );
  const person = p.puzzle.people[personIndex];
  const clue = p.puzzle.clues.find((x) => x.person === person.id)!;
  const chunks = clue.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [clue.text];
  const pages = chunks.map((text) => text.trim());
  const page = Math.min(cluePage, pages.length - 1);
  const landscape = bounds.width > bounds.height * 1.2;
  const boardSize = Math.max(
    100,
    Math.min(
      landscape ? bounds.width * 0.52 - 44 : bounds.width - 42,
      bounds.height - (landscape ? 136 : bounds.height < 740 ? 422 : 454),
      600,
    ),
  );
  const object = p.puzzle.furniture[objectIndex % p.puzzle.furniture.length];
  const choose = (id: string) => {
    setCluePage(0);
    setObjects(false);
    p.choosePerson(id);
  };
  const tool = (
    label: string,
    icon: React.ReactNode,
    action: () => void,
    active = false,
    disabled = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        (
          {
            Undo: 'Undo last move',
            Mark: 'Toggle pencil marks',
            Hint: 'Get a hint',
            Help: 'How to play',
          } as Record<string, string>
        )[label] ?? label
      }
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={action}
      style={({ pressed }) => [
        a.tool,
        active && a.active,
        {
          opacity: disabled ? 0.35 : pressed ? 0.65 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
    >
      {icon}
      <Type style={a.toolText}>{label}</Type>
    </Pressable>
  );
  return (
    <View testID="play-screen" style={a.screen} onLayout={(e) => setBounds(e.nativeEvent.layout)}>
      <View style={a.top}>
        {tool('Back to case files', <ArrowLeft size={21} color={colors.ink} />, p.library)}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Read the case briefing"
          onPress={p.briefing}
          style={{ flex: 1 }}
        >
          <Eyebrow>
            CASE {p.puzzle.number} · {p.puzzle.difficulty}
          </Eyebrow>
          <Type accessibilityRole="header" numberOfLines={1} style={a.title}>
            {p.puzzle.title}
          </Type>
        </Pressable>
        {tool('Settings', <Settings2 size={20} color={colors.ink} />, p.settings)}
      </View>
      <View style={[a.body, landscape && { flexDirection: 'row', alignItems: 'center' }]}>
        <View style={[a.scene, landscape && { flex: 1 }]}>
          <View style={a.meta}>
            <Type style={a.small}>{p.puzzle.location}</Type>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pause investigation"
              onPress={p.pause}
              style={a.pause}
            >
              <Type testID="timer" style={a.small}>
                {timeLabel(p.session.elapsed)}
              </Type>
              <Pause size={15} color={colors.ink} />
            </Pressable>
          </View>
          <GameBoard
            fitSize={boardSize}
            puzzle={p.puzzle}
            session={p.session}
            selected={p.selected}
            mode={p.mode}
            onCell={p.onCell}
            highlight={p.highlight}
          />
          <View style={a.meta}>
            <Type style={a.small}>One per row · One per column</Type>
            <Type testID="placement-count" style={a.small}>
              {Object.keys(p.session.placements).length}/{p.puzzle.people.length} placed
            </Type>
          </View>
        </View>
        <View style={[a.dock, landscape && { flex: 1 }]}>
          <View style={a.people}>
            {p.puzzle.people.map((x) => (
              <Pressable
                key={x.id}
                testID={`person-${x.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Select ${x.name}`}
                accessibilityState={{ selected: x.id === p.selected }}
                onPress={() => choose(x.id)}
                style={({ pressed }) => [
                  a.person,
                  x.id === p.selected && a.active,
                  { transform: [{ scale: pressed ? 0.92 : 1 }] },
                ]}
              >
                <Portrait
                  person={x}
                  size={Math.min(42, (bounds.width - 42) / p.puzzle.people.length - 5)}
                  faded={x.id === p.puzzle.victim}
                />
                <Type numberOfLines={1} adjustsFontSizeToFit style={a.name}>
                  {x.name}
                </Type>
                {p.session.placements[x.id] !== undefined && <View style={a.dot} />}
              </Pressable>
            ))}
          </View>
          <View style={[a.evidence, bounds.height < 740 && { height: 140 }]}>
            <View style={a.meta}>
              <Eyebrow>
                {objects
                  ? 'SCENE OBJECTS'
                  : `${person.name} · ${p.showValidation && clue.rules.some((rule) => ruleStatus(p.puzzle, person.id, rule, p.session.placements) === 'broken') ? 'REVISIT CLUE' : 'TESTIMONY'}`}
              </Eyebrow>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Furniture key"
                onPress={() => setObjects(!objects)}
                style={a.tab}
              >
                <Armchair size={16} color={colors.green} />
                <Type style={a.small}>{objects ? 'Clues' : 'Objects'}</Type>
              </Pressable>
            </View>
            <Motion
              identity={`${person.id}-${page}-${objects}-${objectIndex}`}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {objects ? (
                <View style={a.object}>
                  <FurnitureArt kind={object.kind} name={object.name} size={50} />
                  <View>
                    <Type style={{ fontFamily: fonts.bold }}>{object.name}</Type>
                    <Type>{coordinate(object.cell, p.puzzle.size)}</Type>
                  </View>
                </View>
              ) : (
                <Type testID={`clue-${person.id}`} style={a.clue}>
                  {pages[page]}
                </Type>
              )}
            </Motion>
            <View style={a.meta}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={objects ? 'Previous object' : 'Previous witness'}
                onPress={() =>
                  objects
                    ? setObjectIndex(
                        (objectIndex + p.puzzle.furniture.length - 1) % p.puzzle.furniture.length,
                      )
                    : choose(
                        p.puzzle.people[
                          (personIndex + p.puzzle.people.length - 1) % p.puzzle.people.length
                        ].id,
                      )
                }
                style={a.arrow}
              >
                <ArrowLeft size={18} color={colors.green} />
              </Pressable>
              {objects ? (
                <Type style={a.small}>
                  {(objectIndex % p.puzzle.furniture.length) + 1} / {p.puzzle.furniture.length}
                </Type>
              ) : pages.length > 1 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Next clue page"
                    onPress={() => setCluePage((page + 1) % pages.length)}
                    style={a.tab}
                  >
                    <Type style={a.small}>
                      Clue {page + 1}/{pages.length} · Next
                    </Type>
                  </Pressable>
                  <Pressable
                    accessibilityRole="checkbox"
                    aria-checked={p.session.checkedClues.includes(person.id)}
                    accessibilityLabel={`Mark ${person.name}'s clue as reviewed`}
                    accessibilityState={{ checked: p.session.checkedClues.includes(person.id) }}
                    onPress={() => p.checkClue(person.id)}
                    style={a.arrow}
                  >
                    <Check
                      size={18}
                      color={
                        p.session.checkedClues.includes(person.id) ? colors.green : colors.muted
                      }
                    />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="checkbox"
                  aria-checked={p.session.checkedClues.includes(person.id)}
                  accessibilityLabel={`Mark ${person.name}'s clue as reviewed`}
                  accessibilityState={{ checked: p.session.checkedClues.includes(person.id) }}
                  onPress={() => p.checkClue(person.id)}
                  style={a.tab}
                >
                  <Check size={15} color={colors.green} />
                  <Type style={a.small}>
                    {p.session.checkedClues.includes(person.id) ? 'Reviewed' : 'Mark reviewed'}
                  </Type>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={objects ? 'Next object' : 'Next witness'}
                onPress={() =>
                  objects
                    ? setObjectIndex((objectIndex + 1) % p.puzzle.furniture.length)
                    : choose(p.puzzle.people[(personIndex + 1) % p.puzzle.people.length].id)
                }
                style={a.arrow}
              >
                <ArrowRight size={18} color={colors.green} />
              </Pressable>
            </View>
          </View>
          <View style={a.controls}>
            {tool(
              'Undo',
              <Undo2 size={21} color={colors.ink} />,
              p.undo,
              false,
              !p.session.history.length || p.session.solved,
            )}
            {tool(
              'Mark',
              <Pencil size={21} color={colors.ink} />,
              p.toggleMark,
              p.mode === 'mark',
              p.session.solved,
            )}
            {tool(
              'Hint',
              <Lightbulb size={21} color={colors.ink} />,
              p.hint,
              false,
              p.session.solved,
            )}
            <Button onPress={p.check} style={{ flex: 1 }}>
              {p.session.solved
                ? 'Case closed'
                : Object.keys(p.session.placements).length === p.puzzle.people.length
                  ? 'Solve case'
                  : 'Check scene'}
            </Button>
            {tool('Help', <CircleHelp size={20} color={colors.ink} />, p.help)}
          </View>
        </View>
      </View>
      {p.feedback && (
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[a.toast, p.feedback.error && { backgroundColor: colors.rust }]}
        >
          <Type style={{ color: colors.paper, fontSize: 12 }}>{p.feedback.text}</Type>
        </View>
      )}
    </View>
  );
}
const a = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 12, paddingBottom: 8, overflow: 'hidden' },
  top: { height: 60, flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontFamily: fonts.title, fontSize: 19, lineHeight: 24 },
  body: { flex: 1, justifyContent: 'space-evenly', gap: 6 },
  scene: { alignItems: 'center' },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 6,
  },
  small: { fontSize: 10, lineHeight: 15, color: colors.secondary },
  pause: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 32,
    paddingHorizontal: 8,
  },
  dock: { gap: 8, width: '100%', maxWidth: 620, alignSelf: 'center' },
  people: { flexDirection: 'row', gap: 2 },
  person: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  name: { fontSize: 9, lineHeight: 14 },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  active: { backgroundColor: colors.greenLight, borderColor: colors.green },
  evidence: {
    height: 172,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clue: { fontSize: 13, lineHeight: 19 },
  object: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32 },
  arrow: { width: 44, height: 32, alignItems: 'center', justifyContent: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 4 },
  tool: {
    minWidth: 44,
    minHeight: 48,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toolText: { fontSize: 8, lineHeight: 12, maxWidth: 44, textAlign: 'center' },
  toast: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 65,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.green,
    elevation: 6,
  },
});
