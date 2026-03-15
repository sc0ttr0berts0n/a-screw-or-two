import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import type { SanityProduct } from '@/types/sanity'

function makeProduct(overrides: Partial<SanityProduct> = {}): SanityProduct {
  return {
    _id: 'prod-1',
    name: 'M3x10mm Flat Head Screw - Stainless Steel',
    slug: 'm3x10mm-flat-head-stainless',
    sku: 'FLT-M3-10-SS',
    productType: 'screw',
    size: 'M3',
    lengthMm: 10,
    headType: 'flat',
    finish: 'stainless',
    material: 'steel',
    priceCents: 18,
    description: 'A fine screw',
    ...overrides,
  }
}

function mountCard(product: SanityProduct) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/shop/:slug', component: { template: '<div/>' } }],
  })
  return mount(ProductCard, {
    props: { product },
    global: { plugins: [router] },
  })
}

describe('ProductCard', () => {
  it('renders product name', () => {
    const wrapper = mountCard(makeProduct())
    expect(wrapper.text()).toContain('M3x10mm Flat Head Screw')
  })

  it('renders SKU and finish', () => {
    const wrapper = mountCard(makeProduct())
    expect(wrapper.text()).toContain('FLT-M3-10-SS')
    expect(wrapper.text()).toContain('Stainless')
  })

  it('renders black oxide finish label', () => {
    const wrapper = mountCard(makeProduct({ finish: 'blackOxide' }))
    expect(wrapper.text()).toContain('Black Oxide')
  })

  it('renders price', () => {
    const wrapper = mountCard(makeProduct({ priceCents: 25 }))
    expect(wrapper.text()).toContain('$0.25 each')
  })

  it('links to product detail page', () => {
    const wrapper = mountCard(makeProduct())
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/shop/m3x10mm-flat-head-stainless')
  })

  it('shows size placeholder when no image', () => {
    const wrapper = mountCard(makeProduct({ imageUrl: undefined }))
    expect(wrapper.find('.placeholder-icon').text()).toBe('M3')
  })

  it('shows image when imageUrl provided', () => {
    const wrapper = mountCard(makeProduct({ imageUrl: 'https://cdn.example.com/img.jpg' }))
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://cdn.example.com/img.jpg')
  })
})
