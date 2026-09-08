import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CASES } from './cases';
import { newSave, newSession, restoreSave } from './engine';
import { GameSession, SaveData } from './types';

export const SAVE_KEY = '@murdoku/notebook/v1';

export function useGame() {
  const [save, setSave] = useState<SaveData>(() => newSave(CASES[0].id));
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(SAVE_KEY)
      .then((raw) => {
        if (mounted) setSave(restoreSave(raw, CASES));
      })
      .catch(() => {
        if (mounted) setStorageError(true);
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(save);
    // Serialize writes so a slower, older save can never overwrite a newer move.
    writeQueue.current = writeQueue.current
      .catch(() => {})
      .then(() => AsyncStorage.setItem(SAVE_KEY, serialized))
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }, [save, ready]);
  const updateSession = useCallback((update: (session: GameSession) => GameSession) => {
    setSave((previous) => ({
      ...previous,
      sessions: {
        ...previous.sessions,
        [previous.activeCase]: update(previous.sessions[previous.activeCase] ?? newSession()),
      },
    }));
  }, []);
  const puzzle = CASES.find((item) => item.id === save.activeCase) ?? CASES[0];
  return {
    save,
    setSave,
    ready,
    puzzle,
    session: save.sessions[puzzle.id] ?? newSession(),
    updateSession,
    storageError,
  };
}
