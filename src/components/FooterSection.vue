<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">A Screw or Two</span>
        <p class="footer-tagline">Individual screws for individual projects.</p>
      </div>
      <div class="footer-links">
        <router-link to="/shop">Shop</router-link>
        <router-link to="/kits">Kits</router-link>
        <router-link to="/about">About</router-link>
        <router-link to="/faq">FAQ</router-link>
      </div>
      <div class="footer-copy">
        &copy; {{ new Date().getFullYear() }} A Screw or Two. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #1a1a2e;
  border-top: 5px solid var(--color-primary);
  padding: 3rem 0 1.5rem;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.footer-logo {
  font-family: var(--font-display);
  font-size: 1.3rem;
  color: var(--color-secondary);
  text-transform: uppercase;
}

.footer-tagline {
  color: #a0a0b0;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--color-teal);
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  transition: color var(--transition);
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-copy {
  color: #6b6b80;
  font-size: 0.8rem;
}
</style>
