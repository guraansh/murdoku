import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  FileSearch,
  Lightbulb,
  Pause,
  Pencil,
  Search,
  ShieldCheck,
  Sparkles,
  Undo2,
} from 'lucide-react-native';
import { GameSession, Puzzle } from '../game/types';
import { GameBoard } from './GameBoard';
import { ClueNotebook } from './ClueNotebook';
import { Portrait } from './Illustrations';
import { Button, Eyebrow, Type } from './primitives';
import { colors, fonts } from './theme';
import { s } from './styles';

export const timeLabel = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
export type InvestigationProps = {
  puzzle: Puzzle;
  session: GameSession;
  compact: boolean;
  small: boolean;
  selected: string | null;
  mode: 'place' | 'mark';
  tutorialSeen: boolean;
  showValidation: boolean;
  highlight?: number;
  feedback: { text: string; error?: boolean } | null;
  library: () => void;
  help: () => void;
  briefing: () => void;
  pause: () => void;
  hint: () => void;
  check: () => void;
  undo: () => void;
  toggleMark: () => void;
  onCell: (cell: number) => void;
  choosePerson: (id: string) => void;
  checkClue: (id: string) => void;
};
export function Investigation(props: InvestigationProps) {
  const { puzzle, session, compact, small, selected, mode, feedback } = props;
  const placed = Object.keys(session.placements).length;
  const selectedPerson = puzzle.people.find((person) => person.id === selected);
  return (
    <>
      <View style={s.breadcrumb}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to case files"
          onPress={props.library}
          style={s.inline}
        >
          <ArrowLeft size={13} color={colors.muted} />
          <Eyebrow>CASE FILES</Eyebrow>
        </Pressable>
        <ChevronRight size={12} color={colors.muted} />
        <Eyebrow style={{ color: colors.secondary }}>NO. {puzzle.number}</Eyebrow>
        <View style={s.pill}>
          <View
            style={[s.tinyDot, { backgroundColor: session.solved ? colors.green : colors.gold }]}
          />
          <Type style={s.pillText}>{session.solved ? 'Case closed' : puzzle.difficulty}</Type>
        </View>
      </View>
      <View style={s.titleRow}>
        <View style={{ flex: 1 }}>
          <Type
            accessibilityRole="header"
            style={[
              s.largeTitle,
              compact && { fontSize: small ? 34 : 42, lineHeight: small ? 42 : 52 },
            ]}
          >
            {puzzle.title}
          </Type>
          <Type style={s.subtitle}>{puzzle.subtitle} Find out whodunit.</Type>
        </View>
        {!compact && (
          <Pressable
            onPress={props.briefing}
            accessibilityRole="button"
            accessibilityLabel="Read the case briefing"
            style={s.stamp}
          >
            <Search size={19} color={colors.rust} strokeWidth={1.4} />
            <Type style={s.stampText}>{session.solved ? 'CASE CLOSED' : 'OPEN CASE'}</Type>
            <Type style={s.stampNumber}>№ {puzzle.number}</Type>
          </Pressable>
        )}
      </View>
      {!props.tutorialSeen && (
        <Pressable accessibilityRole="button" onPress={props.help} style={s.welcome}>
          <View style={s.inline}>
            <Sparkles size={17} color={colors.rust} />
            <Type style={{ fontSize: 12, flexShrink: 1 }}>
              A new detective? Your first clue is right here.
            </Type>
          </View>
          <View style={s.inline}>
            <Type style={{ fontFamily: fonts.bold, fontSize: 11 }}>Learn to play</Type>
            <ArrowRight size={15} color={colors.green} />
          </View>
        </Pressable>
      )}
      <View style={[s.gameColumns, compact && { flexDirection: 'column', gap: 32 }]}>
        <View
          style={[
            s.boardColumn,
            compact && { width: '100%', flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
          ]}
        >
          <View style={s.boardMeta}>
            <Pressable accessibilityRole="button" onPress={props.briefing} style={s.inline}>
              <FileSearch size={14} color={colors.rust} />
              <Type style={{ fontSize: 11, color: colors.secondary }}>Read the case briefing</Type>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pause investigation"
              onPress={props.pause}
              style={[s.inline, { minHeight: 32 }]}
            >
              <Clock3 size={13} color={colors.muted} />
              <Type testID="timer" style={s.time}>
                {timeLabel(session.elapsed)}
              </Type>
              {!session.solved && <Pause size={12} color={colors.muted} />}
            </Pressable>
          </View>
          <GameBoard
            puzzle={puzzle}
            session={session}
            selected={selected}
            mode={mode}
            onCell={props.onCell}
            highlight={props.highlight}
          />
          <View style={s.trayHeader}>
            <Eyebrow style={small ? { fontSize: 8, letterSpacing: 1 } : undefined}>
              {session.solved
                ? 'THE SCENE, RECONSTRUCTED'
                : mode === 'mark'
                  ? 'MARK EMPTY SQUARES WITH AN ×'
                  : 'SELECT A PERSON, THEN TAP A SQUARE'}
            </Eyebrow>
            <Type testID="placement-count" style={{ fontSize: 10, color: colors.muted }}>
              {placed}/{puzzle.people.length} placed
            </Type>
          </View>
          <ScrollView
            horizontal
            // RN Web can shrink a horizontal scroller to zero inside the compact
            // column layout; keeping its height fixed preserves the person targets.
            style={{ flexGrow: 0, flexShrink: 0, height: small ? 75 : 84 }}
            contentContainerStyle={s.peopleTray}
          >
            {puzzle.people.map((person) => {
              const active = person.id === selected && mode === 'place';
              return (
                <Pressable
                  key={person.id}
                  testID={`person-${person.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${person.name}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => props.choosePerson(person.id)}
                  style={({ pressed }) => [
                    s.person,
                    active && s.personSelected,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View>
                    <Portrait
                      person={person}
                      size={small ? 35 : 44}
                      faded={person.id === puzzle.victim}
                    />
                    {session.placements[person.id] !== undefined && (
                      <View style={s.placedBadge}>
                        <Check size={8} color={colors.paper} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  <Type
                    style={[
                      s.personName,
                      active && { color: colors.green, fontFamily: fonts.bold },
                    ]}
                  >
                    {person.name}
                  </Type>
                </Pressable>
              );
            })}
          </ScrollView>
          {compact && selectedPerson && mode === 'place' && (
            <View
              style={{
                backgroundColor: colors.paper,
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: 8,
                padding: 12,
                marginTop: 10,
              }}
            >
              <Type style={{ fontFamily: fonts.bold, fontSize: 11, marginBottom: 3 }}>
                {selectedPerson.name} · {selectedPerson.role}
              </Type>
              <Type style={{ color: colors.secondary, fontSize: 12, lineHeight: 19 }}>
                {puzzle.clues.find((clue) => clue.person === selectedPerson.id)?.text}
              </Type>
            </View>
          )}
          <View style={s.tools}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Undo last move"
              accessibilityState={{ disabled: !session.history.length || session.solved }}
              disabled={!session.history.length || session.solved}
              onPress={props.undo}
              style={[s.tool, (!session.history.length || session.solved) && { opacity: 0.35 }]}
            >
              <Undo2 size={18} color={colors.ink} />
              <Type style={s.toolLabel}>Undo</Type>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle pencil marks"
              accessibilityState={{ selected: mode === 'mark', disabled: session.solved }}
              disabled={session.solved}
              onPress={props.toggleMark}
              style={[
                s.tool,
                mode === 'mark' && { backgroundColor: colors.greenLight },
                session.solved && { opacity: 0.35 },
              ]}
            >
              <Pencil size={18} color={colors.ink} />
              <Type style={s.toolLabel}>Mark</Type>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get a hint"
              accessibilityState={{ disabled: session.solved }}
              disabled={session.solved}
              onPress={props.hint}
              style={[s.tool, session.solved && { opacity: 0.35 }]}
            >
              <Lightbulb size={18} color={colors.ink} />
              <Type style={s.toolLabel}>Hint</Type>
            </Pressable>
            <View style={s.toolDivider} />
            <Button
              style={{ flex: 1, minHeight: 45, paddingHorizontal: small ? 8 : 16 }}
              onPress={props.check}
              icon={
                session.solved ? (
                  <ShieldCheck size={16} color={colors.paper} />
                ) : (
                  <CheckCheck size={16} color={colors.paper} />
                )
              }
            >
              {session.solved
                ? 'Case closed'
                : placed === puzzle.people.length
                  ? 'Solve case'
                  : 'Check scene'}
            </Button>
          </View>
          {feedback && (
            <View
              accessibilityLiveRegion="polite"
              style={[
                s.feedback,
                feedback.error && { backgroundColor: colors.rustLight, borderColor: '#DBBCA6' },
              ]}
            >
              <Type style={{ fontSize: 12, color: feedback.error ? '#92513B' : colors.green }}>
                {feedback.text}
              </Type>
            </View>
          )}
          <Type style={s.tapTip}>
            {session.solved
              ? 'Beautifully deduced. Another mystery awaits in your case files.'
              : mode === 'mark'
                ? 'Tap a square to add or remove an elimination mark.'
                : selectedPerson
                  ? `Placing ${selectedPerson.name} · Tap their token on the board to remove it.`
                  : 'Choose a person to start reconstructing the scene.'}
          </Type>
        </View>
        <View
          style={[
            s.notebookColumn,
            compact && {
              width: '100%',
              flexGrow: 0,
              flexShrink: 0,
              flexBasis: 'auto',
              marginTop: 0,
            },
          ]}
        >
          <ClueNotebook
            puzzle={puzzle}
            session={session}
            selected={selected}
            onSelect={props.choosePerson}
            onCheck={props.checkClue}
            showValidation={props.showValidation}
          />
          <View style={s.gentleNote}>
            <Lightbulb size={16} color={colors.gold} />
            <Type style={s.gentleNoteText}>
              “Beside” means a shared edge in the same room. Diagonals don’t count.
            </Type>
          </View>
        </View>
      </View>
    </>
  );
}
