<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const auth = useAuth()
const router = useRouter()
const menuOpen = ref(false)

async function handleSignOut() {
  menuOpen.value = false
  await auth.signOut()
  router.push('/')
}

function goToMyKits() {
  menuOpen.value = false
  router.push('/my-kits')
}

function goToProfile() {
  menuOpen.value = false
  if (auth.profile.value?.username) {
    router.push(`/u/${auth.profile.value.username}`)
  }
}
</script>

<template>
  <div class="user-menu" v-if="auth.isAuthenticated.value">
    <button class="user-trigger" @click="menuOpen = !menuOpen">
      <img
        v-if="auth.profile.value?.avatar_url"
        :src="auth.profile.value.avatar_url"
        :alt="auth.profile.value.display_name || auth.profile.value.username"
        class="user-avatar"
      />
      <span v-else class="user-avatar-fallback">
        {{ (auth.profile.value?.username || '?')[0].toUpperCase() }}
      </span>
    </button>

    <Transition name="dropdown">
      <div v-if="menuOpen" class="dropdown" @click.stop>
        <div class="dropdown-header">
          <span class="dropdown-name">
            {{ auth.profile.value?.display_name || auth.profile.value?.username }}
          </span>
          <span class="dropdown-username">@{{ auth.profile.value?.username }}</span>
        </div>
        <div class="dropdown-divider" />
        <button class="dropdown-item" @click="goToMyKits">My Kits</button>
        <button class="dropdown-item" @click="goToProfile">Profile</button>
        <div class="dropdown-divider" />
        <button class="dropdown-item signout" @click="handleSignOut">Sign Out</button>
      </div>
    </Transition>

    <!-- Backdrop to close -->
    <div v-if="menuOpen" class="backdrop" @click="menuOpen = false" />
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.user-trigger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-text);
  object-fit: cover;
}

.user-avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-text);
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  min-width: 200px;
  z-index: 60;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dropdown-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.dropdown-username {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.dropdown-divider {
  height: 2px;
  background: var(--color-text);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.65rem 1rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: var(--font-body);
  cursor: pointer;
  color: var(--color-text);
  transition: background var(--transition);
}

.dropdown-item:hover {
  background: var(--color-secondary);
}

.dropdown-item.signout {
  color: var(--color-primary);
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 55;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
