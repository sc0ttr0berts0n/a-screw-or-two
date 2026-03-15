<script setup lang="ts">
import { ref } from 'vue'
import { useCart } from '@/composables/useCart'

const cart = useCart()
const isOpen = ref(false)
const showCheckoutMsg = ref(false)

function toggleCart() {
  isOpen.value = !isOpen.value
}

function checkout() {
  showCheckoutMsg.value = true
  setTimeout(() => {
    showCheckoutMsg.value = false
  }, 3000)
}
</script>

<template>
  <div v-if="cart.itemCount.value > 0" class="cart-floating">
    <button class="cart-toggle" @click="toggleCart">
      Cart ({{ cart.itemCount.value }}) &mdash; {{ cart.totalFormatted.value }}
    </button>

    <Transition name="slide">
      <div v-if="isOpen" class="cart-dropdown">
        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.id" class="cart-item">
            <div class="cart-item-info">
              <span class="cart-item-name">{{ cart.describeProduct(item.spec) }}</span>
              <span class="cart-item-qty">x{{ item.quantity }}</span>
            </div>
            <div class="cart-item-actions">
              <span class="cart-item-price">{{ cart.formatPrice(item.unitPriceCents * item.quantity) }}</span>
              <button class="remove-btn" @click="cart.removeItem(item.id)">x</button>
            </div>
          </div>
        </div>
        <div class="cart-total">
          <span>Total</span>
          <span class="cart-total-amount">{{ cart.totalFormatted.value }}</span>
        </div>
        <button class="checkout-btn" @click="checkout">Checkout</button>
        <div v-if="showCheckoutMsg" class="checkout-msg">
          Checkout coming soon! Thanks for browsing.
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cart-floating {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 100;
}

.cart-toggle {
  background: var(--color-primary);
  color: white;
  padding: 0.85rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  transition: all var(--transition);
}

.cart-toggle:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.cart-dropdown {
  position: absolute;
  bottom: calc(100% + 0.75rem);
  right: 0;
  width: 340px;
  background: var(--color-surface);
  border: var(--border-thick);
  padding: 1.25rem;
  box-shadow: var(--shadow-hard-lg);
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 2px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.cart-item-name {
  font-size: 0.85rem;
  font-weight: 700;
}

.cart-item-qty {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cart-item-price {
  font-size: 0.9rem;
  font-weight: 700;
}

.remove-btn {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition);
}

.remove-btn:hover {
  background: var(--color-primary-hover);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  margin-top: 0.5rem;
  border-top: var(--border-thick);
  font-weight: 700;
}

.cart-total-amount {
  font-size: 1.1rem;
  color: var(--color-primary);
}

.checkout-btn {
  width: 100%;
  background: var(--color-teal);
  color: var(--color-text);
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-display);
  text-transform: uppercase;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  margin-top: 0.75rem;
  transition: transform var(--transition), box-shadow var(--transition);
}

.checkout-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.checkout-msg {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-align: center;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 480px) {
  .cart-dropdown {
    width: calc(100vw - 3rem);
    right: -0.75rem;
  }
}
</style>
