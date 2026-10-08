import Slider from '@react-native-community/slider';
import { useTheme } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, Text, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { LAMP_LIMITS, normalizeBrightness, normalizeTemperature } from '@/features/lamp/values';

interface LampState {
  isOn: boolean;
  temperature: number;
  brightness: number;
}

interface TuyaLampModule {
  getStatus(): Promise<LampState>;
  setPower(isOn: boolean): Promise<LampState>;
  setBrightness(value: number): Promise<LampState>;
  setTemperature(value: number): Promise<LampState>;
}

const lampModule = requireOptionalNativeModule<TuyaLampModule>('TuyaLamp');

const ScreenSafeArea = withUniwind(SafeAreaView);
const LampSlider = withUniwind(Slider);

export function HomeScreen() {
  const { colors } = useTheme();
  const [lampState, setLampState] = useState<LampState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const mounted = useRef(false);

  const request = useCallback(async (operation: (lamp: TuyaLampModule) => Promise<LampState>) => {
    if (running.current) return;
    running.current = true;
    setError(null);
    try {
      if (!lampModule) throw new Error('Rebuild the Android app to enable lamp control.');
      const result = await operation(lampModule);
      if (mounted.current) setLampState(result);
    } catch (cause) {
      if (mounted.current) {
        setError(cause instanceof Error ? cause.message : 'Could not reach the lamp. Check Wi-Fi.');
      }
    } finally {
      running.current = false;
    }
  }, []);

  // initial mount and app state change listener to refresh lamp status
  useEffect(() => {
    mounted.current = true;
    void Promise.resolve().then(() => {
      if (mounted.current) void request(lamp => lamp.getStatus());
    });
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') void request(lamp => lamp.getStatus());
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [request]);

  const temperature = lampState?.temperature ?? 0;
  const brightness = lampState?.brightness ?? 1000;
  const isOn = lampState?.isOn ?? false;
  const whiteColor = `rgb(255, ${Math.round(190 + temperature * 0.065)}, ${Math.round(120 + temperature * 0.135)})`;

  return (
    <ScreenSafeArea className="flex-1 bg-stone-50 dark:bg-stone-950">
      <ScrollView contentContainerClassName="grow justify-center gap-8 px-6 py-8">
        <View className="gap-2">
          <Text className="text-base text-stone-500 dark:text-stone-400">
            Adjust warm/cool white and brightness.
          </Text>
        </View>

        {/* LAMP PREVIEW */}
        <View className="items-center gap-4 py-4">
          <View
            className="h-32 w-32 rounded-full border-8 border-white dark:border-stone-800"
            style={{ backgroundColor: isOn ? whiteColor : colors.border }}
          />
          <Text className="text-base font-medium text-stone-700 dark:text-stone-300">
            {!lampState ? 'Unavailable' : isOn ? 'On' : 'Off'}
          </Text>
        </View>

        {/* SLIDER CARD */}
        <View className="gap-8 rounded-3xl bg-white p-5 dark:bg-stone-900">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-stone-900 dark:text-stone-50">
                Warm / cool
              </Text>
              <Text className="text-base text-stone-500 tabular-nums dark:text-stone-400">
                {temperature / 10}% cool
              </Text>
            </View>
            <LampSlider
              className="h-16 w-full"
              style={{ transform: [{ scaleY: 1.6 }] }}
              minimumValue={LAMP_LIMITS.temperature.min}
              maximumValue={LAMP_LIMITS.temperature.max}
              step={1}
              value={temperature}
              onSlidingComplete={value =>
                void request(lamp => lamp.setTemperature(normalizeTemperature(value)))
              }
              minimumTrackTintColor={whiteColor}
              maximumTrackTintColor={colors.border}
              thumbTintColor={whiteColor}
            />
          </View>

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-stone-900 dark:text-stone-50">
                Brightness
              </Text>
              <Text className="text-base text-stone-500 tabular-nums dark:text-stone-400">
                {brightness / 10}%
              </Text>
            </View>
            <LampSlider
              className="h-16 w-full"
              style={{ transform: [{ scaleY: 1.6 }] }}
              minimumValue={LAMP_LIMITS.brightness.min}
              maximumValue={LAMP_LIMITS.brightness.max}
              step={1}
              value={brightness}
              onSlidingComplete={value =>
                void request(lamp => lamp.setBrightness(normalizeBrightness(value)))
              }
              minimumTrackTintColor={colors.text}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.text}
            />
          </View>
        </View>

        {/* ERROR AND RETRY */}
        {error && (
          <View className="gap-3">
            <Text className="text-base text-red-700 dark:text-red-400">{error}</Text>
            <Pressable onPress={() => void request(lamp => lamp.getStatus())}>
              <Text className="text-base font-semibold text-stone-900 dark:text-stone-50">
                Refresh lamp
              </Text>
            </Pressable>
          </View>
        )}

        {/* POWER BUTTON */}
        <Pressable
          className="min-h-14 items-center justify-center rounded-2xl bg-stone-900 px-6 py-4 active:opacity-70 dark:bg-stone-100"
          onPress={() => void request(lamp => lamp.setPower(!isOn))}
        >
          <Text className="text-lg font-semibold text-white dark:text-stone-900">
            {isOn ? 'Turn off' : 'Turn on'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenSafeArea>
  );
}
