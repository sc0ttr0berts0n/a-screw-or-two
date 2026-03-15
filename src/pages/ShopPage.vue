<script setup lang="ts">
import { useProducts } from '@/composables/useProducts'
import ProductCard from '@/components/ProductCard.vue'

const { data: products, loading, error } = useProducts()
</script>

<template>
  <div class="shop-page">
    <div class="container">
      <h1 class="page-title">Shop Fasteners</h1>
      <p class="page-subtitle">Individual metric screws, nuts, washers, inserts, and standoffs.</p>

      <div v-if="loading" class="status-msg">Loading products...</div>
      <div v-else-if="error" class="status-msg error">{{ error }}</div>
      <div v-else-if="!products || products.length === 0" class="status-msg">
        No products found. Make sure your Sanity project is configured and seeded.
      </div>
      <div v-else class="product-grid">
        <ProductCard v-for="product in products" :key="product._id" :product="product" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-page {
  padding: 4rem 0;
}

.page-title {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  display: inline-block;
  background: var(--color-secondary);
  padding: 0.1em 0.3em;
  border: var(--border-thick);
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  margin-top: 0.75rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
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
</style>
