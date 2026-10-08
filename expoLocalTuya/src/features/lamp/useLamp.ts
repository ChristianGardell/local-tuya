import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getLampModule, type LampState } from '@modules/tuya-lamp';
import { normalizeBrightness, normalizeTemperature } from '@/features/lamp/values';

export function useLamp() {
  const [state, setState] = useState<LampState | null>(null);
  const [temperature, setTemperature] = useState(0);
  const [brightness, setBrightness] = useState(1000);
  const confirmed = useRef<LampState | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const mounted = useRef(false);

  const run = useCallback(async (operation: () => Promise<LampState>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await operation();
      if (mounted.current) {
        confirmed.current = result;
        setState(result);
        setTemperature(result.temperature);
        setBrightness(result.brightness);
      }
    } catch (cause) {
      if (mounted.current) {
        if (confirmed.current) {
          setTemperature(confirmed.current.temperature);
          setBrightness(confirmed.current.brightness);
        }
        setError(cause instanceof Error ? cause.message : 'Could not reach the lamp. Check Wi-Fi.');
      }
    } finally {
      running.current = false;
      if (mounted.current) setBusy(false);
    }
  }, []);

  const refresh = useCallback(() => run(() => getLampModule().getStatus()), [run]);

  useEffect(() => {
    mounted.current = true;
    void Promise.resolve().then(() => {
      if (mounted.current) void refresh();
    });
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') void refresh();
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [refresh]);

  return {
    state,
    temperature,
    brightness,
    previewTemperature: (value: number) => setTemperature(normalizeTemperature(value)),
    previewBrightness: (value: number) => setBrightness(normalizeBrightness(value)),
    busy,
    error,
    refresh,
    setPower: (isOn: boolean) => run(() => getLampModule().setPower(isOn)),
    setBrightness: (value: number) => run(() => getLampModule().setBrightness(value)),
    setTemperature: (value: number) => run(() => getLampModule().setTemperature(value)),
  };
}
