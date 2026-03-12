<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">A Screw or Two</span>
        <p class="footer-tagline">Individual screws for individual projects.</p>
      </div>
      <div class="footer-links">
        <a href="#purchase">Shop</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
        <a href="#">FAQ</a>
      </div>
      <div class="footer-copy">
        &copy; {{ new Date().getFullYear() }} A Screw or Two. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-bg-alt);
  border-top: 1px solid var(--color-border);
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
  font-size: 1.3rem;
  font-weight: 700;
}

.footer-tagline {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  transition: color var(--transition);
}

.footer-links a:hover {
  color: var(--color-text);
}

.footer-copy {
  color: var(--color-text-dim);
  font-size: 0.8rem;
}
</style>
