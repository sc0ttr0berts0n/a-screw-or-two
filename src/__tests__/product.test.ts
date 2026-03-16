import { describe, it, expect } from 'vitest'
import { getPrice, formatPrice, describeProduct } from '@/types/product'
import type { ScrewSpec, NutSpec } from '@/types/product'

describe('formatPrice', () => {
  it('formats cents to dollars', () => {
    expect(formatPrice(15)).toBe('$0.15')
    expect(formatPrice(100)).toBe('$1.00')
    expect(formatPrice(3999)).toBe('$39.99')
    expect(formatPrice(0)).toBe('$0.00')
  })
})

describe('getPrice', () => {
  it('returns correct screw prices by size', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M2', headType: 'pan', lengthMm: 6 }
    expect(getPrice(spec)).toBe(15)
  })

  it('returns correct nut prices by size', () => {
    const spec: NutSpec = { type: 'nut', size: 'M3' }
    expect(getPrice(spec)).toBe(12)
  })

  it('returns higher prices for larger sizes', () => {
    const m2: ScrewSpec = { type: 'screw', size: 'M2', headType: 'pan', lengthMm: 6 }
    const m5: ScrewSpec = { type: 'screw', size: 'M5', headType: 'pan', lengthMm: 10 }
    expect(getPrice(m5)).toBeGreaterThan(getPrice(m2))
  })
})

describe('describeProduct', () => {
  it('describes a screw with all details', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M3', headType: 'socketCap', lengthMm: 10 }
    expect(describeProduct(spec)).toBe('M3x10mm SocketCap Head Screw')
  })

  it('describes a nut', () => {
    const spec: NutSpec = { type: 'nut', size: 'M4' }
    expect(describeProduct(spec)).toBe('M4 Hex Nut')
  })

  it('capitalizes head type', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M2', headType: 'flat', lengthMm: 6 }
    expect(describeProduct(spec)).toBe('M2x6mm Flat Head Screw')
  })
})
