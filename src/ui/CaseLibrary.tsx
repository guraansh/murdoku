import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, ArrowRight, BookOpen, Clock3, ShieldCheck } from 'lucide-react-native';
import { CASES } from '../game/cases';
import { CHAPTERS, chapterOf } from '../game/campaign';
import { SaveData } from '../game/types';
import { CaseCover } from './CaseCover';
import { Button, Eyebrow, Type } from './primitives';
import { colors, fonts } from './theme';
import { s } from './styles';

export function CaseLibrary({
  save,
  compact,
  small,
  openCase,
  help,
  scrollTop,
}: {
  save: SaveData;
  compact: boolean;
  small: boolean;
  openCase: (id: string) => void;
  help: () => void;
  scrollTop: () => void;
}) {
  const activeCase = CASES.find((item) => item.id === save.activeCase) ?? CASES[0];
  const [chapterIndex, setChapterIndex] = useState(chapterOf(activeCase) - 1);
  const [available, setAvailable] = useState(0);
  const tabs = useRef<ScrollView>(null);
  const chapter = CHAPTERS[chapterIndex];
  const visibleCases = CASES.slice(chapter.from - 1, chapter.to);
  const solvedCount = CASES.filter((item) => save.sessions[item.id]?.solved).length;
  const chapterSolved = visibleCases.filter((item) => save.sessions[item.id]?.solved).length;
  const suggested = save.sessions[activeCase.id]?.solved
    ? (CASES.find((item) => !save.sessions[item.id]?.solved) ?? activeCase)
    : activeCase;
  const columns = available >= 960 ? 3 : available >= 610 ? 2 : 1;
  function browse(index: number, fromBottom = false) {
    setChapterIndex(index);
    tabs.current?.scrollTo({ x: Math.max(0, index * 84 - 84), animated: true });
    if (fromBottom) scrollTop();
  }
  return (
    <>
      <View style={s.libraryHero}>
        <Eyebrow>THE MURDOKU CASEBOOK · 100 CASE FILES</Eyebrow>
        <Type
          accessibilityRole="header"
          style={[s.largeTitle, small && { fontSize: 37, lineHeight: 45 }]}
        >
          A hundred mysteries.{'\n'}One detective.
        </Type>
        <Type style={s.subtitle}>From your first clue to your finest deduction.</Type>
        <View style={[s.heroStats, { flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }]}>
          <View style={s.inline}>
            <ShieldCheck size={16} color={colors.green} />
            <Type style={{ fontSize: 12, color: colors.secondary }}>
              {solvedCount} of {CASES.length} cases closed
            </Type>
          </View>
          <Button
            secondary
            onPress={() => openCase(suggested.id)}
            icon={<ArrowRight size={15} color={colors.green} />}
          >
            {save.sessions[suggested.id]?.solved
              ? 'Review'
              : save.sessions[suggested.id]
                ? 'Continue'
                : 'Start'}{' '}
            case {suggested.number}
          </Button>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Casebook completion"
          accessibilityValue={{ min: 0, max: 100, now: solvedCount }}
          style={local.progressTrack}
        >
          <View style={[local.progressFill, { width: `${solvedCount}%` }]} />
        </View>
      </View>
      <View style={local.chapterLabel}>
        <Eyebrow>YOUR CHAPTERS</Eyebrow>
        <Type style={local.smallText}>All cases ready to play</Type>
      </View>
      <ScrollView
        ref={tabs}
        horizontal
        onLayout={() =>
          tabs.current?.scrollTo({ x: Math.max(0, chapterIndex * 84 - 84), animated: false })
        }
        contentContainerStyle={local.tabs}
        showsHorizontalScrollIndicator={small}
      >
        {CHAPTERS.map((item, index) => {
          const closed = CASES.slice(item.from - 1, item.to).filter(
            (puzzle) => save.sessions[puzzle.id]?.solved,
          ).length;
          const selected = index === chapterIndex;
          return (
            <Pressable
              key={item.number}
              testID={`chapter-${item.number}`}
              accessibilityRole="tab"
              accessibilityLabel={`Chapter ${item.number}: ${item.name}, ${item.band.name}, cases ${item.from} to ${item.to}, ${closed} closed`}
              accessibilityState={{ selected }}
              aria-selected={selected}
              onPress={() => browse(index)}
              style={[local.chapterTab, selected && local.selectedTab]}
            >
              <View style={s.inline}>
                <Type style={[local.tabNumber, selected && { color: colors.paper }]}>
                  {String(item.number).padStart(2, '0')}
                </Type>
                {closed === 10 && (
                  <ShieldCheck size={13} color={selected ? colors.paper : colors.green} />
                )}
              </View>
              <Type style={[local.tabRange, selected && { color: '#E2E6D5' }]}>
                {item.from}–{item.to}
              </Type>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={local.chapterHeading}>
        <View style={{ flex: 1 }}>
          <Eyebrow>
            CHAPTER {String(chapter.number).padStart(2, '0')} · {chapter.band.name.toUpperCase()}
          </Eyebrow>
          <Type accessibilityRole="header" style={local.chapterTitle}>
            {chapter.name}
          </Type>
          <Type style={local.chapterDescription}>{chapter.band.description}</Type>
        </View>
        {!small && <Type style={local.smallText}>{chapterSolved}/10 closed</Type>}
      </View>
      <View style={s.caseGrid} onLayout={(event) => setAvailable(event.nativeEvent.layout.width)}>
        {visibleCases.map((item, index) => {
          const progress = save.sessions[item.id];
          return (
            <Pressable
              key={item.id}
              testID={`open-case-${item.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Open case ${item.number}: ${item.title}, ${item.difficulty}${progress?.solved ? ', closed' : ''}`}
              onPress={() => openCase(item.id)}
              style={({ pressed }) => [
                s.caseCard,
                { width: available ? (available - (columns - 1) * 18) / columns : '100%' },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={s.caseMeta}>
                <Eyebrow>CASE {item.number}</Eyebrow>
                <View style={s.pill}>
                  <Type style={s.pillText}>
                    {progress?.solved ? 'Case closed' : item.difficulty}
                  </Type>
                </View>
              </View>
              <View
                style={[
                  local.cover,
                  { backgroundColor: ['#EEF0E3', '#F1E9DF', '#E6ECE7'][index % 3] },
                ]}
              >
                <CaseCover puzzle={item} />
              </View>
              <Type style={[s.caseTitle, { fontSize: 23, lineHeight: 29, marginTop: 15 }]}>
                {item.title}
              </Type>
              <Type style={[s.caseDescription, { minHeight: 20, marginBottom: 18 }]}>
                {item.location}
              </Type>
              <View style={[s.caseBottom, { marginTop: 'auto', paddingTop: 15 }]}>
                <View style={s.inline}>
                  <Clock3 size={13} color={colors.muted} />
                  <Type style={{ color: colors.muted, fontSize: 11 }}>
                    {item.minutes} min · {item.size} × {item.size}
                  </Type>
                </View>
                <View style={s.inline}>
                  <Type style={{ fontFamily: fonts.bold, fontSize: 12 }}>
                    {progress?.solved ? 'Review case' : progress ? 'Continue case' : 'Open case'}
                  </Type>
                  <ArrowRight size={16} color={colors.green} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={local.chapterPagination}>
        <Button
          secondary
          disabled={chapterIndex === 0}
          onPress={() => browse(chapterIndex - 1, true)}
          icon={<ArrowLeft size={14} color={colors.green} />}
        >
          Previous
        </Button>
        <Type style={local.smallText}>Chapter {chapter.number} of 10</Type>
        <Button
          secondary
          disabled={chapterIndex === 9}
          onPress={() => browse(chapterIndex + 1, true)}
          icon={<ArrowRight size={14} color={colors.green} />}
        >
          Next
        </Button>
      </View>
      <View style={s.libraryNote}>
        <BookOpen size={23} color={colors.rust} />
        <View style={{ flex: 1, minWidth: 150 }}>
          <Type style={{ fontFamily: fonts.title, fontSize: 20 }}>Your first day on the case?</Type>
          <Type style={{ color: colors.secondary, fontSize: 12 }}>
            Learn the rules. Follow the clues. Trust your deductions.
          </Type>
        </View>
        <Button secondary onPress={help}>
          How to play
        </Button>
      </View>
    </>
  );
}

const local = StyleSheet.create({
  progressTrack: {
    height: 4,
    backgroundColor: colors.line,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 17,
  },
  progressFill: { height: 4, backgroundColor: colors.green },
  chapterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  smallText: { fontSize: 11, color: colors.muted },
  tabs: { flexDirection: 'row', gap: 8, paddingBottom: 8, flexGrow: 1 },
  chapterTab: {
    minWidth: 76,
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 5,
  },
  selectedTab: { backgroundColor: colors.green, borderColor: colors.green },
  tabNumber: { fontFamily: fonts.title, fontSize: 23, lineHeight: 27 },
  tabRange: { fontSize: 10, color: colors.secondary },
  chapterHeading: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 25 },
  chapterTitle: { fontFamily: fonts.title, fontSize: 28, lineHeight: 36, marginTop: 5 },
  chapterDescription: {
    fontSize: 12,
    color: colors.secondary,
    lineHeight: 20,
    marginTop: 5,
    maxWidth: 550,
  },
  cover: { alignItems: 'center', overflow: 'hidden', borderRadius: 8, marginTop: 16 },
  chapterPagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 25,
  },
});
