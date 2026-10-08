import '../global.css';

import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createURL } from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { AppStackNavigator } from '@/navigation/AppStackNavigator';

SplashScreen.preventAutoHideAsync();

const linking = {
  enabled: 'auto' as const,
  prefixes: [createURL('/')],
};

export function App() {
  const colorScheme = useColorScheme();

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <AppStackNavigator
      theme={theme}
      linking={linking}
      onReady={() => {
        SplashScreen.hideAsync();
      }}
    />
  );
}
