<script setup lang="ts">
import { useCart } from '@/composables/useCart'
import QuantityPicker from '@/components/QuantityPicker.vue'

const cart = useCart()
</script>

<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">Your Cart</h1>

      <div v-if="cart.items.length === 0" class="empty-cart">
        <p>Your cart is empty.</p>
        <router-link to="/shop" class="shop-link">Browse Fasteners</router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.id" class="cart-item">
            <div class="item-info">
              <span class="item-name">{{ cart.describeProduct(item.spec) }}</span>
              <span class="item-unit-price">{{ cart.formatPrice(item.unitPriceCents) }} each</span>
            </div>
            <div class="item-controls">
              <QuantityPicker
                :model-value="item.quantity"
                @update:model-value="(qty: number) => cart.updateQuantity(item.id, qty)"
              />
              <span class="item-total">{{ cart.formatPrice(item.unitPriceCents * item.quantity) }}</span>
              <button class="remove-btn" @click="cart.removeItem(item.id)">Remove</button>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span class="summary-value">{{ cart.totalFormatted.value }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span class="summary-value">Calculated at checkout</span>
          </div>
          <div class="summary-row total-row">
            <span>Total</span>
            <span class="summary-value">{{ cart.totalFormatted.value }}</span>
          </div>
          <button class="checkout-btn" disabled>
            Checkout (Coming Soon)
          </button>
          <router-link to="/shop" class="continue-link">Continue Shopping</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  padding: 4rem 0;
}

.page-title {
  font-size: 2.2rem;
  margin-bottom: 2rem;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
}

.empty-cart p {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.shop-link {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 2rem;
  font-weight: 700;
  font-family: var(--font-display);
  text-transform: uppercase;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  transition: transform var(--transition), box-shadow var(--transition);
}

.shop-link:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-weight: 700;
}

.item-unit-price {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.item-total {
  font-weight: 700;
  font-size: 1.05rem;
  min-width: 60px;
  text-align: right;
}

.remove-btn {
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 700;
  background: none;
  text-transform: uppercase;
  transition: opacity var(--transition);
}

.remove-btn:hover {
  opacity: 0.7;
}

.cart-summary {
  padding: 1.5rem;
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  position: sticky;
  top: 80px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  font-size: 0.95rem;
}

.summary-value {
  font-weight: 700;
}

.total-row {
  border-top: var(--border-thick);
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.checkout-btn {
  width: 100%;
  background: var(--color-primary);
  color: white;
  padding: 0.85rem;
  font-size: 1.05rem;
  font-weight: 700;
  font-family: var(--font-display);
  text-transform: uppercase;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  margin-top: 1.25rem;
  transition: transform var(--transition), box-shadow var(--transition);
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkout-btn:not(:disabled):hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.continue-link {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  transition: color var(--transition);
}

.continue-link:hover {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .item-controls {
    justify-content: space-between;
  }
}
</style>
