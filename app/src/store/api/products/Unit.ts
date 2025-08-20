export enum Unit {
  NoUnit,
  Kilogram,
  Gram,
  Centiliter,
  Centime
}

export const UNIT_MAPPING: Record<string, Unit> = {
  'kilogramm': Unit.Kilogram,
  'kg': Unit.Kilogram,
  'gramm': Unit.Gram,
  'g': Unit.Gram,
  'cl': Unit.Centiliter,
  'centiliter': Unit.Centiliter,
  'rappen': Unit.Centime
};
