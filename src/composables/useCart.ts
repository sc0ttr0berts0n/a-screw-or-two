import { reactive, computed, watch } from 'vue'
import type { CartItem, ProductSpec } from '@/types/product'
import { getPrice, formatPrice, describeProduct } from '@/types/product'

const STORAGE_KEY = 'asot-cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* ignore */ }
}

const state = reactive<{ items: CartItem[] }>({
  items: loadCart(),
})

watch(() => [...state.items], () => saveCart(state.items), { deep: true })

let nextId = 1

function makeId(spec: ProductSpec): string {
  if (spec.type === 'nut') return `nut-${spec.size}`
  return `screw-${spec.size}-${spec.headType}-${spec.lengthMm}`
}

export function useCart() {
  const totalCents = computed(() =>
    state.items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
  )

  const totalFormatted = computed(() => formatPrice(totalCents.value))

  const itemCount = computed(() => state.items.reduce((sum, item) => sum + item.quantity, 0))

  function addItem(spec: ProductSpec, quantity: number) {
    const id = makeId(spec)
    const existing = state.items.find((item) => item.id === id)
    if (existing) {
      existing.quantity += quantity
    } else {
      state.items.push({
        id,
        spec,
        unitPriceCents: getPrice(spec),
        quantity,
      })
    }
  }

  function removeItem(id: string) {
    const idx = state.items.findIndex((item) => item.id === id)
    if (idx !== -1) state.items.splice(idx, 1)
  }

  function updateQuantity(id: string, quantity: number) {
    const item = state.items.find((i) => i.id === id)
    if (item) {
      if (quantity <= 0) {
        removeItem(id)
      } else {
        item.quantity = quantity
      }
    }
  }

  function clearCart() {
    state.items.splice(0, state.items.length)
  }

  return {
    items: state.items,
    totalCents,
    totalFormatted,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    formatPrice,
    describeProduct,
  }
}
