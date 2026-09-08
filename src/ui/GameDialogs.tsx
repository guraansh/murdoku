import React, { useEffect, useState } from 'react';
import { Pressable, Switch, View } from 'react-native';
import {
  ChevronRight,
  FolderOpen,
  Lightbulb,
  MapPin,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Trophy,
} from 'lucide-react-native';
import { CASES } from '../game/cases';
import { coordinate, culprit, getHint } from '../game/engine';
import { useGame } from '../game/useGame';
import { ManorArt, Portrait } from './Illustrations';
import { timeLabel } from './Investigation';
import { Button, Eyebrow, Sheet, Type } from './primitives';
import { s } from './styles';
import { colors, fonts } from './theme';

export type Dialog =
  | 'help'
  | 'briefing'
  | 'settings'
  | 'hint'
  | 'reset'
  | 'accuse'
  | 'solved'
  | 'notebook'
  | 'pause'
  | null;
type Props = {
  game: ReturnType<typeof useGame>;
  dialog: Dialog;
  setDialog: (dialog: Dialog) => void;
  openCase: (id: string) => void;
  library: () => void;
  reset: () => void;
  onSolved: () => void;
  showHint: (hint: NonNullable<ReturnType<typeof getHint>>) => void;
};

export function GameDialogs({
  game,
  dialog,
  setDialog,
  openCase,
  library,
  reset,
  onSolved,
  showHint,
}: Props) {
  const { puzzle, session, save, setSave, updateSession } = game;
  const [hint, setHint] = useState<ReturnType<typeof getHint>>(null);
  const [accused, setAccused] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [lastDialog, setLastDialog] = useState<Exclude<Dialog, null>>('help');
  const displayedDialog = dialog ?? lastDialog;
  const solvedCount = CASES.filter((item) => save.sessions[item.id]?.solved).length;
  const nextCase = CASES[CASES.indexOf(puzzle) + 1];
  const openInvestigations = CASES.filter(
    (item) => save.sessions[item.id] && !save.sessions[item.id].solved,
  ).sort((a, b) =>
    a.id === puzzle.id ? -1 : b.id === puzzle.id ? 1 : Number(b.number) - Number(a.number),
  );
  useEffect(() => {
    if (dialog) setLastDialog(dialog);
    if (dialog === 'hint') setHint(null);
    if (dialog === 'accuse') {
      setAccused(null);
      setError('');
    }
  }, [dialog]);
  const close = () => setDialog(null);
  const closeHelp = () => {
    setSave((previous) => ({ ...previous, tutorialSeen: true }));
    close();
  };
  function revealHint() {
    const next = getHint(puzzle, session.placements);
    if (!next) {
      setDialog('accuse');
      return;
    }
    setHint(next);
    updateSession((current) => ({ ...current, hints: current.hints + 1 }));
  }
  function accuse() {
    if (!accused) return;
    if (culprit(puzzle, session.placements) !== accused) {
      setError('Look again: the killer is the only suspect sharing a room with the victim.');
      return;
    }
    updateSession((current) => ({ ...current, solved: true }));
    setDialog('solved');
    onSolved();
  }
  const sheetOptions = (
    <>
      <Sheet
        visible={displayedDialog === 'help'}
        onClose={closeHelp}
        eyebrow="A FIELD GUIDE FOR NEW DETECTIVES"
        title="A mystery in every square."
      >
        <View style={{ alignItems: 'center', marginTop: -8, marginBottom: 16 }}>
          <ManorArt width={260} />
        </View>
        {[
          [
            '01',
            'Listen to every story.',
            'Read the case and the statements. Everyone tells the truth—even the murderer. The checkboxes are your own notes, not a correctness check.',
          ],
          [
            '02',
            'Reconstruct the scene.',
            'Select a person, then tap an empty floor square. Place every suspect and the victim exactly once. No two people may share a row or a column. Furniture cannot be occupied.',
          ],
          [
            '03',
            'Read between the lines.',
            '“Beside” means directly above, below, left, or right, in the same room. North means a higher row; east means a column to the right. Relative clues do not require the same column or row.',
          ],
          [
            '04',
            'Find the one who stayed.',
            'Use Mark to cross out empty squares, Undo to retrace a move, and Hint when you need help. Once everyone fits all the clues, solve the case and accuse the suspect alone with the victim.',
          ],
        ].map(([number, title, text]) => (
          <View key={number} style={s.helpRow}>
            <Type style={s.helpNumber}>{number}</Type>
            <View style={{ flex: 1 }}>
              <Type style={s.helpTitle}>{title}</Type>
              <Type style={s.helpText}>{text}</Type>
            </View>
          </View>
        ))}
        <Button onPress={closeHelp} icon={<Search size={17} color={colors.paper} />}>
          Let’s investigate
        </Button>
      </Sheet>
      <Sheet
        visible={displayedDialog === 'briefing'}
        onClose={close}
        eyebrow={`CASE FILE ${puzzle.number} · ${puzzle.location.toUpperCase()}`}
        title={puzzle.title}
      >
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <ManorArt width={260} variant={puzzle.location.includes('Express') ? 2 : 0} />
        </View>
        <Type style={{ fontSize: 15, lineHeight: 26, color: colors.secondary }}>
          {puzzle.introduction}
        </Type>
        <View style={s.briefFacts}>
          <View style={s.inline}>
            <MapPin size={15} color={colors.rust} />
            <Type style={{ fontSize: 12 }}>{puzzle.rooms.length} rooms</Type>
          </View>
          <Type style={{ fontSize: 12 }}>{puzzle.people.length - 1} suspects</Type>
          <Type style={{ fontSize: 12 }}>One killer</Type>
        </View>
        <Button onPress={close}>Back to the scene</Button>
      </Sheet>
      <Sheet
        visible={displayedDialog === 'pause'}
        onClose={close}
        eyebrow="TAKE A BREATHER"
        title="The mystery can wait."
      >
        <Type style={s.modalText}>
          Your investigation is paused. A fresh pair of eyes can make all the difference.
        </Type>
        <Type style={s.pauseTime}>{timeLabel(session.elapsed)}</Type>
        <Button onPress={close} icon={<Play size={16} color={colors.paper} />}>
          Resume investigation
        </Button>
      </Sheet>
      <Sheet
        visible={displayedDialog === 'hint'}
        onClose={close}
        eyebrow="A NOTE FROM THE CHIEF INSPECTOR"
        title={hint ? 'Follow this lead.' : 'Need a fresh lead?'}
      >
        <View style={s.hintIcon}>
          <Lightbulb size={35} color={colors.rust} strokeWidth={1.4} />
        </View>
        <Type style={s.modalText}>
          {hint?.text ??
            'Reveal the location of one person, or find a placement to revisit. You will still place the token yourself. Each revealed hint is recorded in your notebook.'}
        </Type>
        <Type style={s.hintCount}>
          {session.hints} hint{session.hints === 1 ? '' : 's'} used in this case
        </Type>
        <Button
          onPress={
            hint
              ? () => {
                  showHint(hint);
                  close();
                }
              : revealHint
          }
        >
          {hint
            ? hint.cell === undefined
              ? 'Revisit this person'
              : `Show ${coordinate(hint.cell, puzzle.size)} on the board`
            : 'Reveal a hint'}
        </Button>
      </Sheet>
      <Sheet
        visible={displayedDialog === 'settings'}
        onClose={close}
        eyebrow="MAKE YOURSELF AT HOME"
        title="At your desk."
      >
        <View style={s.settingRow}>
          <View style={{ flex: 1 }}>
            <Type style={s.helpTitle}>Haptic feedback</Type>
            <Type style={s.helpText}>A gentle tap for each deduction on mobile.</Type>
          </View>
          <Switch
            accessibilityLabel="Haptic feedback"
            value={save.haptics}
            onValueChange={(value) => setSave((previous) => ({ ...previous, haptics: value }))}
            trackColor={{ false: colors.line, true: '#8EA483' }}
            thumbColor={colors.paper}
          />
        </View>
        <View style={s.settingRow}>
          <View style={{ flex: 1 }}>
            <Type style={s.helpTitle}>A fresh page</Type>
            <Type style={s.helpText}>Restart the current case, including its timer.</Type>
          </View>
          <Button
            secondary
            onPress={() => setDialog('reset')}
            icon={<RotateCcw size={15} color={colors.ink} />}
          >
            Restart
          </Button>
        </View>
        <Type style={[s.helpText, { marginTop: 20 }]}>
          Murdoku · The Complete Casebook{'\n'}100 cases. Ten chapters. Five difficulty levels.
          Progress is stored on this device.
        </Type>
      </Sheet>
      <Sheet
        visible={displayedDialog === 'reset'}
        onClose={close}
        eyebrow="A FRESH PAGE"
        title="Restart this case?"
      >
        <Type style={s.modalText}>
          Your placements, marks, hints, and time for {puzzle.title} will be cleared. Your other
          cases will stay in your notebook.
        </Type>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button secondary style={{ flex: 1 }} onPress={close}>
            Keep investigating
          </Button>
          <Button style={{ flex: 1 }} onPress={reset}>
            Restart case
          </Button>
        </View>
      </Sheet>
      <Sheet
        visible={displayedDialog === 'accuse'}
        onClose={close}
        eyebrow="THE SCENE IS COMPLETE"
        title="So, who did it?"
      >
        <Type style={s.modalText}>
          Every person is in place. Who was alone in the same room as{' '}
          {puzzle.people.find((person) => person.id === puzzle.victim)?.name}?
        </Type>
        <View style={s.accusationGrid}>
          {puzzle.people
            .filter((person) => person.id !== puzzle.victim)
            .map((person) => (
              <Pressable
                key={person.id}
                testID={`accuse-${person.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Accuse ${person.name}`}
                accessibilityState={{ selected: accused === person.id }}
                onPress={() => {
                  setAccused(person.id);
                  setError('');
                }}
                style={[s.accusationPerson, accused === person.id && s.personSelected]}
              >
                <Portrait person={person} size={60} />
                <Type style={{ fontFamily: fonts.bold, marginTop: 5 }}>{person.name}</Type>
                <Type style={{ fontSize: 10, color: colors.secondary }}>{person.role}</Type>
              </Pressable>
            ))}
        </View>
        {!!error && (
          <Type accessibilityLiveRegion="polite" style={{ color: colors.rust, marginBottom: 16 }}>
            {error}
          </Type>
        )}
        <Button
          disabled={!accused}
          onPress={accuse}
          icon={<Search size={17} color={colors.paper} />}
        >
          Make your accusation
        </Button>
      </Sheet>
      <Sheet
        visible={displayedDialog === 'solved'}
        onClose={close}
        eyebrow={`CASE ${puzzle.number} · BEAUTIFULLY DEDUCED`}
        title="Case closed."
      >
        <View style={s.solutionPortrait}>
          <Portrait
            person={puzzle.people.find((person) => person.id === culprit(puzzle, puzzle.solution))!}
            size={100}
          />
          <View style={s.solvedStamp}>
            <ShieldCheck size={18} color={colors.green} />
            <Type style={{ fontFamily: fonts.bold, color: colors.green, fontSize: 11 }}>
              CULPRIT IDENTIFIED
            </Type>
          </View>
        </View>
        <Type style={s.modalText}>{puzzle.conclusion}</Type>
        <View style={s.results}>
          <View>
            <Eyebrow>TIME TAKEN</Eyebrow>
            <Type style={s.resultValue}>{timeLabel(session.elapsed)}</Type>
          </View>
          <View>
            <Eyebrow>HINTS USED</Eyebrow>
            <Type style={s.resultValue}>{session.hints}</Type>
          </View>
          <View>
            <Eyebrow>CASES CLOSED</Eyebrow>
            <Type style={s.resultValue}>
              {solvedCount}/{CASES.length}
            </Type>
          </View>
        </View>
        {nextCase ? (
          <Button
            testID="next-case"
            onPress={() => openCase(nextCase.id)}
            icon={<ChevronRight size={17} color={colors.paper} />}
          >
            Next case · {nextCase.number}
          </Button>
        ) : (
          <Type style={s.modalText}>
            {solvedCount === CASES.length
              ? 'Every mystery solved. All 100 case files are closed. A remarkable detective record.'
              : `The hundredth case is closed. ${CASES.length - solvedCount} earlier mysteries are still waiting in your casebook.`}
          </Type>
        )}
        <Button
          secondary={!!nextCase}
          style={{ marginTop: nextCase ? 10 : 0 }}
          onPress={() => {
            close();
            library();
          }}
          icon={<FolderOpen size={17} color={nextCase ? colors.green : colors.paper} />}
        >
          Back to the case files
        </Button>
      </Sheet>
      <Sheet
        visible={displayedDialog === 'notebook'}
        onClose={close}
        eyebrow="YOUR DETECTIVE RECORD"
        title="One clue at a time."
      >
        <View style={s.notebookSummary}>
          <Trophy size={34} color={colors.gold} strokeWidth={1.5} />
          <Type style={{ fontFamily: fonts.title, fontSize: 38, lineHeight: 47 }}>
            {solvedCount}/{CASES.length}
          </Type>
          <Type style={{ color: colors.secondary }}>cases closed</Type>
        </View>
        <Eyebrow style={{ marginBottom: 12 }}>YOUR OPEN INVESTIGATIONS</Eyebrow>
        {!openInvestigations.length && (
          <Type style={s.modalText}>
            A fresh page is waiting. Choose your next mystery from the casebook.
          </Type>
        )}
        {openInvestigations.slice(0, 10).map((item) => {
          const progress = save.sessions[item.id];
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => openCase(item.id)}
              style={s.recordRow}
            >
              <View style={{ flex: 1 }}>
                <Eyebrow>CASE {item.number}</Eyebrow>
                <Type style={s.helpTitle}>{item.title}</Type>
                <Type style={s.helpText}>
                  {progress
                    ? `${timeLabel(progress.elapsed)} · ${progress.hints} hints · ${progress.solved ? 'Case closed' : `${Object.keys(progress.placements).length}/${item.people.length} placed`}`
                    : 'A fresh mystery'}
                </Type>
              </View>
              {progress?.solved ? (
                <ShieldCheck size={21} color={colors.green} />
              ) : (
                <ChevronRight size={20} color={colors.muted} />
              )}
            </Pressable>
          );
        })}
        {openInvestigations.length > 10 && (
          <Type style={[s.helpText, { marginVertical: 12 }]}>
            Showing 10 of {openInvestigations.length} open cases. Find every investigation in the
            casebook.
          </Type>
        )}
        <Button
          secondary
          style={{ marginTop: 18 }}
          onPress={() => {
            close();
            library();
          }}
          icon={<FolderOpen size={17} color={colors.green} />}
        >
          Browse all 100 cases
        </Button>
      </Sheet>
    </>
  );
  // Reuse one native modal for transitions such as Settings → Restart and
  // Accusation → Solved. Keep its content while the closing animation runs.
  const activeSheet = React.Children.toArray(sheetOptions.props.children).find(
    (child): child is React.ReactElement<React.ComponentProps<typeof Sheet>> =>
      React.isValidElement<React.ComponentProps<typeof Sheet>>(child) && child.props.visible,
  )!;
  return React.cloneElement(activeSheet, { key: 'case-dialog', visible: dialog !== null });
}
