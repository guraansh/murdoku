import React, { useState } from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { CASES } from '../game/cases';
import { CHAPTERS, chapterOf } from '../game/campaign';
import { SaveData } from '../game/types';
import { Type, Button, Eyebrow } from './primitives';
import { ManorArt } from './Illustrations';
import { colors, fonts } from './theme';
import { Motion } from './Motion';
export function CaseMenu({ save, openCase }: { save: SaveData; openCase: (id: string) => void }) {
  const active = CASES.find((x) => x.id === save.activeCase) ?? CASES[0];
  const [chapter, setChapter] = useState(chapterOf(active) - 1);
  const [selected, setSelected] = useState(active);
  const { height } = useWindowDimensions();
  const short = height < 550;
  const browse = (index: number) => {
    setChapter(index);
    setSelected(CASES[index * 10]);
  };
  return (
    <View style={[s.page, short && { padding: 8, gap: 5, maxWidth: 900 }]} testID="case-menu">
      {!short && (
        <View style={s.row}>
          <Eyebrow>YOUR CASEBOOK</Eyebrow>
          <Type style={s.small}>
            {CASES.filter((x) => save.sessions[x.id]?.solved).length} / 100 closed
          </Type>
        </View>
      )}
      <View style={s.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous chapter"
          disabled={chapter === 0}
          onPress={() => browse(chapter - 1)}
          style={s.arrow}
        >
          <ArrowLeft color={chapter === 0 ? colors.line : colors.green} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Eyebrow>CHAPTER {chapter + 1} OF 10</Eyebrow>
          <Type style={s.title}>{CHAPTERS[chapter].name}</Type>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next chapter"
          disabled={chapter === 9}
          onPress={() => browse(chapter + 1)}
          style={s.arrow}
        >
          <ArrowRight color={chapter === 9 ? colors.line : colors.green} />
        </Pressable>
      </View>
      {!short && (
        <View style={s.chapters}>
          {CHAPTERS.map((_, i) => (
            <Pressable
              key={i}
              testID={`chapter-${i + 1}`}
              accessibilityRole="button"
              accessibilityLabel={`Chapter ${i + 1}`}
              onPress={() => browse(i)}
              style={[s.chapter, chapter === i && { backgroundColor: colors.green }]}
            >
              <Type style={{ fontSize: 11, color: chapter === i ? colors.paper : colors.ink }}>
                {i + 1}
              </Type>
            </Pressable>
          ))}
        </View>
      )}
      <Motion
        identity={selected.id}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        {height > 680 && (
          <ManorArt width={Math.min(250, height * 0.23)} variant={chapter === 4 ? 2 : 0} />
        )}
        {!short && (
          <Eyebrow>
            CASE {selected.number} · {selected.difficulty}
          </Eyebrow>
        )}
        <Type
          accessibilityRole="header"
          style={[
            s.title,
            { fontSize: 26, lineHeight: 32, textAlign: 'center', marginVertical: 8 },
            short && { fontSize: 18, lineHeight: 22, marginVertical: 0 },
          ]}
        >
          {selected.title}
        </Type>
        {!short && (
          <Type style={s.small}>
            {selected.location} · {selected.minutes} min
          </Type>
        )}
      </Motion>
      <View style={s.grid}>
        {CASES.slice(chapter * 10, chapter * 10 + 10).map((x) => (
          <Pressable
            key={x.id}
            testID={`preview-case-${x.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Preview case ${x.number}`}
            onPress={() => setSelected(x)}
            style={[
              s.case,
              short && { width: '8%', height: 44 },
              selected.id === x.id && { backgroundColor: colors.green, borderColor: colors.green },
            ]}
          >
            <Type
              style={{
                fontFamily: fonts.bold,
                color: selected.id === x.id ? colors.paper : colors.ink,
              }}
            >
              {x.number}
            </Type>
            {save.sessions[x.id]?.solved && (
              <Check size={12} color={selected.id === x.id ? colors.paper : colors.green} />
            )}
          </Pressable>
        ))}
      </View>
      <Button testID={`open-case-${selected.id}`} onPress={() => openCase(selected.id)}>
        {save.sessions[selected.id]?.solved
          ? 'Revisit case'
          : save.sessions[selected.id]
            ? 'Continue investigation'
            : 'Open case file'}
      </Button>
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, padding: 20, gap: 12, maxWidth: 650, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.title, fontSize: 20, lineHeight: 25 },
  small: { fontSize: 11, color: colors.secondary, textAlign: 'center' },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  chapters: { flexDirection: 'row', gap: 3 },
  chapter: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  case: {
    width: '17%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
