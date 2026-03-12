<script setup lang="ts">
import HeroSection from './components/HeroSection.vue'
import ValueProps from './components/ValueProps.vue'
import PurchaseForm from './components/PurchaseForm.vue'
import CartSummary from './components/CartSummary.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div class="app">
    <header class="site-header">
      <div class="container header-inner">
        <span class="logo">A Screw or Two</span>
        <nav class="nav">
          <a href="#purchase">Shop</a>
          <a href="#" class="nav-cart-link">Cart</a>
        </nav>
      </div>
    </header>

    <main>
      <HeroSection />
      <ValueProps />
      <PurchaseForm />
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
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 0;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text);
}

.nav {
  display: flex;
  gap: 1.5rem;
}

.nav a {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color var(--transition);
}

.nav a:hover {
  color: var(--color-text);
}

main {
  margin-top: 60px;
}
</style>
