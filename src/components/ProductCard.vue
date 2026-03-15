<script setup lang="ts">
import type { SanityProduct } from '@/types/sanity'
import { formatPrice } from '@/types/product'

defineProps<{ product: SanityProduct }>()
</script>

<template>
  <router-link :to="`/shop/${product.slug}`" class="product-card">
    <div class="product-image" v-if="product.imageUrl">
      <img :src="product.imageUrl" :alt="product.name" />
    </div>
    <div class="product-image placeholder" v-else>
      <span class="placeholder-icon">{{ product.size }}</span>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-meta">
        <span class="product-sku">{{ product.sku }}</span>
        <span class="product-finish">{{ product.finish === 'stainless' ? 'Stainless' : 'Black Oxide' }}</span>
      </div>
      <div class="product-price">{{ formatPrice(product.priceCents) }} each</div>
    </div>
  </router-link>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: var(--border-thick);
  overflow: hidden;
  text-decoration: none;
  color: var(--color-text);
  box-shadow: var(--shadow-hard);
  transition: transform var(--transition), box-shadow var(--transition);
}

.product-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.product-image {
  height: 120px;
  background: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: var(--border-thick);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-icon {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-text);
  opacity: 0.6;
}

.product-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.product-name {
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.3;
}

.product-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.product-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-top: 0.25rem;
}
</style>
