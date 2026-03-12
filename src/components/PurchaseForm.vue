<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  SCREW_SIZES,
  HEAD_TYPES,
  LENGTHS_BY_SIZE,
  type ScrewSize,
  type HeadType,
  type ProductSpec,
  getPrice,
  formatPrice,
} from '@/types/product'
import { useCart } from '@/composables/useCart'
import QuantityPicker from './QuantityPicker.vue'

const cart = useCart()

type OrderType = 'screw' | 'nut' | 'both'

const selectedSize = ref<ScrewSize>('M3')
const selectedType = ref<OrderType>('screw')
const selectedHead = ref<HeadType>('pan')
const selectedLength = ref<number>(10)
const quantity = ref(1)
const addedMessage = ref('')

const availableLengths = computed(() => LENGTHS_BY_SIZE[selectedSize.value])

watch(selectedSize, () => {
  const lengths = LENGTHS_BY_SIZE[selectedSize.value]
  if (!lengths.includes(selectedLength.value)) {
    selectedLength.value = lengths[Math.floor(lengths.length / 2)]!
  }
})

const unitPrice = computed(() => {
  if (selectedType.value === 'both') {
    const screwSpec: ProductSpec = {
      type: 'screw',
      size: selectedSize.value,
      headType: selectedHead.value,
      lengthMm: selectedLength.value,
    }
    const nutSpec: ProductSpec = { type: 'nut', size: selectedSize.value }
    return getPrice(screwSpec) + getPrice(nutSpec)
  }
  if (selectedType.value === 'nut') {
    return getPrice({ type: 'nut', size: selectedSize.value })
  }
  return getPrice({
    type: 'screw',
    size: selectedSize.value,
    headType: selectedHead.value,
    lengthMm: selectedLength.value,
  })
})

const subtotal = computed(() => unitPrice.value * quantity.value)

function addToCart() {
  if (selectedType.value === 'screw' || selectedType.value === 'both') {
    cart.addItem(
      {
        type: 'screw',
        size: selectedSize.value,
        headType: selectedHead.value,
        lengthMm: selectedLength.value,
      },
      quantity.value,
    )
  }
  if (selectedType.value === 'nut' || selectedType.value === 'both') {
    cart.addItem({ type: 'nut', size: selectedSize.value }, quantity.value)
  }

  addedMessage.value = `Added ${quantity.value} item${quantity.value > 1 ? 's' : ''} to cart!`
  setTimeout(() => {
    addedMessage.value = ''
  }, 2000)
}
</script>

<template>
  <section id="purchase" class="purchase-section">
    <div class="container">
      <h2 class="section-title">Pick Your Screws</h2>
      <div class="form-card">
        <!-- Size -->
        <div class="form-group">
          <label class="form-label">Size</label>
          <div class="button-group">
            <button
              v-for="size in SCREW_SIZES"
              :key="size"
              class="option-btn"
              :class="{ active: selectedSize === size }"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Type -->
        <div class="form-group">
          <label class="form-label">Type</label>
          <div class="button-group">
            <button
              class="option-btn"
              :class="{ active: selectedType === 'screw' }"
              @click="selectedType = 'screw'"
            >
              Screw
            </button>
            <button
              class="option-btn"
              :class="{ active: selectedType === 'nut' }"
              @click="selectedType = 'nut'"
            >
              Nut
            </button>
            <button
              class="option-btn"
              :class="{ active: selectedType === 'both' }"
              @click="selectedType = 'both'"
            >
              Screw + Nut
            </button>
          </div>
        </div>

        <!-- Head Type (only for screws) -->
        <div v-if="selectedType !== 'nut'" class="form-group">
          <label class="form-label">Head Type</label>
          <div class="button-group">
            <button
              v-for="head in HEAD_TYPES"
              :key="head.value"
              class="option-btn"
              :class="{ active: selectedHead === head.value }"
              @click="selectedHead = head.value"
            >
              {{ head.label }}
            </button>
          </div>
        </div>

        <!-- Length (only for screws) -->
        <div v-if="selectedType !== 'nut'" class="form-group">
          <label class="form-label">Length</label>
          <div class="button-group">
            <button
              v-for="len in availableLengths"
              :key="len"
              class="option-btn"
              :class="{ active: selectedLength === len }"
              @click="selectedLength = len"
            >
              {{ len }}mm
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <QuantityPicker v-model="quantity" />
        </div>

        <!-- Price + Add to Cart -->
        <div class="form-footer">
          <div class="price-display">
            <span class="price-unit">{{ formatPrice(unitPrice) }} each</span>
            <span class="price-total">{{ formatPrice(subtotal) }} total</span>
          </div>
          <button class="add-to-cart-btn" @click="addToCart">Add to Cart</button>
        </div>

        <Transition name="fade">
          <div v-if="addedMessage" class="added-msg">{{ addedMessage }}</div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.purchase-section {
  padding: 5rem 0;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2.5rem;
}

.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  max-width: 700px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-btn {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition);
}

.option-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-alt);
}

.option-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.price-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-unit {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.price-total {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.add-to-cart-btn {
  background: var(--color-primary);
  color: white;
  padding: 0.85rem 2rem;
  border-radius: var(--radius);
  font-size: 1.05rem;
  font-weight: 600;
  transition: background var(--transition), transform var(--transition);
}

.add-to-cart-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.added-msg {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid var(--color-success);
  border-radius: var(--radius);
  color: var(--color-success);
  text-align: center;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .form-card {
    padding: 1.5rem;
  }

  .form-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    text-align: center;
  }

  .add-to-cart-btn {
    width: 100%;
  }
}
</style>
