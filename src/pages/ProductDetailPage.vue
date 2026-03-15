<script setup lang="ts">
import { useProduct } from '@/composables/useProduct'
import { useCart } from '@/composables/useCart'
import { formatPrice } from '@/types/product'
import QuantityPicker from '@/components/QuantityPicker.vue'
import { ref } from 'vue'

const props = defineProps<{ slug: string }>()
const { data: product, loading, error } = useProduct(props.slug)
const cart = useCart()
const quantity = ref(1)
const addedMessage = ref('')

function addToCart() {
  if (!product.value) return
  cart.addItem(
    {
      type: product.value.productType === 'nut' ? 'nut' : 'screw',
      size: product.value.size as import('@/types/product').ScrewSize,
      ...(product.value.productType === 'screw'
        ? {
            headType: (product.value.headType || 'pan') as import('@/types/product').HeadType,
            lengthMm: product.value.lengthMm || 10,
          }
        : {}),
    } as import('@/types/product').ProductSpec,
    quantity.value,
  )
  addedMessage.value = `Added ${quantity.value} to cart!`
  setTimeout(() => {
    addedMessage.value = ''
  }, 2000)
}
</script>

<template>
  <div class="product-detail-page">
    <div class="container">
      <div v-if="loading" class="status-msg">Loading product...</div>
      <div v-else-if="error" class="status-msg error">{{ error }}</div>
      <div v-else-if="!product" class="status-msg">Product not found.</div>
      <div v-else class="product-detail">
        <div class="product-image" v-if="product.imageUrl">
          <img :src="product.imageUrl" :alt="product.name" />
        </div>
        <div class="product-image placeholder" v-else>
          <span class="placeholder-icon">{{ product.size }}</span>
        </div>

        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-meta">
            <span class="meta-item">SKU: {{ product.sku }}</span>
            <span class="meta-item">{{ product.finish === 'stainless' ? 'Stainless Steel' : 'Black Oxide' }}</span>
            <span class="meta-item">{{ product.material === 'nylon' ? 'Nylon' : 'Steel' }}</span>
          </div>
          <p class="product-description">{{ product.description }}</p>

          <div class="product-price">{{ formatPrice(product.priceCents) }} each</div>

          <div class="add-section">
            <QuantityPicker v-model="quantity" />
            <button class="add-to-cart-btn" @click="addToCart">
              Add to Cart — {{ formatPrice(product.priceCents * quantity) }}
            </button>
          </div>

          <Transition name="fade">
            <div v-if="addedMessage" class="added-msg">{{ addedMessage }}</div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail-page {
  padding: 4rem 0;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.product-image {
  height: 300px;
  background: var(--color-secondary);
  border: var(--border-thick);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: var(--shadow-hard);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-icon {
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--color-text);
  opacity: 0.5;
}

.product-name {
  font-size: 1.8rem;
  margin-bottom: 0.75rem;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.meta-item {
  font-size: 0.85rem;
  color: var(--color-text);
  background: var(--color-secondary);
  padding: 0.3rem 0.6rem;
  border: 2px solid #000;
  font-weight: 700;
}

.product-description {
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.add-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.add-to-cart-btn {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
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

.added-msg {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--color-teal);
  border: var(--border-thick);
  color: var(--color-text);
  text-align: center;
  font-weight: 700;
}

.status-msg {
  padding: 3rem;
  background: var(--color-surface);
  border: var(--border-thick);
  text-align: center;
  color: var(--color-text-muted);
  box-shadow: var(--shadow-hard);
}

.status-msg.error {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .product-image {
    height: 200px;
  }
}
</style>
