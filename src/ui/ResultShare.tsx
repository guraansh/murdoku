import React, { useState } from 'react';
import { Platform, Share, View } from 'react-native';
import { RELEASE } from '../release';
import { Button, Eyebrow, Type } from './primitives';
import { timeLabel } from './Investigation';
import { colors } from './theme';

export function resultMessage(number: string, elapsed: number, hints: number) {
  return `${RELEASE.name}\nCase ${number} closed\nTime: ${timeLabel(elapsed)}\nHints: ${hints}\nA little logic. A little mystery.`;
}

export function ResultShare({
  number,
  elapsed,
  hints,
}: {
  number: string;
  elapsed: number;
  hints: number;
}) {
  const [status, setStatus] = useState('');
  const message = resultMessage(number, elapsed, hints);
  async function share() {
    setStatus('');
    try {
      if (Platform.OS !== 'web') {
        await Share.share({ message, title: `${RELEASE.name} · Case ${number}` });
      } else if (navigator.share) {
        await navigator.share({ text: message, title: RELEASE.name });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        setStatus('Result copied. Paste it wherever you’d like to share.');
      } else {
        setStatus('Select and copy the result above to share it.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setStatus('Couldn’t open sharing. You can select and copy the result above.');
    }
  }
  return (
    <View style={{ gap: 14 }}>
      <View
        testID="share-result-card"
        style={{
          padding: 24,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.green,
          backgroundColor: colors.paper,
          gap: 12,
        }}
      >
        <Eyebrow>YOUR DETECTIVE RECORD</Eyebrow>
        <Type selectable style={{ fontSize: 20, lineHeight: 30 }}>
          {message}
        </Type>
      </View>
      <Type>
        Only your case number, time, and hint count are shared. The culprit and scene stay secret.
      </Type>
      <Button onPress={() => void share()}>Share this result</Button>
      {!!status && <Type accessibilityLiveRegion="polite">{status}</Type>}
    </View>
  );
}
