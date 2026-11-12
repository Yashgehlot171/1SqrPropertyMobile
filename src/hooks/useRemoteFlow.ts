import {useCallback, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {showApiError} from '@/api';

export function useRemoteLoad(load: () => Promise<unknown>) {
  useFocusEffect(useCallback(() => { void load().catch(showApiError); }, [load]));
}
/** One mutation at a time. Failure preserves the current screen and form values. */
export function useRemoteAction() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>) => {
    if (lock.current) { return; }
    lock.current = true;
    setBusy(true);
    try { await action(); } catch (error) { showApiError(error); }
    finally { lock.current = false; setBusy(false); }
  };
  return {run, busy};
}
