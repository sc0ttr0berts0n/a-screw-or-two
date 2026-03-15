<script setup lang="ts">
defineProps<{ slug: string }>()
// TODO: Phase 3 — fetch page content from Sanity by slug
</script>

<template>
  <div class="content-page">
    <div class="container">
      <h1 class="page-title">{{ slug }}</h1>
      <div class="coming-soon">
        Content pages will be loaded from Sanity CMS.
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-page {
  padding: 4rem 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 2rem;
  text-transform: capitalize;
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
