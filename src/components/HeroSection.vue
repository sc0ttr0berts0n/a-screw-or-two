<script setup lang="ts">
import ScrewCanvas from './ScrewCanvas.vue'
</script>

<template>
  <section class="hero">
    <div class="hero-shapes">
      <div class="shape shape-triangle"></div>
      <div class="shape shape-circle"></div>
      <div class="shape shape-zigzag"></div>
      <div class="shape shape-square"></div>
    </div>
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
        <router-link to="/shop" class="hero-cta">Shop Now</router-link>
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
  background: var(--color-teal);
  position: relative;
  overflow: hidden;
}

.hero-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
}

.shape-triangle {
  width: 0;
  height: 0;
  border-left: 60px solid transparent;
  border-right: 60px solid transparent;
  border-bottom: 100px solid var(--color-secondary);
  top: 10%;
  left: 5%;
  transform: rotate(-15deg);
  opacity: 0.7;
}

.shape-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-primary);
  bottom: 15%;
  right: 8%;
  opacity: 0.6;
}

.shape-zigzag {
  width: 80px;
  height: 40px;
  background:
    linear-gradient(135deg, var(--color-accent) 25%, transparent 25%) -10px 0,
    linear-gradient(225deg, var(--color-accent) 25%, transparent 25%) -10px 0,
    linear-gradient(315deg, var(--color-accent) 25%, transparent 25%),
    linear-gradient(45deg, var(--color-accent) 25%, transparent 25%);
  background-size: 20px 20px;
  top: 20%;
  right: 15%;
  opacity: 0.5;
  transform: rotate(12deg);
}

.shape-square {
  width: 80px;
  height: 80px;
  background: var(--color-accent);
  bottom: 20%;
  left: 8%;
  transform: rotate(25deg);
  opacity: 0.5;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-visual {
  height: 400px;
}

.hero-content {
  padding: 1rem 0;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  color: var(--color-text);
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.15);
}

.highlight {
  color: var(--color-primary);
  background: var(--color-secondary);
  padding: 0 0.2em;
  border: 3px solid #000;
  display: inline-block;
  transform: rotate(-2deg);
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--color-text);
  margin-bottom: 2rem;
  max-width: 460px;
  line-height: 1.7;
  font-weight: 700;
}

.hero-cta {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.9rem 2.5rem;
  border: var(--border-thick);
  font-size: 1.1rem;
  font-weight: 700;
  font-family: var(--font-display);
  text-transform: uppercase;
  box-shadow: var(--shadow-hard);
  transition: transform var(--transition), box-shadow var(--transition);
}

.hero-cta:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
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

  .shape-triangle,
  .shape-zigzag {
    display: none;
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
