<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/types/product'
import type { Profile, CommunityKitRow } from '@/types/supabase'

const props = defineProps<{ username: string }>()

const profile = ref<Profile | null>(null)
const kits = ref<CommunityKitRow[]>([])
const loading = ref(true)
const notFound = ref(false)

onMounted(async () => {
  try {
    // Fetch profile by username
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', props.username)
      .single()

    if (profileError || !profileData) {
      notFound.value = true
      return
    }

    profile.value = profileData

    // Fetch their published kits
    const { data: kitsData } = await supabase
      .from('community_kits')
      .select('*')
      .eq('author_id', profileData.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    kits.value = kitsData || []
  } catch (err) {
    console.error('Profile load error:', err)
    notFound.value = true
  } finally {
    loading.value = false
  }
})

const totalViews = () => kits.value.reduce((sum, k) => sum + k.view_count, 0)
</script>

<template>
  <div class="profile-page">
    <div class="container">
      <div v-if="loading" class="status-msg">Loading profile...</div>

      <div v-else-if="notFound" class="status-msg">
        <p class="error-icon">:(</p>
        <p>User not found.</p>
      </div>

      <template v-else-if="profile">
        <div class="profile-header">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            :alt="profile.display_name || profile.username"
            class="profile-avatar"
          />
          <div v-else class="profile-avatar-fallback">
            {{ profile.username[0].toUpperCase() }}
          </div>
          <div class="profile-info">
            <h1 class="profile-name">{{ profile.display_name || profile.username }}</h1>
            <p class="profile-username">@{{ profile.username }}</p>
            <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat">
            <span class="stat-value">{{ kits.length }}</span>
            <span class="stat-label">Kits</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ totalViews() }}</span>
            <span class="stat-label">Views</span>
          </div>
        </div>

        <h2 class="section-title" v-if="kits.length > 0">Published Kits</h2>

        <div v-if="kits.length === 0" class="empty-state">
          <p>This user hasn't published any kits yet.</p>
        </div>

        <div v-else class="kits-grid">
          <router-link
            v-for="kit in kits"
            :key="kit.id"
            :to="`/kits/${kit.slug}`"
            class="kit-card"
          >
            <h3 class="kit-card-title">{{ kit.title }}</h3>
            <p class="kit-card-desc">{{ kit.description }}</p>
            <div class="kit-card-meta">
              <span>{{ kit.item_count || 0 }} items</span>
              <span>{{ formatPrice(kit.retail_total_cents || 0) }}</span>
              <span>{{ kit.view_count }} views</span>
            </div>
            <div class="kit-card-tags" v-if="kit.tags?.length">
              <span v-for="tag in kit.tags.slice(0, 3)" :key="tag" class="kit-tag">{{ tag }}</span>
            </div>
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 4rem 0;
}

.status-msg {
  padding: 3rem;
  background: var(--color-surface);
  border: var(--border-thick);
  text-align: center;
  color: var(--color-text-muted);
}

.error-icon {
  font-size: 2.5rem;
  font-weight: 700;
  opacity: 0.4;
  margin-bottom: 0.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: var(--border-thick);
  object-fit: cover;
}

.profile-avatar-fallback {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: var(--border-thick);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}

.profile-name {
  font-size: 1.8rem;
  margin-bottom: 0.1rem;
}

.profile-username {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.profile-bio {
  font-size: 0.95rem;
  color: var(--color-text);
}

.profile-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2.5rem;
  padding: 1rem 1.5rem;
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  display: inline-flex;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.section-title {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
}

.kits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.kit-card {
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  padding: 1.25rem;
  text-decoration: none;
  color: var(--color-text);
  transition: transform var(--transition), box-shadow var(--transition);
}

.kit-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.kit-card-title {
  font-size: 1.05rem;
  margin-bottom: 0.5rem;
}

.kit-card-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kit-card-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.kit-card-tags {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.kit-tag {
  background: var(--color-secondary);
  border: 2px solid var(--color-text);
  padding: 0.1rem 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
}
</style>
