import { describe, it, expect, beforeEach } from 'vitest'
import { useCart } from '@/composables/useCart'
import type { ScrewSpec, NutSpec } from '@/types/product'

describe('useCart', () => {
  let cart: ReturnType<typeof useCart>

  beforeEach(() => {
    cart = useCart()
    cart.clearCart()
  })

  it('starts empty', () => {
    expect(cart.items).toHaveLength(0)
    expect(cart.itemCount.value).toBe(0)
    expect(cart.totalCents.value).toBe(0)
  })

  it('adds a screw item', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M3', headType: 'pan', lengthMm: 10 }
    cart.addItem(spec, 5)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.quantity).toBe(5)
    expect(cart.items[0]!.id).toBe('screw-M3-pan-10')
    expect(cart.itemCount.value).toBe(5)
  })

  it('adds a nut item', () => {
    const spec: NutSpec = { type: 'nut', size: 'M4' }
    cart.addItem(spec, 10)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.id).toBe('nut-M4')
    expect(cart.itemCount.value).toBe(10)
  })

  it('merges duplicate items', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M3', headType: 'pan', lengthMm: 10 }
    cart.addItem(spec, 5)
    cart.addItem(spec, 3)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.quantity).toBe(8)
    expect(cart.itemCount.value).toBe(8)
  })

  it('keeps different specs separate', () => {
    const screw: ScrewSpec = { type: 'screw', size: 'M3', headType: 'pan', lengthMm: 10 }
    const nut: NutSpec = { type: 'nut', size: 'M3' }
    cart.addItem(screw, 2)
    cart.addItem(nut, 3)

    expect(cart.items).toHaveLength(2)
    expect(cart.itemCount.value).toBe(5)
  })

  it('calculates total correctly', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M3', headType: 'pan', lengthMm: 10 }
    cart.addItem(spec, 10)
    // M3 screw = 18 cents each, 10 units = 180 cents
    expect(cart.totalCents.value).toBe(180)
    expect(cart.totalFormatted.value).toBe('$1.80')
  })

  it('removes an item', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M3', headType: 'pan', lengthMm: 10 }
    cart.addItem(spec, 5)
    cart.removeItem('screw-M3-pan-10')

    expect(cart.items).toHaveLength(0)
    expect(cart.itemCount.value).toBe(0)
  })

  it('updates quantity', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M3', headType: 'pan', lengthMm: 10 }
    cart.addItem(spec, 5)
    cart.updateQuantity('screw-M3-pan-10', 20)

    expect(cart.items[0]!.quantity).toBe(20)
  })

  it('removes item when quantity set to 0', () => {
    const spec: ScrewSpec = { type: 'screw', size: 'M3', headType: 'pan', lengthMm: 10 }
    cart.addItem(spec, 5)
    cart.updateQuantity('screw-M3-pan-10', 0)

    expect(cart.items).toHaveLength(0)
  })

  it('clears all items', () => {
    const screw: ScrewSpec = { type: 'screw', size: 'M3', headType: 'pan', lengthMm: 10 }
    const nut: NutSpec = { type: 'nut', size: 'M4' }
    cart.addItem(screw, 2)
    cart.addItem(nut, 3)
    cart.clearCart()

    expect(cart.items).toHaveLength(0)
    expect(cart.totalCents.value).toBe(0)
  })
})
