export interface SanityProduct {
  _id: string
  name: string
  slug: string
  sku: string
  productType: 'screw' | 'nut' | 'washer' | 'insert' | 'standoff'
  size: string
  lengthMm?: number
  headType?: 'socketCap' | 'hex' | 'pan' | 'flat'
  finish: 'stainless' | 'blackOxide'
  material: 'steel' | 'nylon'
  priceCents: number
  description: string
  seoDescription?: string
  imageUrl?: string
}

export interface SanityKit {
  _id: string
  name: string
  slug: string
  sku: string
  priceCents: number
  description: string
  featured: boolean
  tags: string[]
  imageUrl?: string
  contentCount: number
}

export interface SanityKitContent {
  quantity: number
  note?: string
  product: {
    _id: string
    name: string
    slug: string
    sku: string
    size: string
    lengthMm?: number
    headType?: string
    finish: string
    priceCents: number
  }
}

export interface SanityKitDetail extends Omit<SanityKit, 'contentCount'> {
  longDescription?: unknown[] // Portable text blocks
  projectUrl?: string
  seoDescription?: string
  contents: SanityKitContent[]
}

export interface SanityCategory {
  _id: string
  name: string
  slug: string
  description: string
  productType: string
  sortOrder: number
}

export interface SanitySiteSettings {
  siteName: string
  tagline: string
  freeShippingThresholdCents: number
  flatShippingCents: number
  minimumOrderCents: number
  heroTitle: string
  heroSubtitle: string
  valueProps: {
    icon: string
    title: string
    description: string
  }[]
  seoTitle: string
  seoDescription: string
}
