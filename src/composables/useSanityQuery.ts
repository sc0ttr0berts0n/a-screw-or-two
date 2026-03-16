import { ref, onMounted } from 'vue'
import { sanityClient } from '@/lib/sanity'

export function useSanityQuery<T>(query: string, params: Record<string, unknown> = {}) {
  const data = ref<T | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      data.value = await sanityClient.fetch<T>(query, params)
    } catch (err) {
      error.value = "Couldn't load content right now. Please try again later."
      console.error('Sanity query error:', err)
    } finally {
      loading.value = false
    }
  })

  return { data, loading, error }
}
