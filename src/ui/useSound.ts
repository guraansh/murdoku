import { useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
export function useSound(enabled: boolean) {
  const tap = useAudioPlayer(require('../../assets/sounds/tap.wav'));
  const error = useAudioPlayer(require('../../assets/sounds/error.wav'));
  const success = useAudioPlayer(require('../../assets/sounds/success.wav'));
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});
  }, []);
  useEffect(() => {
    if (!enabled) {
      tap.pause();
      error.pause();
      success.pause();
    }
  }, [enabled, tap, error, success]);
  return (kind: 'tap' | 'error' | 'success' = 'tap') => {
    if (!enabled) return;
    const player = { tap, error, success }[kind];
    if (!player.isLoaded) return;
    player
      .seekTo(0)
      .then(() => player.play())
      .catch(() => {});
  };
}
