<script setup lang="ts">
import { useCart } from './composables/useCart'
import CartSummary from './components/CartSummary.vue'
import FooterSection from './components/FooterSection.vue'

const cart = useCart()
</script>

<template>
  <div class="app">
    <header class="site-header">
      <div class="container header-inner">
        <router-link to="/" class="logo">A Screw or Two</router-link>
        <nav class="nav">
          <router-link to="/shop">Shop</router-link>
          <router-link to="/kits">Kits</router-link>
          <router-link to="/cart" class="nav-cart-link">
            Cart
            <span v-if="cart.itemCount.value > 0" class="cart-badge">{{ cart.itemCount.value }}</span>
          </router-link>
        </nav>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <FooterSection />
    <CartSummary />
  </div>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-secondary);
  border-bottom: var(--border-thick);
  padding: 0.75rem 0;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--color-text);
  text-decoration: none;
  text-transform: uppercase;
}

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav a {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color var(--transition);
}

.nav a:hover {
  color: var(--color-primary);
}

.nav a.router-link-active {
  color: var(--color-primary);
}

.nav-cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -10px;
  right: -14px;
  background: var(--color-teal);
  color: var(--color-text);
  font-size: 0.7rem;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border: 2px solid #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

main {
  margin-top: 60px;
}
</style>
