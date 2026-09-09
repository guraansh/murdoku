import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, Type } from './primitives';
import { colors } from './theme';
import { s } from './styles';

const lessons = [
  [
    'Place your first suspect',
    'Nia says: “I stood in the top-left corner.” Select Nia, then tap A1.',
  ],
  [
    'Rule out a square',
    'No two people share a row or column. Nia occupies row 1, so B1 must stay empty. Choose Mark, then tap B1.',
  ],
  [
    'Follow another statement',
    'Theo says: “I stood in the bottom-right corner.” Select Theo, then tap C3.',
  ],
  [
    'Find the remaining position',
    'The victim must use the remaining row and column: row 2 and column B. Select the victim, then tap B2.',
  ],
  [
    'Identify the culprit',
    'The murderer is the only suspect in the victim’s room. Who shares the Study with the victim?',
  ],
  [
    'You’re ready to investigate',
    'Nia and the victim share the Study. Theo is in the Hall. You used testimony, elimination, and the room rule to solve your first scene.',
  ],
];
export function PracticeContent({ finish }: { finish: () => void }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [placements, setPlacements] = useState<Record<number, string>>({});
  const [marked, setMarked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const target = step === 0 ? 0 : step === 1 ? 1 : step === 2 ? 8 : 4;
  const person = step === 0 ? 'Nia' : step === 2 ? 'Theo' : 'Victim';
  function tap(cell: number) {
    if (step >= 4) return;
    if (cell !== target || (step === 1 ? !marking : marking || selected !== person)) {
      setFeedback(
        step === 1
          ? 'Choose Mark and tap B1, in Nia’s row.'
          : `Select ${person}, then tap ${String.fromCharCode(65 + (target % 3))}${Math.floor(target / 3) + 1}.`,
      );
      return;
    }
    if (step === 1) setMarked(true);
    else setPlacements((previous) => ({ ...previous, [cell]: person }));
    setSelected(null);
    setMarking(false);
    setFeedback('');
    setStep(step + 1);
  }
  return (
    <View style={{ gap: 16 }}>
      <Type>Practice only · Your casebook stays as it is.</Type>
      <View accessibilityLiveRegion="polite" style={{ gap: 6 }}>
        <Type accessibilityRole="header" style={s.helpTitle}>
          {lessons[step][0]}
        </Type>
        <Type>{lessons[step][1]}</Type>
      </View>
      <Type>Study: rows 1–2. Hall: row 3.</Type>
      <View style={{ width: '100%', maxWidth: 330, alignSelf: 'center', gap: 4 }}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={{ flexDirection: 'row', gap: 4 }}>
            {[0, 1, 2].map((column) => {
              const cell = row * 3 + column;
              const label = `${String.fromCharCode(65 + column)}${row + 1}`;
              return (
                <Pressable
                  key={cell}
                  testID={`practice-cell-${cell}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}, ${row < 2 ? 'Study' : 'Hall'}, ${placements[cell] ?? (cell === 1 && marked ? 'marked empty' : 'empty')}`}
                  accessibilityState={{ disabled: step >= 4 }}
                  disabled={step >= 4}
                  onPress={() => tap(cell)}
                  style={{
                    flex: 1,
                    minHeight: 78,
                    padding: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.secondary,
                    borderRadius: 8,
                    backgroundColor: row < 2 ? '#E7EDDF' : '#EFE2D0',
                  }}
                >
                  <Type style={{ fontSize: 12 }}>
                    {label} · {row < 2 ? 'Study' : 'Hall'}
                  </Type>
                  <Type style={{ fontWeight: 'bold' }}>
                    {placements[cell] ?? (cell === 1 && marked ? '×' : '·')}
                  </Type>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      {step < 4 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {['Nia', 'Theo', 'Victim'].map((name) => (
            <Button
              key={name}
              secondary={selected !== name || marking}
              accessibilityLabel={`Practice select ${name}`}
              onPress={() => {
                setSelected(name);
                setMarking(false);
              }}
            >
              {name}
            </Button>
          ))}
          <Button
            secondary={!marking}
            accessibilityLabel="Practice mark"
            onPress={() => {
              setMarking(true);
              setSelected(null);
            }}
          >
            Mark
          </Button>
        </View>
      )}
      {step === 4 && (
        <View style={{ gap: 8 }}>
          {['Nia', 'Theo'].map((name) => (
            <Button
              key={name}
              secondary
              onPress={() => {
                if (name === 'Nia') {
                  setFeedback('');
                  setStep(5);
                } else
                  setFeedback(
                    'Theo is in the Hall. Look for the suspect in the Study with the victim.',
                  );
              }}
            >
              Accuse {name}
            </Button>
          ))}
        </View>
      )}
      {!!feedback && <Type accessibilityLiveRegion="polite">{feedback}</Type>}
      {step === 5 && <Button onPress={finish}>Start investigating</Button>}
    </View>
  );
}
