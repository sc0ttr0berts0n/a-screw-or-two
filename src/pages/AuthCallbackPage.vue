<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const error = ref('')

onMounted(() => {
  // Supabase PKCE flow: the client auto-exchanges the code via onAuthStateChange.
  // We just listen for the session to appear, then redirect.
  const timeout = setTimeout(() => {
    error.value = 'Authentication timed out. Please try again.'
    setTimeout(() => router.replace('/'), 2000)
  }, 10000)

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      clearTimeout(timeout)
      subscription.unsubscribe()

      // Check if user needs to set a username (redirect to profile setup)
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()

      if (profile?.username?.startsWith('user-')) {
        router.replace('/my-kits?setup=true')
        return
      }

      // Redirect to where they came from, or home
      const redirectTo = sessionStorage.getItem('auth-redirect') || '/'
      sessionStorage.removeItem('auth-redirect')
      router.replace(redirectTo)
    }
  })

  // Also check if already signed in (session restored from storage)
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      clearTimeout(timeout)
      subscription.unsubscribe()
      const redirectTo = sessionStorage.getItem('auth-redirect') || '/'
      sessionStorage.removeItem('auth-redirect')
      router.replace(redirectTo)
    }
  })
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
