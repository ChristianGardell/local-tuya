import Slider from '@react-native-community/slider';
import { useTheme } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { LAMP_LIMITS, normalizeBrightness, normalizeHue } from '@/features/lamp/values';

const ScreenSafeArea = withUniwind(SafeAreaView);
const LampSlider = withUniwind(Slider);

export function HomeScreen() {
  const { colors } = useTheme();
  const [isOn, setIsOn] = useState(false);
  const [hue, setHue] = useState(0);
  const [brightness, setBrightness] = useState(1000);
  const hueColor = `hsl(${hue}, 100%, 50%)`;
  const lampColor = `hsl(${hue}, 100%, ${brightness / 20}%)`;

  return (
    <ScreenSafeArea className="flex-1 bg-stone-50 dark:bg-stone-950">
      <ScrollView contentContainerClassName="grow justify-center gap-8 px-6 py-8">
        <View className="gap-2">
          <Text
            accessibilityRole="header"
            className="text-3xl font-semibold text-stone-900 dark:text-stone-50"
          >
            Lamp
          </Text>
          <Text className="text-base text-stone-500 dark:text-stone-400">
            Set the mood with color and light.
          </Text>
        </View>

        <View className="items-center gap-4 py-4">
          <View
            accessible={false}
            className="h-32 w-32 rounded-full border-8 border-white dark:border-stone-800"
            style={{ backgroundColor: isOn ? lampColor : colors.border }}
          />
          <Text className="text-base font-medium text-stone-700 dark:text-stone-300">
            {isOn ? 'On' : 'Off'}
          </Text>
        </View>

        <View className="gap-8 rounded-3xl bg-white p-5 dark:bg-stone-900">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-stone-900 dark:text-stone-50">Hue</Text>
              <Text className="text-base text-stone-500 tabular-nums dark:text-stone-400">
                {hue}°
              </Text>
            </View>
            <LampSlider
              accessibilityLabel="Hue"
              accessibilityValue={{ min: 0, max: 360, now: hue, text: `${hue} degrees` }}
              className="h-12 w-full"
              minimumValue={LAMP_LIMITS.hue.min}
              maximumValue={LAMP_LIMITS.hue.max}
              step={1}
              value={hue}
              onValueChange={value => setHue(normalizeHue(value))}
              minimumTrackTintColor={hueColor}
              maximumTrackTintColor={colors.border}
              thumbTintColor={hueColor}
            />
            <View className="flex-row justify-between">
              <Text className="text-sm text-stone-500 dark:text-stone-400">0°</Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">360°</Text>
            </View>
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
              accessibilityLabel="Brightness"
              accessibilityValue={{
                min: 10,
                max: 1000,
                now: brightness,
                text: `${brightness / 10} percent`,
              }}
              className="h-12 w-full"
              minimumValue={LAMP_LIMITS.brightness.min}
              maximumValue={LAMP_LIMITS.brightness.max}
              step={1}
              value={brightness}
              onValueChange={value => setBrightness(normalizeBrightness(value))}
              minimumTrackTintColor={colors.text}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.text}
            />
            <View className="flex-row justify-between">
              <Text className="text-sm text-stone-500 dark:text-stone-400">1%</Text>
              <Text className="text-sm text-stone-500 dark:text-stone-400">100%</Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isOn ? 'Turn lamp off' : 'Turn lamp on'}
          accessibilityState={{ selected: isOn }}
          className="min-h-14 items-center justify-center rounded-2xl bg-stone-900 px-6 py-4 active:opacity-70 dark:bg-stone-100"
          onPress={() => setIsOn(previous => !previous)}
        >
          <Text className="text-lg font-semibold text-white dark:text-stone-900">
            {isOn ? 'Turn off' : 'Turn on'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenSafeArea>
  );
}
