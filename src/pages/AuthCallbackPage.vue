<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const error = ref('')

onMounted(async () => {
  try {
    const { error: authError } = await supabase.auth.exchangeCodeForSession(
      window.location.href,
    )
    if (authError) throw authError

    // Check if user needs to set a username (redirect to profile setup)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      // If username starts with 'user-' it's the auto-generated one — prompt to change
      if (profile?.username?.startsWith('user-')) {
        router.replace('/my-kits?setup=true')
        return
      }
    }

    // Redirect to where they came from, or home
    const redirectTo = sessionStorage.getItem('auth-redirect') || '/'
    sessionStorage.removeItem('auth-redirect')
    router.replace(redirectTo)
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = 'Authentication failed. Please try again.'
    setTimeout(() => router.replace('/'), 3000)
  }
})
</script>

<template>
  <div class="callback-page">
    <div class="container">
      <div class="status-card">
        <p v-if="error" class="error">{{ error }}</p>
        <p v-else class="loading">Signing you in...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  padding: 6rem 0;
}

.status-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 3rem;
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  text-align: center;
}

.loading {
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.error {
  font-size: 1.1rem;
  color: var(--color-primary);
  font-weight: 700;
}
</style>
