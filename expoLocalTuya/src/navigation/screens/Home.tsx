import { Button, Text } from '@react-navigation/elements';
import { View } from 'react-native';

export function Home() {
  return (
    <View className="flex-1 items-center justify-center gap-2.5">
      <Text>Home Screen</Text>
      <Text>{"Open up 'src/App.tsx' to start working on your app!"}</Text>
      <Button screen="Profile" params={{ user: 'jane' }}>
        Go to Profile
      </Button>
      <Button screen="Settings">Go to Settings</Button>
    </View>
  );
}

