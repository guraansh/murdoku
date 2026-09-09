import React, { useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { Puzzle } from '../game/types';
import { PRIVACY, RELEASE } from '../release';
import { Button, Type } from './primitives';
import { s } from './styles';

export function AboutContent({ puzzle, privacy }: { puzzle: Puzzle; privacy: () => void }) {
  const [message, setMessage] = useState('');
  async function contact(report: boolean) {
    const subject = report
      ? `${RELEASE.name}: case ${puzzle.number} — ${puzzle.title}`
      : `${RELEASE.name} support`;
    const body = `App: ${RELEASE.name} ${RELEASE.version}\nPlatform: ${Platform.OS}\n${report ? `Case: ${puzzle.number} — ${puzzle.title}\n` : ''}\nPlease describe your question or what happened:\n`;
    setMessage('');
    try {
      await Linking.openURL(
        `mailto:${RELEASE.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      );
    } catch {
      setMessage(
        `Couldn’t open an email app. Email ${RELEASE.supportEmail} and include case ${puzzle.number} and app version ${RELEASE.version}.`,
      );
    }
  }
  return (
    <View style={{ gap: 16 }}>
      <Type style={s.helpTitle}>
        {RELEASE.name} · Version {RELEASE.version}
      </Type>
      <Type>Created and published by {RELEASE.publisher}.</Type>
      <Type selectable>{RELEASE.supportEmail}</Type>
      <Button secondary onPress={() => void contact(false)}>
        Contact support
      </Button>
      <Button secondary onPress={() => void contact(true)}>
        Report a puzzle problem
      </Button>
      <Type>Opens an email draft for case {puzzle.number}. Review it before sending.</Type>
      {!!message && (
        <Type accessibilityLiveRegion="polite" selectable>
          {message}
        </Type>
      )}
      <Button secondary onPress={privacy}>
        Privacy policy
      </Button>
      <Type accessibilityRole="header" style={s.helpTitle}>
        Credits
      </Type>
      <Type>
        100 original cases, character portraits, scene illustrations, and bundled sound effects
        created for this app. Built with Expo and React Native. Icons: Lucide (ISC license). Fonts:
        DM Sans and Fraunces (SIL Open Font License).
      </Type>
    </View>
  );
}

export function PrivacyContent() {
  const [error, setError] = useState('');
  return (
    <View style={{ gap: 16 }}>
      {PRIVACY.map(([title, body]) => (
        <View key={title} style={{ gap: 6 }}>
          <Type accessibilityRole="header" style={s.helpTitle}>
            {title}
          </Type>
          <Type selectable>{body}</Type>
        </View>
      ))}
      {!!RELEASE.privacyUrl && (
        <Button
          secondary
          onPress={() => {
            void Linking.openURL(RELEASE.privacyUrl).catch(() =>
              setError('Couldn’t open the policy website. The policy is also available above.'),
            );
          }}
        >
          Open policy website
        </Button>
      )}
      {!!error && <Type accessibilityLiveRegion="polite">{error}</Type>}
    </View>
  );
}
