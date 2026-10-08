import Slider from '@react-native-community/slider';
import { useTheme } from '@react-navigation/native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { LAMP_LIMITS, normalizeBrightness, normalizeTemperature } from '@/features/lamp/values';
import { useLamp } from '@/features/lamp/useLamp';

const ScreenSafeArea = withUniwind(SafeAreaView);
const LampSlider = withUniwind(Slider);

export function HomeScreen() {
  const { colors } = useTheme();
  const lamp = useLamp();
  const { temperature, brightness } = lamp;
  const isOn = lamp.state?.isOn ?? false;
  const disabled = lamp.busy || !lamp.state;
  const whiteColor = `rgb(255, ${Math.round(190 + temperature * 0.065)}, ${Math.round(120 + temperature * 0.135)})`;

  return (
    <ScreenSafeArea className="flex-1 bg-stone-50 dark:bg-stone-950">
      <ScrollView contentContainerClassName="grow justify-center gap-8 px-6 py-8">
        <View className="gap-2">
          <Text className="text-base text-stone-500 dark:text-stone-400">
            Adjust warm/cool white and brightness.
          </Text>
        </View>

        <View className="items-center gap-4 py-4">
          <View
            className="h-32 w-32 rounded-full border-8 border-white dark:border-stone-800"
            style={{ backgroundColor: isOn ? whiteColor : colors.border }}
          />
          <Text className="text-base font-medium text-stone-700 dark:text-stone-300">
            {!lamp.state ? (lamp.busy ? 'Connecting…' : 'Unavailable') : isOn ? 'On' : 'Off'}
          </Text>
        </View>

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
              disabled={disabled}
              onValueChange={value => lamp.previewTemperature(value)}
              onSlidingComplete={value => void lamp.setTemperature(normalizeTemperature(value))}
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
              disabled={disabled}
              onValueChange={value => lamp.previewBrightness(value)}
              onSlidingComplete={value => void lamp.setBrightness(normalizeBrightness(value))}
              minimumTrackTintColor={colors.text}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.text}
            />
          </View>
        </View>

        {lamp.error && (
          <View className="gap-3">
            <Text className="text-base text-red-700 dark:text-red-400">{lamp.error}</Text>
            <Pressable disabled={lamp.busy} onPress={() => void lamp.refresh()}>
              <Text className="text-base font-semibold text-stone-900 dark:text-stone-50">
                Refresh lamp
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable
          disabled={disabled}
          className="min-h-14 items-center justify-center rounded-2xl bg-stone-900 px-6 py-4 active:opacity-70 dark:bg-stone-100"
          onPress={() => void lamp.setPower(!isOn)}
        >
          <Text className="text-lg font-semibold text-white dark:text-stone-900">
            {lamp.busy ? 'Connecting…' : isOn ? 'Turn off' : 'Turn on'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenSafeArea>
  );
}
