import { createApp } from 'vue'

/**
 * Helper to test composables that use lifecycle hooks (onMounted etc).
 * Mounts a temporary app so that the composable's hooks fire.
 */
export function withSetup<T>(composable: () => T): [T, ReturnType<typeof createApp>] {
  let result!: T
  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    },
  })
  app.mount(document.createElement('div'))
  return [result, app]
}
