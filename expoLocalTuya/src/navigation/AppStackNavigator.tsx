import { createStaticNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  createNativeStackScreen,
} from '@react-navigation/native-stack';
import { HomeScreen } from '@/screens/HomeScreen';

const AppStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Home: createNativeStackScreen({
      screen: HomeScreen,
    }),
  },
});

export const AppStackNavigator = createStaticNavigation(AppStack);

type AppStackType = typeof AppStack;

declare module '@react-navigation/native' {
  // Declaration merging registers the inferred navigator with React Navigation.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RootNavigator extends AppStackType {}
}
