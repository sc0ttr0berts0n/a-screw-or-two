<template>
  <section class="value-props">
    <div class="container">
      <h2 class="section-title">Why Buy From Us?</h2>
      <div class="props-grid">
        <div class="prop-card prop-teal">
          <div class="prop-icon">1</div>
          <h3>Buy Just One</h3>
          <p>No more buying a box of 100 when you only need 2. Pick exactly what you need, nothing more.</p>
        </div>
        <div class="prop-card prop-pink">
          <div class="prop-icon">M</div>
          <h3>Every Metric Size</h3>
          <p>From tiny M1 screws for electronics to sturdy M10 bolts for furniture. All standard metric sizes in stock.</p>
        </div>
        <div class="prop-card prop-yellow">
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
  background: var(--color-accent);
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 3rem;
  color: white;
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3);
}

.props-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.prop-card {
  border: var(--border-thick);
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-hard);
  color: var(--color-text);
}

.prop-teal {
  background: var(--color-teal);
}

.prop-pink {
  background: var(--color-primary);
  color: white;
}

.prop-yellow {
  background: var(--color-secondary);
}

.prop-icon {
  width: 56px;
  height: 56px;
  border: var(--border-thick);
  background: white;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 1.5rem;
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
  font-size: 0.9rem;
  line-height: 1.6;
  font-weight: 700;
}

.prop-pink p,
.prop-pink h3 {
  color: white;
}

@media (max-width: 768px) {
  .props-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>
