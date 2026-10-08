import { requireOptionalNativeModule } from 'expo';

export type LampState = {
  isOn: boolean;
  temperature: number;
  brightness: number;
};

type TuyaLampModule = {
  getStatus(): Promise<LampState>;
  setPower(isOn: boolean): Promise<LampState>;
  setBrightness(brightness: number): Promise<LampState>;
  setTemperature(temperature: number): Promise<LampState>;
};

const nativeModule = requireOptionalNativeModule<TuyaLampModule>('TuyaLamp');

export function getLampModule(): TuyaLampModule {
  if (!nativeModule) {
    throw new Error('Rebuild the Android app to enable lamp control.');
  }
  return nativeModule;
}
