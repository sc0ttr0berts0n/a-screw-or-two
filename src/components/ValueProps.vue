<template>
  <section class="value-props">
    <div class="container">
      <h2 class="section-title">Why Buy From Us?</h2>
      <div class="props-grid">
        <div class="prop-card">
          <div class="prop-icon">1</div>
          <h3>Buy Just One</h3>
          <p>No more buying a box of 100 when you only need 2. Pick exactly what you need, nothing more.</p>
        </div>
        <div class="prop-card">
          <div class="prop-icon">M</div>
          <h3>Every Metric Size</h3>
          <p>From tiny M1 screws for electronics to sturdy M10 bolts for furniture. All standard metric sizes in stock.</p>
        </div>
        <div class="prop-card">
          <div class="prop-icon">$</div>
          <h3>Hobby-Friendly Prices</h3>
          <p>Starting at just $0.15 per screw. Your weekend project doesn't need to break the bank.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.value-props {
  padding: 5rem 0;
  background: var(--color-bg-alt);
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
}

.props-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.prop-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  transition: transform var(--transition), border-color var(--transition);
}

.prop-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
}

.prop-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.2rem;
}

.prop-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
}

.prop-card p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .props-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>
