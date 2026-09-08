import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import * as Haptics from 'expo-haptics';
import { BookOpen, CircleHelp, FolderOpen, Grid2X2, Search, Settings2 } from 'lucide-react-native';
import { CASES } from './src/game/cases';
import {
  editSession,
  newSession,
  placementProblem,
  undoSession,
  violations,
} from './src/game/engine';
import { useGame } from './src/game/useGame';
import { CaseLibrary } from './src/ui/CaseLibrary';
import { Dialog, GameDialogs } from './src/ui/GameDialogs';
import { Investigation } from './src/ui/Investigation';
import { Type } from './src/ui/primitives';
import { s } from './src/ui/styles';
import { colors } from './src/ui/theme';

export default function App() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_600SemiBold,
  });
  if (!loaded && !error)
    return (
      <View style={s.loading}>
        <Type style={{ fontFamily: undefined, fontSize: 30 }}>murdoku</Type>
        <Type style={{ fontFamily: undefined, color: colors.muted }}>Opening your case file…</Type>
      </View>
    );
  return (
    <SafeAreaProvider>
      <Murdoku />
    </SafeAreaProvider>
  );
}

function Murdoku() {
  const game = useGame();
  const { puzzle, session, save, setSave, updateSession, ready } = game;
  const { width } = useWindowDimensions();
  const compact = width < 850,
    small = width < 500;
  const [screen, setScreen] = useState<'game' | 'library'>('game');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selected, setSelected] = useState<string | null>('ada');
  const [mode, setMode] = useState<'place' | 'mark'>('place');
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [highlight, setHighlight] = useState<number>();
  const [foreground, setForeground] = useState(true);
  const scroll = useRef<ScrollView>(null);
  const solvedCount = CASES.filter((item) => save.sessions[item.id]?.solved).length;

  useEffect(() => {
    setSelected(puzzle.people[0].id);
    setMode('place');
    setFeedback(null);
    setHighlight(undefined);
    setShowValidation(false);
  }, [puzzle.id]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setForeground(state === 'active'),
    );
    const visibility = () => setForeground(document.visibilityState === 'visible');
    if (Platform.OS === 'web') document.addEventListener('visibilitychange', visibility);
    return () => {
      subscription.remove();
      if (Platform.OS === 'web') document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    if (!ready || screen !== 'game' || dialog || session.solved || !foreground) return;
    const timer = setInterval(
      () => updateSession((current) => ({ ...current, elapsed: current.elapsed + 1 })),
      1000,
    );
    return () => clearInterval(timer);
  }, [ready, screen, dialog, session.solved, foreground, puzzle.id, updateSession]);
  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 7000);
    return () => clearTimeout(timeout);
  }, [feedback]);
  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dialog) {
        setDialog(null);
        return true;
      }
      if (screen === 'game') {
        setScreen('library');
        return true;
      }
      return false;
    });
    return () => back.remove();
  }, [dialog, screen]);

  function buzz(success = false) {
    if (!save.haptics || Platform.OS === 'web') return;
    (success
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.selectionAsync()
    ).catch(() => {});
  }
  function choosePerson(id: string) {
    setSelected(id);
    setMode('place');
    setHighlight(undefined);
    buzz();
  }
  function cellPressed(cell: number) {
    if (session.solved) {
      setDialog('solved');
      return;
    }
    const occupant = puzzle.people.find((person) => session.placements[person.id] === cell);
    if (mode === 'mark') {
      if (occupant || puzzle.furniture.some((item) => item.cell === cell)) {
        setFeedback({ text: 'Only empty floor squares can be marked.' });
        return;
      }
      updateSession((current) =>
        editSession(current, {
          placements: current.placements,
          marks: current.marks.includes(cell)
            ? current.marks.filter((item) => item !== cell)
            : [...current.marks, cell],
        }),
      );
      buzz();
      return;
    }
    if (occupant) {
      if (occupant.id === selected)
        updateSession((current) => {
          const placements = { ...current.placements };
          delete placements[occupant.id];
          return editSession(current, { placements, marks: current.marks });
        });
      else choosePerson(occupant.id);
      setFeedback(null);
      buzz();
      return;
    }
    if (!selected) {
      setFeedback({ text: 'Select a person below the board, then tap an empty square.' });
      return;
    }
    const problem = placementProblem(puzzle, session.placements, selected, cell);
    if (problem) {
      setFeedback({ text: problem, error: true });
      return;
    }
    updateSession((current) =>
      editSession(current, {
        placements: { ...current.placements, [selected]: cell },
        marks: current.marks.filter((item) => item !== cell),
      }),
    );
    setHighlight(undefined);
    setFeedback(null);
    buzz();
  }
  function checkScene() {
    if (session.solved) {
      setDialog('solved');
      return;
    }
    setShowValidation(true);
    const problems = violations(puzzle, session.placements);
    if (problems.length) {
      setFeedback({
        text:
          problems[0] +
          (problems.length > 1 ? ` (${problems.length} contradictions to revisit.)` : ''),
        error: true,
      });
      return;
    }
    const remaining = puzzle.people.length - Object.keys(session.placements).length;
    if (remaining) {
      setFeedback({
        text: `No contradictions in the evidence so far. ${remaining} people still need a place.`,
      });
      return;
    }
    setDialog('accuse');
  }
  function library() {
    setScreen('library');
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  function openCase(id: string) {
    setSave((previous) => ({ ...previous, activeCase: id }));
    setScreen('game');
    setDialog(null);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }
  if (!ready)
    return (
      <View style={s.loading}>
        <Search size={30} color={colors.green} />
        <Type>Opening your notebook…</Type>
      </View>
    );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={s.headerBorder}>
        <View style={[s.header, small && { paddingHorizontal: 18, height: 74, gap: 10 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Murdoku case files"
            onPress={library}
            style={s.brand}
          >
            <View style={s.brandMark}>
              <Grid2X2 size={26} color={colors.green} strokeWidth={1.4} />
              <View style={s.brandDot} />
            </View>
            <Type style={s.logo}>
              murdoku<Type style={{ color: colors.rust, fontSize: 32 }}>.</Type>
            </Type>
          </Pressable>
          {width >= 700 && (
            <View style={s.navigation}>
              <Pressable accessibilityRole="button" onPress={library} style={s.navItem}>
                <FolderOpen size={16} color={colors.green} />
                <Type style={s.navText}>Case files</Type>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDialog('notebook')}
                style={s.navItem}
              >
                <BookOpen size={16} color={colors.secondary} />
                <Type style={[s.navText, { color: colors.secondary }]}>My notebook</Type>
              </Pressable>
            </View>
          )}
          <View style={s.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="How to play"
              onPress={() => setDialog('help')}
              style={s.iconButton}
            >
              <CircleHelp size={19} color={colors.secondary} />
              {!compact && (
                <Type style={{ fontSize: 12, color: colors.secondary }}>How to play</Type>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => setDialog('settings')}
              style={s.iconButton}
            >
              <Settings2 size={19} color={colors.secondary} />
            </Pressable>
          </View>
        </View>
      </View>
      <ScrollView
        ref={scroll}
        contentContainerStyle={[
          s.page,
          compact && { paddingHorizontal: small ? 16 : 32, paddingTop: 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {game.storageError && (
          <View style={s.alert}>
            <Type>
              Progress could not be saved on this device. Keep this game open while you play.
            </Type>
          </View>
        )}
        {screen === 'library' ? (
          <CaseLibrary
            scrollTop={() => scroll.current?.scrollTo({ y: 0, animated: true })}
            save={save}
            compact={compact}
            small={small}
            openCase={openCase}
            help={() => setDialog('help')}
          />
        ) : (
          <Investigation
            puzzle={puzzle}
            session={session}
            compact={compact}
            small={small}
            selected={selected}
            mode={mode}
            tutorialSeen={save.tutorialSeen}
            showValidation={showValidation}
            highlight={highlight}
            feedback={feedback}
            library={library}
            help={() => setDialog('help')}
            briefing={() => setDialog('briefing')}
            pause={() => setDialog('pause')}
            hint={() => setDialog('hint')}
            check={checkScene}
            undo={() => {
              updateSession(undoSession);
              setFeedback(null);
              setHighlight(undefined);
              buzz();
            }}
            toggleMark={() => {
              setMode(mode === 'mark' ? 'place' : 'mark');
              buzz();
            }}
            onCell={cellPressed}
            choosePerson={choosePerson}
            checkClue={(id) =>
              updateSession((current) => ({
                ...current,
                checkedClues: current.checkedClues.includes(id)
                  ? current.checkedClues.filter((item) => item !== id)
                  : [...current.checkedClues, id],
              }))
            }
          />
        )}
        <View style={s.footer}>
          <View style={s.inline}>
            <Grid2X2 size={12} color={colors.muted} />
            <Type style={s.footerText}>A little logic. A little mystery.</Type>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDialog('notebook')}
            style={s.inline}
          >
            <Type style={s.footerText}>{solvedCount} cases closed</Type>
            <BookOpen size={12} color={colors.muted} />
          </Pressable>
        </View>
      </ScrollView>
      <GameDialogs
        game={game}
        dialog={dialog}
        setDialog={setDialog}
        openCase={openCase}
        library={library}
        onSolved={() => {
          setFeedback(null);
          buzz(true);
        }}
        reset={() => {
          updateSession(() => newSession());
          setDialog(null);
          setFeedback(null);
          setShowValidation(false);
          setHighlight(undefined);
          setMode('place');
        }}
        showHint={(hint) => {
          setSelected(hint.person);
          setMode('place');
          setHighlight(hint.cell);
          scroll.current?.scrollTo({ y: 0, animated: true });
        }}
      />
    </SafeAreaView>
  );
}
