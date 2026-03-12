<script setup lang="ts">
import ScrewCanvas from './ScrewCanvas.vue'
</script>

<template>
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-visual">
        <ScrewCanvas />
      </div>
      <div class="hero-content">
        <h1 class="hero-title">
          Need just <span class="highlight">one</span> screw?
          <br />We've got you.
        </h1>
        <p class="hero-subtitle">
          Individual metric screws and nuts, M1 through M10.
          No bulk packs, no minimum order. Just what you need.
        </p>
        <a href="#purchase" class="hero-cta">Shop Now</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: 2rem 0;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-alt) 50%, var(--color-accent) 100%);
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

.hero-visual {
  height: 400px;
}

.hero-content {
  padding: 1rem 0;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.highlight {
  color: var(--color-primary);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  max-width: 460px;
  line-height: 1.7;
}

.hero-cta {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.9rem 2.5rem;
  border-radius: var(--radius);
  font-size: 1.1rem;
  font-weight: 600;
  transition: background var(--transition), transform var(--transition);
}

.hero-cta:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .hero-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-visual {
    height: 280px;
    order: -1;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: auto;
    padding: 3rem 0;
  }

  .hero-title {
    font-size: 1.7rem;
  }

  .hero-visual {
    height: 220px;
  }
}
</style>
