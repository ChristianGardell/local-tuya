This is an Android-only Expo/React Native app. Prioritize mobile performance.

## Stack

- Use React Navigation. Keep navigators in `src/navigation/` and screens in `src/screens/`.
- Use Uniwind with Tailwind CSS for styling. The CSS entry is `global.css`.
- Use `@/*` imports for `src/*`.

## Expo

Do not rely on remembered Expo APIs. Before changing Expo, EAS, or React Native code:

1. Check the Expo major version in `package.json` and read `https://docs.expo.dev/versions/v<major>.0.0/`.
2. For other topics, consult `https://docs.expo.dev/llms.txt` and follow the relevant docs.

Install packages with `npx expo install <package>` for SDK-compatible versions. Configure native behavior through app config and config plugins; do not hand-edit generated native projects. Native module changes require a new Android development build.

## Commands

Use `bunx` instead of `npx` when `bun.lock` is present.

```bash
npm start                   # Android development client
npx expo lint               # lint
npx tsc --noEmit             # typecheck
npx expo-doctor              # dependency/config checks
npx expo install --fix       # align SDK dependencies
```

Run lint and typecheck before declaring work done. Use EAS for cloud builds: `npx eas-cli@latest build --platform android`.
