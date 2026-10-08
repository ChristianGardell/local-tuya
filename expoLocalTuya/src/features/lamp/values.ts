export const LAMP_LIMITS = {
  hue: { min: 0, max: 360 },
  brightness: { min: 10, max: 1000 },
} as const;

function clampInteger(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeHue(value: number) {
  return clampInteger(value, LAMP_LIMITS.hue.min, LAMP_LIMITS.hue.max);
}

export function normalizeBrightness(value: number) {
  return clampInteger(value, LAMP_LIMITS.brightness.min, LAMP_LIMITS.brightness.max);
}
