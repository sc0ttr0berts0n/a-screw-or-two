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
import ScrewPreview from './ScrewPreview.vue'

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
        <div class="form-layout">
        <div class="form-fields">
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

        </div><!-- end .form-fields -->

        <div class="form-preview">
          <ScrewPreview
            v-if="selectedType !== 'nut'"
            :headType="selectedHead"
            :lengthMm="selectedLength"
            :showNut="selectedType === 'both'"
          />
          <!-- Nut-only preview -->
          <svg v-else class="nut-preview" viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="16,8 28,2 52,2 64,8 64,32 52,38 28,38 16,32" />
            <circle cx="40" cy="20" r="8" fill="var(--color-bg)" stroke="var(--color-bg)" stroke-width="1.5" />
          </svg>
        </div>
        </div><!-- end .form-layout -->

        <!-- Price + Add to Cart -->
        <div class="form-footer">
          <div class="price-display">
            <span class="price-unit">{{ formatPrice(unitPrice) }} each</span>
            <span class="price-total">{{ formatPrice(subtotal) }} total</span>
          </div>
          <button class="add-to-cart-btn" @click="addToCart">Add to Cart</button>
        </div>

        <p class="shipping-note">Ships in a padded envelope — flat rate $3.99</p>
      </div>
    </div>

    <!-- Fixed toast -->
    <Transition name="toast">
      <div v-if="addedMessage" class="cart-toast">{{ addedMessage }}</div>
    </Transition>
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
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.form-card {
  background: var(--color-surface);
  border: var(--border-thick);
  padding: 2.5rem;
  max-width: 700px;
  margin: 0 auto;
  box-shadow: var(--shadow-hard-lg);
}

.form-layout {
  display: flex;
  gap: 2rem;
}

.form-fields {
  flex: 1;
  min-width: 0;
}

.form-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 1rem 0;
}

.nut-preview {
  width: 60px;
  height: 40px;
  color: var(--color-text);
  opacity: 0.7;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
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
  border: 2px solid var(--color-text);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all var(--transition);
}

.option-btn:hover {
  background: var(--color-secondary);
}

.option-btn.active {
  background: var(--color-primary);
  border-color: var(--color-text);
  color: white;
  box-shadow: 2px 2px 0 #000;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: var(--border-thick);
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
  font-size: 1.05rem;
  font-weight: 700;
  font-family: var(--font-display);
  text-transform: uppercase;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  transition: transform var(--transition), box-shadow var(--transition);
}

.add-to-cart-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.shipping-note {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.cart-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background: var(--color-secondary);
  color: var(--color-text);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  padding: 0.75rem 2rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

@media (max-width: 480px) {
  .form-card {
    padding: 1.5rem;
  }

  .form-preview {
    display: none;
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
