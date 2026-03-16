import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { withSetup } from './test-utils'

const mockFetch = vi.fn()

vi.mock('@/lib/sanity', () => ({
  sanityClient: {
    fetch: (...args: unknown[]) => mockFetch(...args),
  },
}))

const { useSanityQuery } = await import('@/composables/useSanityQuery')

describe('useSanityQuery', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('starts with loading=true and data=null', () => {
    mockFetch.mockResolvedValue([])
    const [result] = withSetup(() => useSanityQuery('*[_type == "product"]'))

    expect(result.loading.value).toBe(true)
    expect(result.data.value).toBeNull()
    expect(result.error.value).toBeNull()
  })

  it('fetches data on mount', async () => {
    const products = [{ _id: '1', name: 'M3 Screw' }]
    mockFetch.mockResolvedValue(products)

    const [result] = withSetup(() => useSanityQuery('*[_type == "product"]'))
    await flushPromises()

    expect(result.data.value).toEqual(products)
    expect(result.loading.value).toBe(false)
    expect(result.error.value).toBeNull()
  })

  it('passes params to sanity client', async () => {
    mockFetch.mockResolvedValue({ _id: '1' })

    withSetup(() => useSanityQuery('*[slug.current == $slug][0]', { slug: 'test' }))
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledWith('*[slug.current == $slug][0]', { slug: 'test' })
  })

  it('sets error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const [result] = withSetup(() => useSanityQuery('*'))
    await flushPromises()

    expect(result.error.value).toBe('Network error')
    expect(result.loading.value).toBe(false)
    expect(result.data.value).toBeNull()
  })

  it('sets generic error for non-Error throws', async () => {
    mockFetch.mockRejectedValue('something went wrong')

    const [result] = withSetup(() => useSanityQuery('*'))
    await flushPromises()

    expect(result.error.value).toBe('Failed to fetch data')
  })
})
