<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()
const signingIn = ref(false)
const error = ref('')

async function handleSignIn(provider: 'google' | 'github' | 'discord') {
  signingIn.value = true
  error.value = ''
  try {
    await auth.signIn(provider)
  } catch (err) {
    error.value = 'Sign in failed. Please try again.'
    signingIn.value = false
  }
}

function close() {
  auth.showAuthModal.value = false
  error.value = ''
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="auth.showAuthModal.value" class="modal-overlay" @click.self="close">
        <div class="modal-card">
          <button class="modal-close" @click="close" aria-label="Close">&times;</button>

          <h2 class="modal-title">Sign In</h2>
          <p class="modal-subtitle">Create and share project kits with the maker community.</p>

          <div class="auth-buttons">
            <button class="auth-btn github" :disabled="signingIn" @click="handleSignIn('github')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>

            <button class="auth-btn google" :disabled="signingIn" @click="handleSignIn('google')">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button class="auth-btn discord" :disabled="signingIn" @click="handleSignIn('discord')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </button>
          </div>

          <p v-if="error" class="auth-error">{{ error }}</p>

          <p class="auth-note">
            Sign in to create shareable project kits. No spam, ever.
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard-lg);
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--color-text);
  line-height: 1;
}

.modal-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.modal-subtitle {
  color: var(--color-text-muted);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.85rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-body);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}

.auth-btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-btn.github {
  background: #24292e;
  color: white;
}

.auth-btn.google {
  background: white;
  color: #333;
}

.auth-btn.discord {
  background: #5865f2;
  color: white;
}

.auth-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #ffe0e0;
  border: 2px solid #ff4444;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
}

.auth-note {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
