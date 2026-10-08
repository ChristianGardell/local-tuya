export const LAMP_LIMITS = {
  temperature: { min: 0, max: 1000 },
  brightness: { min: 10, max: 1000 },
} as const;

function clampInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeTemperature(value: number) {
  return clampInteger(value, LAMP_LIMITS.temperature.min, LAMP_LIMITS.temperature.max);
}

export function normalizeBrightness(value: number) {
  return clampInteger(value, LAMP_LIMITS.brightness.min, LAMP_LIMITS.brightness.max);
}
