<script setup lang="ts">
defineProps<{ slug: string }>()
// TODO: Phase 4 — fetch kit by slug from Sanity with expanded contents
</script>

<template>
  <div class="kit-detail-page">
    <div class="container">
      <h1 class="page-title">Kit: {{ slug }}</h1>
      <div class="coming-soon">
        Kit detail coming in Phase 4.
      </div>
    </div>
  </div>
</template>

<style scoped>
.kit-detail-page {
  padding: 4rem 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
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
