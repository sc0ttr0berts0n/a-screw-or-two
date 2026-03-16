<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/types/product'
import type { CommunityKitRow } from '@/types/supabase'

const auth = useAuth()
const kits = ref<CommunityKitRow[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!auth.user.value) return

  try {
    const { data, error } = await supabase
      .from('community_kits')
      .select('*')
      .eq('author_id', auth.user.value.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    kits.value = data || []
  } catch (err) {
    console.error('Failed to load kits:', err)
  } finally {
    loading.value = false
  }
})

async function archiveKit(id: string) {
  await supabase
    .from('community_kits')
    .update({ status: 'archived' })
    .eq('id', id)

  kits.value = kits.value.map((k) => (k.id === id ? { ...k, status: 'archived' as const } : k))
}

function statusLabel(status: string) {
  if (status === 'published') return 'Published'
  if (status === 'draft') return 'Draft'
  return 'Archived'
}

function statusClass(status: string) {
  if (status === 'published') return 'status-published'
  if (status === 'draft') return 'status-draft'
  return 'status-archived'
}
</script>

<template>
  <div class="my-kits-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">My Kits</h1>
        <router-link to="/kits/new" class="create-btn">+ Create New Kit</router-link>
      </div>

      <div v-if="loading" class="status-msg">Loading your kits...</div>

      <div v-else-if="kits.length === 0" class="empty-state">
        <p class="empty-icon">🔧</p>
        <p class="empty-text">You haven't created any kits yet.</p>
        <p class="empty-sub">Share your project's Bill of Materials with the maker community.</p>
        <router-link to="/kits/new" class="create-btn">Create Your First Kit</router-link>
      </div>

      <div v-else class="kits-list">
        <div v-for="kit in kits" :key="kit.id" class="kit-row">
          <div class="kit-info">
            <div class="kit-title-row">
              <router-link
                :to="kit.status === 'published' ? `/kits/${kit.slug}` : `/kits/${kit.slug}/edit`"
                class="kit-title"
              >
                {{ kit.title }}
              </router-link>
              <span class="kit-status" :class="statusClass(kit.status)">{{ statusLabel(kit.status) }}</span>
            </div>
            <div class="kit-meta">
              <span>{{ kit.item_count || 0 }} items</span>
              <span>{{ formatPrice(kit.retail_total_cents || 0) }}</span>
              <span>{{ kit.view_count }} views</span>
              <span>{{ kit.cart_add_count }} cart adds</span>
            </div>
          </div>
          <div class="kit-actions">
            <router-link :to="`/kits/${kit.slug}/edit`" class="action-btn">Edit</router-link>
            <button
              v-if="kit.status !== 'archived'"
              class="action-btn archive"
              @click="archiveKit(kit.id)"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-kits-page {
  padding: 4rem 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.2rem;
  display: inline-block;
  background: var(--color-secondary);
  padding: 0.1em 0.3em;
  border: var(--border-thick);
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
  transition: transform var(--transition), box-shadow var(--transition);
}

.create-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.status-msg {
  padding: 3rem;
  background: var(--color-surface);
  border: var(--border-thick);
  text-align: center;
  color: var(--color-text-muted);
}

.empty-state {
  padding: 4rem 2rem;
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.empty-sub {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.kits-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
}

.kit-title {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-text);
  text-decoration: none;
}

.kit-title:hover {
  color: var(--color-primary);
}

.kit-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.kit-status {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.15rem 0.5rem;
  border: 2px solid;
}

.status-published {
  background: var(--color-teal);
  border-color: var(--color-text);
}

.status-draft {
  background: var(--color-secondary);
  border-color: var(--color-text);
}

.status-archived {
  background: #eee;
  border-color: #999;
  color: #999;
}

.kit-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.kit-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: var(--font-body);
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid var(--color-text);
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition);
}

.action-btn:hover {
  background: var(--color-secondary);
}

.action-btn.archive:hover {
  background: #ffe0e0;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .kit-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .kit-meta {
    flex-wrap: wrap;
  }
}
</style>
