<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from './composables/useCart'
import CartSummary from './components/CartSummary.vue'
import FooterSection from './components/FooterSection.vue'

const cart = useCart()
const menuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => { menuOpen.value = false })
</script>

<template>
  <div class="app">
    <header class="site-header">
      <div class="container header-inner">
        <router-link to="/" class="logo">A Screw or Two</router-link>

        <button class="hamburger" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <nav class="nav" :class="{ open: menuOpen }">
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

/* Hamburger button */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 60;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 3px;
  background: var(--color-text);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-secondary);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    z-index: 55;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .nav.open {
    opacity: 1;
    pointer-events: auto;
  }

  .nav a {
    font-size: 1.5rem;
  }
}
</style>
