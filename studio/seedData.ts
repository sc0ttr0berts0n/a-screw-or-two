/**
 * Seed script for populating Sanity with initial product data.
 *
 * Usage:
 *   npx tsx seedData.ts
 *
 * Reads config from .env file in this directory.
 */

import 'dotenv/config'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'YOUR_PROJECT_ID',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN, // needs write access
  apiVersion: '2024-01-01',
  useCdn: false,
})

// --- Product data definitions ---

type Size = 'M2' | 'M2.5' | 'M3' | 'M4' | 'M5'

const SIZES: Size[] = ['M2', 'M2.5', 'M3', 'M4', 'M5']

const LENGTHS_BY_SIZE: Record<Size, number[]> = {
  M2: [4, 5, 6, 8, 10],
  'M2.5': [4, 5, 6, 8, 10, 12],
  M3: [5, 6, 8, 10, 12, 16, 20],
  M4: [6, 8, 10, 12, 16, 20, 25],
  M5: [8, 10, 12, 16, 20, 25, 30],
}

const SCREW_PRICES: Record<Size, number> = {
  M2: 15,
  'M2.5': 18,
  M3: 18,
  M4: 20,
  M5: 25,
}

const NUT_PRICES: Record<Size, number> = {
  M2: 10,
  'M2.5': 12,
  M3: 12,
  M4: 14,
  M5: 16,
}

const WASHER_PRICES: Record<Size, number> = {
  M2: 8,
  'M2.5': 10,
  M3: 10,
  M4: 12,
  M5: 14,
}

const INSERT_PRICES: Record<Size, number> = {
  M2: 25,
  'M2.5': 28,
  M3: 30,
  M4: 35,
  M5: 40,
}

const HEAD_TYPES = ['socketCap', 'hex', 'pan', 'flat'] as const
const FINISHES = ['stainless', 'blackOxide'] as const

const HEAD_LABELS: Record<string, string> = {
  socketCap: 'Socket Head Cap',
  hex: 'Hex',
  pan: 'Pan Head',
  flat: 'Flat Head',
}

const FINISH_LABELS: Record<string, string> = {
  stainless: 'Stainless Steel',
  blackOxide: 'Black Oxide',
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface ProductDoc {
  _type: 'product'
  _id: string
  name: string
  slug: { _type: 'slug'; current: string }
  sku: string
  productType: string
  size: string
  lengthMm?: number
  headType?: string
  finish: string
  material: string
  priceCents: number
  costCents: number
  inStock: boolean
  description: string
  sortOrder: number
}

function generateProducts(): ProductDoc[] {
  const products: ProductDoc[] = []
  let sortOrder = 0

  // Socket Head Cap Screws (primary product) - all sizes, lengths, finishes
  for (const size of SIZES) {
    for (const length of LENGTHS_BY_SIZE[size]) {
      for (const finish of FINISHES) {
        const name = `${size}x${length}mm ${HEAD_LABELS.socketCap} Screw - ${FINISH_LABELS[finish]}`
        const sku = `SHCS-${size}-${length}-${finish === 'stainless' ? 'SS' : 'BO'}`
        const slug = slugify(name)

        products.push({
          _type: 'product',
          _id: `product-${sku}`,
          name,
          slug: { _type: 'slug', current: slug },
          sku,
          productType: 'screw',
          size,
          lengthMm: length,
          headType: 'socketCap',
          finish,
          material: 'steel',
          priceCents: SCREW_PRICES[size],
          costCents: Math.round(SCREW_PRICES[size] / 8),
          inStock: true,
          description: `${size}x${length}mm socket head cap screw in ${FINISH_LABELS[finish].toLowerCase()}. Perfect for 3D printer builds, CNC frames, and maker projects.`,
          sortOrder: sortOrder++,
        })
      }
    }
  }

  // Other head types - stainless only, common lengths
  const commonLengths: Record<Size, number[]> = {
    M2: [6, 8, 10],
    'M2.5': [6, 8, 10],
    M3: [8, 10, 12, 16],
    M4: [10, 12, 16, 20],
    M5: [12, 16, 20, 25],
  }

  for (const headType of ['hex', 'pan', 'flat'] as const) {
    for (const size of SIZES) {
      for (const length of commonLengths[size]) {
        const name = `${size}x${length}mm ${HEAD_LABELS[headType]} Screw - Stainless Steel`
        const prefix = headType === 'hex' ? 'HEX' : headType === 'pan' ? 'PAN' : 'FLT'
        const sku = `${prefix}-${size}-${length}-SS`
        const slug = slugify(name)

        products.push({
          _type: 'product',
          _id: `product-${sku}`,
          name,
          slug: { _type: 'slug', current: slug },
          sku,
          productType: 'screw',
          size,
          lengthMm: length,
          headType,
          finish: 'stainless',
          material: 'steel',
          priceCents: SCREW_PRICES[size],
          costCents: Math.round(SCREW_PRICES[size] / 8),
          inStock: true,
          description: `${size}x${length}mm ${HEAD_LABELS[headType].toLowerCase()} screw in stainless steel.`,
          sortOrder: sortOrder++,
        })
      }
    }
  }

  // Hex Nuts - standard and nyloc, both finishes
  for (const size of SIZES) {
    for (const finish of FINISHES) {
      // Standard hex nut
      const stdName = `${size} Hex Nut - ${FINISH_LABELS[finish]}`
      const stdSku = `NUT-${size}-STD-${finish === 'stainless' ? 'SS' : 'BO'}`
      products.push({
        _type: 'product',
        _id: `product-${stdSku}`,
        name: stdName,
        slug: { _type: 'slug', current: slugify(stdName) },
        sku: stdSku,
        productType: 'nut',
        size,
        finish,
        material: 'steel',
        priceCents: NUT_PRICES[size],
        costCents: Math.round(NUT_PRICES[size] / 10),
        inStock: true,
        description: `${size} standard hex nut in ${FINISH_LABELS[finish].toLowerCase()}. Pairs with ${size} screws.`,
        sortOrder: sortOrder++,
      })

      // Nyloc nut
      const nylName = `${size} Nyloc Nut - ${FINISH_LABELS[finish]}`
      const nylSku = `NUT-${size}-NYL-${finish === 'stainless' ? 'SS' : 'BO'}`
      products.push({
        _type: 'product',
        _id: `product-${nylSku}`,
        name: nylName,
        slug: { _type: 'slug', current: slugify(nylName) },
        sku: nylSku,
        productType: 'nut',
        size,
        finish,
        material: 'steel',
        priceCents: NUT_PRICES[size] + 3,
        costCents: Math.round(NUT_PRICES[size] / 8),
        inStock: true,
        description: `${size} nylon-insert lock nut (nyloc) in ${FINISH_LABELS[finish].toLowerCase()}. Resists vibration loosening.`,
        sortOrder: sortOrder++,
      })
    }
  }

  // Washers - flat and split lock
  for (const size of SIZES) {
    for (const finish of FINISHES) {
      // Flat washer
      const flatName = `${size} Flat Washer - ${FINISH_LABELS[finish]}`
      const flatSku = `WSH-${size}-FLT-${finish === 'stainless' ? 'SS' : 'BO'}`
      products.push({
        _type: 'product',
        _id: `product-${flatSku}`,
        name: flatName,
        slug: { _type: 'slug', current: slugify(flatName) },
        sku: flatSku,
        productType: 'washer',
        size,
        finish,
        material: 'steel',
        priceCents: WASHER_PRICES[size],
        costCents: Math.round(WASHER_PRICES[size] / 12),
        inStock: true,
        description: `${size} flat washer in ${FINISH_LABELS[finish].toLowerCase()}. Distributes load and protects surfaces.`,
        sortOrder: sortOrder++,
      })

      // Split lock washer
      const lockName = `${size} Split Lock Washer - ${FINISH_LABELS[finish]}`
      const lockSku = `WSH-${size}-LCK-${finish === 'stainless' ? 'SS' : 'BO'}`
      products.push({
        _type: 'product',
        _id: `product-${lockSku}`,
        name: lockName,
        slug: { _type: 'slug', current: slugify(lockName) },
        sku: lockSku,
        productType: 'washer',
        size,
        finish,
        material: 'steel',
        priceCents: WASHER_PRICES[size] + 2,
        costCents: Math.round(WASHER_PRICES[size] / 10),
        inStock: true,
        description: `${size} split lock washer in ${FINISH_LABELS[finish].toLowerCase()}. Provides spring tension to resist loosening.`,
        sortOrder: sortOrder++,
      })
    }
  }

  // Heat-set threaded inserts
  for (const size of SIZES) {
    const name = `${size} Heat-Set Threaded Insert`
    const sku = `INS-${size}-HS`
    products.push({
      _type: 'product',
      _id: `product-${sku}`,
      name,
      slug: { _type: 'slug', current: slugify(name) },
      sku,
      productType: 'insert',
      size,
      finish: 'stainless',
      material: 'steel',
      priceCents: INSERT_PRICES[size],
      costCents: Math.round(INSERT_PRICES[size] / 6),
      inStock: true,
      description: `${size} brass heat-set threaded insert for 3D printed parts. Press in with a soldering iron for strong, reusable threads in PLA, PETG, and ABS.`,
      sortOrder: sortOrder++,
    })
  }

  // Nylon standoffs - M2.5 and M3 only
  for (const size of ['M2.5', 'M3'] as Size[]) {
    for (const length of [6, 8, 10, 12, 15, 20]) {
      const name = `${size}x${length}mm Nylon Standoff`
      const sku = `STD-${size}-${length}-NYL`
      products.push({
        _type: 'product',
        _id: `product-${sku}`,
        name,
        slug: { _type: 'slug', current: slugify(name) },
        sku,
        productType: 'standoff',
        size,
        lengthMm: length,
        finish: 'stainless', // N/A but required field
        material: 'nylon',
        priceCents: 12 + Math.round(length / 3),
        costCents: 3,
        inStock: true,
        description: `${size}x${length}mm nylon hex standoff. Ideal for mounting PCBs, Raspberry Pi, and electronics with electrical isolation.`,
        sortOrder: sortOrder++,
      })
    }
  }

  // Nylon screws - M2.5 and M3 only
  for (const size of ['M2.5', 'M3'] as Size[]) {
    for (const length of [6, 8, 10, 12]) {
      const name = `${size}x${length}mm Nylon Pan Head Screw`
      const sku = `NYL-${size}-${length}-PAN`
      products.push({
        _type: 'product',
        _id: `product-${sku}`,
        name,
        slug: { _type: 'slug', current: slugify(name) },
        sku,
        productType: 'screw',
        size,
        lengthMm: length,
        headType: 'pan',
        finish: 'stainless', // N/A but required field
        material: 'nylon',
        priceCents: 10,
        costCents: 2,
        inStock: true,
        description: `${size}x${length}mm nylon pan head screw. Non-conductive, lightweight, and won't scratch surfaces.`,
        sortOrder: sortOrder++,
      })
    }
  }

  return products
}

// --- Category data ---

const categories = [
  {
    _type: 'category' as const,
    _id: 'category-screws',
    name: 'Socket Head Cap Screws',
    slug: { _type: 'slug' as const, current: 'socket-head-cap-screws' },
    productType: 'screw',
    description: 'Metric socket head cap screws in stainless steel and black oxide.',
    sortOrder: 0,
  },
  {
    _type: 'category' as const,
    _id: 'category-nuts',
    name: 'Hex Nuts',
    slug: { _type: 'slug' as const, current: 'hex-nuts' },
    productType: 'nut',
    description: 'Standard and nyloc hex nuts for all metric sizes.',
    sortOrder: 1,
  },
  {
    _type: 'category' as const,
    _id: 'category-washers',
    name: 'Washers',
    slug: { _type: 'slug' as const, current: 'washers' },
    productType: 'washer',
    description: 'Flat and split lock washers.',
    sortOrder: 2,
  },
  {
    _type: 'category' as const,
    _id: 'category-inserts',
    name: 'Heat-Set Inserts',
    slug: { _type: 'slug' as const, current: 'heat-set-inserts' },
    productType: 'insert',
    description: 'Brass threaded inserts for 3D printed parts.',
    sortOrder: 3,
  },
  {
    _type: 'category' as const,
    _id: 'category-standoffs',
    name: 'Standoffs & Nylon',
    slug: { _type: 'slug' as const, current: 'standoffs-nylon' },
    productType: 'standoff',
    description: 'Nylon standoffs and screws for electronics mounting.',
    sortOrder: 4,
  },
]

// --- Kit data ---

const kits = [
  {
    _type: 'kit' as const,
    _id: 'kit-voron-24',
    name: 'Voron 2.4 Fastener Kit',
    slug: { _type: 'slug' as const, current: 'voron-24-fastener-kit' },
    sku: 'KIT-VORON24',
    priceCents: 3999,
    costCents: 1000,
    description:
      'Complete fastener kit for building a Voron 2.4 3D printer. Every screw, nut, and insert you need in one package.',
    tags: ['3d-printing', 'voron'],
    featured: true,
    inStock: true,
    seoDescription:
      'All the metric fasteners you need for a Voron 2.4 build. Socket head cap screws, heat-set inserts, hex nuts, and more.',
  },
  {
    _type: 'kit' as const,
    _id: 'kit-fpv-5inch',
    name: 'FPV 5-inch Quad Hardware Kit',
    slug: { _type: 'slug' as const, current: 'fpv-5inch-quad-hardware-kit' },
    sku: 'KIT-FPV5',
    priceCents: 1299,
    costCents: 300,
    description:
      'Replacement hardware kit for 5-inch FPV quadcopters. M2 and M3 screws for frames, stacks, and motors.',
    tags: ['fpv', 'drones'],
    featured: true,
    inStock: true,
    seoDescription:
      'Replacement screws and hardware for 5-inch FPV drones. M2 and M3 socket head cap screws in multiple lengths.',
  },
  {
    _type: 'kit' as const,
    _id: 'kit-rpi-mount',
    name: 'Raspberry Pi Mounting Kit',
    slug: { _type: 'slug' as const, current: 'raspberry-pi-mounting-kit' },
    sku: 'KIT-RPI',
    priceCents: 499,
    costCents: 40,
    description:
      'Everything you need to mount a Raspberry Pi: M2.5 nylon standoffs, screws, and nuts.',
    tags: ['electronics', 'raspberry-pi'],
    featured: true,
    inStock: true,
    seoDescription:
      'Nylon M2.5 standoff kit for mounting Raspberry Pi boards. Includes standoffs, screws, and nuts.',
  },
]

// --- Main seed function ---

async function seed() {
  const products = generateProducts()

  console.log(`Generated ${products.length} products`)
  console.log(`Seeding ${categories.length} categories`)
  console.log(`Seeding ${kits.length} kits`)

  const transaction = client.transaction()

  // Create or replace all products
  for (const product of products) {
    transaction.createOrReplace(product)
  }

  // Create or replace categories
  for (const cat of categories) {
    transaction.createOrReplace(cat)
  }

  // Create or replace kits (without contents references for now - add via Studio)
  for (const kit of kits) {
    transaction.createOrReplace(kit)
  }

  // Create site settings singleton
  transaction.createOrReplace({
    _type: 'siteSettings',
    _id: 'siteSettings',
    siteName: 'A Screw or Two',
    tagline: 'Hobby-friendly fasteners, sold individually.',
    freeShippingThresholdCents: 3500,
    flatShippingCents: 450,
    minimumOrderCents: 800,
    heroTitle: "Need just one screw? We've got you.",
    heroSubtitle:
      'Individual metric fasteners for makers, hobbyists, and builders. No more buying 100 when you need 4.',
    valueProps: [
      {
        _key: 'v1',
        icon: '1️⃣',
        title: 'Buy Just One',
        description: 'No bulk packs. Buy exactly the quantity you need, from 1 to 100.',
      },
      {
        _key: 'v2',
        icon: '📏',
        title: 'Every Metric Size',
        description:
          'M2 through M5 socket head cap screws, nuts, washers, and heat-set inserts.',
      },
      {
        _key: 'v3',
        icon: '💰',
        title: 'Hobby-Friendly Prices',
        description: 'Starting at $0.10 per piece. Free shipping on orders over $35.',
      },
    ],
    seoTitle: 'A Screw or Two - Individual Metric Fasteners for Makers',
    seoDescription:
      'Buy individual metric screws, nuts, washers, and heat-set inserts. No bulk packs, no waste. Perfect for 3D printing, FPV drones, and electronics projects.',
  })

  console.log('Committing transaction...')
  const result = await transaction.commit()
  console.log(`Done! Created/replaced ${result.results.length} documents.`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
