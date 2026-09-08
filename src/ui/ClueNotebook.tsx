import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, Feather, MapPin } from 'lucide-react-native';
import { clueStatus, coordinate } from '../game/engine';
import { GameSession, Puzzle } from '../game/types';
import { Portrait } from './Illustrations';
import { Eyebrow, Type } from './primitives';
import { colors, fonts } from './theme';

export function ClueNotebook({
  puzzle,
  session,
  selected,
  onSelect,
  onCheck,
  showValidation,
}: {
  puzzle: Puzzle;
  session: GameSession;
  selected: string | null;
  onSelect: (id: string) => void;
  onCheck: (id: string) => void;
  showValidation: boolean;
}) {
  return (
    <View style={s.notebook}>
      <View style={s.spiral}>
        {Array.from({ length: 9 }, (_, index) => (
          <View key={index} style={s.binding}>
            <View style={s.hole} />
            <View style={s.ring} />
          </View>
        ))}
      </View>
      <View style={s.header}>
        <View>
          <Eyebrow>THE DETECTIVE’S NOTEBOOK</Eyebrow>
          <Type accessibilityRole="header" style={s.title}>
            Everyone has a story.
          </Type>
        </View>
        <Feather size={24} color={colors.rust} strokeWidth={1.3} />
      </View>
      <Type style={s.intro}>
        Their statements are true. Use them to find where everyone was standing.
      </Type>
      <View style={{ gap: 8 }}>
        {puzzle.clues.map((clue) => {
          const person = puzzle.people.find((item) => item.id === clue.person)!;
          const active = person.id === selected;
          const checked = session.checkedClues.includes(person.id);
          const position = session.placements[person.id];
          const invalid =
            showValidation && clueStatus(puzzle, clue, session.placements) === 'broken';
          const victim = person.id === puzzle.victim;
          return (
            <View
              key={person.id}
              style={[
                s.clue,
                active && s.active,
                invalid && s.invalid,
                victim && !active && { backgroundColor: '#ECEDE54D', borderStyle: 'dashed' },
              ]}
            >
              <Pressable
                testID={`clue-${person.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Select ${person.name}. ${clue.text}`}
                accessibilityState={{ selected: active }}
                onPress={() => onSelect(person.id)}
                style={({ pressed }) => [s.clueButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={{ marginTop: 1 }}>
                  <Portrait person={person} size={43} faded={victim} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.nameRow}>
                    <Type style={s.name}>{person.name}</Type>
                    <Type style={[s.role, victim && { color: colors.rust }]}>{person.role}</Type>
                    {position !== undefined && (
                      <View style={s.coordinate}>
                        <MapPin size={9} color={colors.green} />
                        <Type style={s.coordinateText}>{coordinate(position, puzzle.size)}</Type>
                      </View>
                    )}
                  </View>
                  <Type style={[s.statement, invalid && { color: colors.rust }]}>
                    {victim ? clue.text : `“${clue.text}”`}
                  </Type>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel={`Mark ${person.name}'s clue as reviewed`}
                accessibilityState={{ checked }}
                aria-checked={checked}
                onPress={() => onCheck(person.id)}
                style={s.checkboxTouch}
              >
                <View
                  style={[
                    s.checkbox,
                    checked && { backgroundColor: colors.green, borderColor: colors.green },
                  ]}
                >
                  {checked && <Check size={11} color={colors.paper} strokeWidth={2.5} />}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={s.footer}>
        <View style={s.line} />
        <Type style={s.footerText}>The smallest detail can tell the biggest story.</Type>
        <View style={s.line} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  notebook: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 23,
    paddingTop: 28,
    boxShadow: '3px 4px 0 #E5E3D7',
    position: 'relative',
  },
  spiral: {
    position: 'absolute',
    top: -8,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  binding: { width: 12, height: 17, alignItems: 'center', justifyContent: 'flex-end' },
  hole: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C7C7B7' },
  ring: {
    position: 'absolute',
    top: 0,
    width: 6,
    height: 14,
    backgroundColor: '#EBE9DE',
    borderWidth: 1.3,
    borderColor: '#939A87',
    borderRadius: 4,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontFamily: fonts.title, fontSize: 24, lineHeight: 33, marginTop: 4 },
  intro: { fontSize: 12, lineHeight: 19, color: colors.secondary, marginTop: 7, marginBottom: 19 },
  clue: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E7E6DD',
    flexDirection: 'row',
    backgroundColor: '#FEFDF8',
  },
  active: { borderColor: '#849776', backgroundColor: '#EEF1E4' },
  invalid: { borderColor: colors.rust, backgroundColor: '#F9EDE4' },
  clueButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 11,
    paddingRight: 0,
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 18 },
  role: { fontSize: 10, lineHeight: 16, color: colors.muted },
  statement: { fontSize: 11.5, lineHeight: 18, color: '#5E665A' },
  coordinate: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' },
  coordinateText: { fontSize: 9, lineHeight: 14, color: colors.green, fontFamily: fonts.bold },
  checkboxTouch: {
    width: 35,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#BFC3B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.line },
  footerText: {
    fontFamily: fonts.title,
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
    flexShrink: 1,
  },
});
