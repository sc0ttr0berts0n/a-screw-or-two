export type ScrewSize = 'M1' | 'M1.6' | 'M2' | 'M2.5' | 'M3' | 'M4' | 'M5' | 'M6' | 'M8' | 'M10'

export type HeadType = 'pan' | 'hex' | 'flat' | 'socketCap'

export type ProductType = 'screw' | 'nut'

export interface ScrewSpec {
  type: 'screw'
  size: ScrewSize
  headType: HeadType
  lengthMm: number
}

export interface NutSpec {
  type: 'nut'
  size: ScrewSize
}

export type ProductSpec = ScrewSpec | NutSpec

export interface CartItem {
  id: string
  spec: ProductSpec
  unitPriceCents: number
  quantity: number
}

export const SCREW_SIZES: ScrewSize[] = ['M1', 'M1.6', 'M2', 'M2.5', 'M3', 'M4', 'M5', 'M6', 'M8', 'M10']

export const HEAD_TYPES: { value: HeadType; label: string }[] = [
  { value: 'pan', label: 'Pan' },
  { value: 'hex', label: 'Hex' },
  { value: 'flat', label: 'Flat' },
  { value: 'socketCap', label: 'Socket Cap' },
]

export const LENGTHS_BY_SIZE: Record<ScrewSize, number[]> = {
  M1: [2, 3, 4, 5, 6],
  'M1.6': [3, 4, 5, 6, 8],
  M2: [4, 5, 6, 8, 10],
  'M2.5': [4, 5, 6, 8, 10, 12],
  M3: [5, 6, 8, 10, 12, 16, 20],
  M4: [6, 8, 10, 12, 16, 20, 25],
  M5: [8, 10, 12, 16, 20, 25, 30],
  M6: [10, 12, 16, 20, 25, 30, 40],
  M8: [12, 16, 20, 25, 30, 40, 50],
  M10: [16, 20, 25, 30, 40, 50, 60],
}

export const SCREW_PRICES_CENTS: Record<ScrewSize, number> = {
  M1: 15,
  'M1.6': 15,
  M2: 15,
  'M2.5': 18,
  M3: 18,
  M4: 20,
  M5: 25,
  M6: 30,
  M8: 38,
  M10: 45,
}

export const NUT_PRICES_CENTS: Record<ScrewSize, number> = {
  M1: 10,
  'M1.6': 10,
  M2: 10,
  'M2.5': 12,
  M3: 12,
  M4: 14,
  M5: 16,
  M6: 20,
  M8: 25,
  M10: 30,
}

export function getPrice(spec: ProductSpec): number {
  if (spec.type === 'nut') return NUT_PRICES_CENTS[spec.size]
  return SCREW_PRICES_CENTS[spec.size]
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function describeProduct(spec: ProductSpec): string {
  if (spec.type === 'nut') return `${spec.size} Hex Nut`
  return `${spec.size}x${spec.lengthMm}mm ${spec.headType.charAt(0).toUpperCase() + spec.headType.slice(1)} Head Screw`
}
