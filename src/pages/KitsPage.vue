<script setup lang="ts">
// TODO: Phase 4 — fetch kits from Sanity and display in grid
</script>

<template>
  <div class="kits-page">
    <div class="container">
      <h1 class="page-title">Project Kits</h1>
      <p class="page-subtitle">Curated fastener bundles for popular maker projects.</p>
      <div class="coming-soon">
        Kit catalog coming in Phase 4.
      </div>
    </div>
  </div>
</template>

<style scoped>
.kits-page {
  padding: 4rem 0;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.coming-soon {
  padding: 3rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
