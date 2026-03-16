import { ref, computed, readonly } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/supabase'

type AuthProvider = 'google' | 'github' | 'discord'

const user = ref<User | null>(null)
const profile = ref<Profile | null>(null)
const loading = ref(true)
const showAuthModal = ref(false)

// Initialize: restore session on first import
let initialized = false

async function init() {
  if (initialized) return
  initialized = true

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    if (user.value) {
      await fetchProfile()
    }
  } catch (err) {
    console.error('Auth init error:', err)
  } finally {
    loading.value = false
  }

  // Listen for auth state changes (login, logout, token refresh)
  supabase.auth.onAuthStateChange(async (event, session) => {
    user.value = session?.user ?? null
    if (session?.user) {
      await fetchProfile()
    } else {
      profile.value = null
    }
  })
}

async function fetchProfile() {
  if (!user.value) return
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (error) throw error
    profile.value = data
  } catch (err) {
    console.error('Failed to fetch profile:', err)
  }
}

async function signIn(provider: AuthProvider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
  user.value = null
  profile.value = null
}

async function updateProfile(updates: { username?: string; display_name?: string; bio?: string }) {
  if (!user.value) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.value.id)
    .select()
    .single()

  if (error) throw error
  profile.value = data
  return data
}

export function useAuth() {
  // Kick off init on first use
  init()

  return {
    user: readonly(user),
    profile: readonly(profile),
    loading: readonly(loading),
    isAuthenticated: computed(() => !!user.value),
    showAuthModal,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
  }
}
