<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import { formatPrice } from '@/types/product'
import { KIT_CATEGORIES } from '@/types/kit'
import type { CommunityKitRow } from '@/types/supabase'

const auth = useAuth()
const kits = ref<(CommunityKitRow & { author_username?: string; author_display_name?: string })[]>([])
const loading = ref(true)
const search = ref('')
const categoryFilter = ref('')
const sortBy = ref<'newest' | 'views' | 'cart_adds'>('newest')

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('community_kits')
      .select('*, profiles!community_kits_author_id_fkey(username, display_name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw error

    kits.value = (data || []).map((k: any) => ({
      ...k,
      author_username: k.profiles?.username,
      author_display_name: k.profiles?.display_name,
    }))
  } catch (err) {
    console.error('Failed to load kits:', err)
  } finally {
    loading.value = false
  }
})

const filteredKits = computed(() => {
  let result = [...kits.value]

  // Search
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(
      (k) =>
        k.title.toLowerCase().includes(q) ||
        (k.description || '').toLowerCase().includes(q) ||
        k.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }

  // Category filter
  if (categoryFilter.value) {
    result = result.filter((k) => k.category === categoryFilter.value)
  }

  // Sort
  if (sortBy.value === 'views') {
    result.sort((a, b) => b.view_count - a.view_count)
  } else if (sortBy.value === 'cart_adds') {
    result.sort((a, b) => b.cart_add_count - a.cart_add_count)
  }
  // 'newest' is default order from query

  return result
})
</script>

<template>
  <div class="kits-page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Project Kits</h1>
          <p class="page-subtitle">Community-curated Bills of Materials for maker projects. Find the exact screws you need.</p>
        </div>
        <router-link
          v-if="auth.isAuthenticated.value"
          to="/kits/new"
          class="create-btn"
        >
          + Create a Kit
        </router-link>
        <button
          v-else
          class="create-btn"
          @click="auth.showAuthModal.value = true"
        >
          Sign In to Create
        </button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Search kits (e.g. Voron, Ender 3, CNC)..."
        />
        <select v-model="categoryFilter" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in KIT_CATEGORIES" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="newest">Newest</option>
          <option value="views">Most Viewed</option>
          <option value="cart_adds">Most Popular</option>
        </select>
      </div>

      <!-- Results -->
      <div v-if="loading" class="status-msg">Loading kits...</div>

      <div v-else-if="filteredKits.length === 0" class="status-msg">
        <p v-if="search || categoryFilter">No kits match your search. Try different terms?</p>
        <p v-else>No kits yet. Be the first to create one!</p>
      </div>

      <div v-else class="kits-grid">
        <router-link
          v-for="kit in filteredKits"
          :key="kit.id"
          :to="`/kits/${kit.slug}`"
          class="kit-card"
        >
          <div class="kit-card-header">
            <span class="badge community">Community</span>
          </div>
          <h3 class="kit-card-title">{{ kit.title }}</h3>
          <p v-if="kit.description" class="kit-card-desc">{{ kit.description }}</p>
          <div class="kit-card-stats">
            <span>{{ kit.item_count || 0 }} items</span>
            <span class="kit-card-price">{{ formatPrice(kit.retail_total_cents || 0) }}</span>
          </div>
          <div class="kit-card-meta">
            <span>{{ kit.view_count }} views</span>
            <span v-if="kit.author_username">by @{{ kit.author_username }}</span>
          </div>
          <div class="kit-card-tags" v-if="kit.tags?.length">
            <span v-for="tag in kit.tags.slice(0, 4)" :key="tag" class="kit-tag">{{ tag }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kits-page { padding: 4rem 0; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-title {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  display: inline-block;
  background: var(--color-secondary);
  padding: 0.1em 0.3em;
  border: var(--border-thick);
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  margin-top: 0.75rem;
}

.create-btn {
  background: var(--color-primary);
  color: white;
  padding: 0.7rem 1.5rem;
  font-weight: 700;
  font-family: var(--font-display);
  font-size: 0.9rem;
  text-transform: uppercase;
  text-decoration: none;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: transform var(--transition), box-shadow var(--transition);
}

.create-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  font-family: var(--font-body);
  border: var(--border-thick);
  background: var(--color-surface);
}

.filter-select {
  padding: 0.65rem 0.75rem;
  font-size: 0.9rem;
  font-family: var(--font-body);
  font-weight: 700;
  border: var(--border-thick);
  background: var(--color-surface);
  cursor: pointer;
}

.status-msg {
  padding: 3rem;
  background: var(--color-surface);
  border: var(--border-thick);
  text-align: center;
  color: var(--color-text-muted);
  box-shadow: var(--shadow-hard);
}

.kits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.kit-card {
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  padding: 1.5rem;
  text-decoration: none;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  transition: transform var(--transition), box-shadow var(--transition);
}

.kit-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.kit-card-header {
  margin-bottom: 0.5rem;
}

.badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border: 2px solid var(--color-text);
}

.badge.community { background: var(--color-accent); color: white; }
.badge.official { background: var(--color-teal); color: var(--color-text); }

.kit-card-title {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
  line-height: 1.25;
}

.kit-card-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.kit-card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
}

.kit-card-price {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text);
}

.kit-card-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.kit-card-tags {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.kit-tag {
  background: var(--color-secondary);
  border: 2px solid var(--color-text);
  padding: 0.1rem 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
  }

  .filters {
    flex-direction: column;
  }

  .kits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
