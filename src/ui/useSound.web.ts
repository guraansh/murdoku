import { useEffect, useRef } from 'react';
import { Asset } from 'expo-asset';

const sources = {
  tap: require('../../assets/sounds/tap.wav'),
  error: require('../../assets/sounds/error.wav'),
  success: require('../../assets/sounds/success.wav'),
};
export function useSound(enabled: boolean) {
  const players = useRef<Partial<Record<keyof typeof sources, HTMLAudioElement>>>({});
  useEffect(() => {
    for (const key of Object.keys(sources) as Array<keyof typeof sources>) {
      const player = new Audio(Asset.fromModule(sources[key]).uri);
      player.preload = 'auto';
      players.current[key] = player;
    }
    return () => {
      Object.values(players.current).forEach((player) => {
        player.pause();
        player.removeAttribute('src');
        player.load();
      });
      players.current = {};
    };
  }, []);
  useEffect(() => {
    if (!enabled) Object.values(players.current).forEach((player) => player.pause());
  }, [enabled]);
  return (kind: keyof typeof sources = 'tap') => {
    const player = players.current[kind];
    if (!enabled || !player) return;
    player.currentTime = 0;
    void player.play().catch(() => {});
  };
}
