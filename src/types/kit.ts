import type { ProductSpec } from './product'
import type { Profile, CommunityKitRow, KitItemRow } from './supabase'

/** A kit item as used in the frontend (typed ProductSpec instead of raw JSON) */
export interface KitItem {
  id: string // makeId(spec) output
  spec: ProductSpec
  quantity: number
  note: string
  unitPriceCents: number
  sortOrder: number
}

/** A full community kit with items and author, as displayed on the public page */
export interface CommunityKit {
  id: string
  slug: string
  title: string
  description: string
  projectUrl: string
  tags: string[]
  category: string
  status: 'draft' | 'published' | 'archived'
  version: number
  retailTotalCents: number
  itemCount: number
  viewCount: number
  cartAddCount: number
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  author: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
  items: KitItem[]
}

/** Kit card data for the browse grid (no items loaded) */
export interface CommunityKitCard {
  id: string
  slug: string
  title: string
  description: string
  tags: string[]
  category: string
  retailTotalCents: number
  itemCount: number
  viewCount: number
  cartAddCount: number
  publishedAt: string | null
  author: {
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
}

/** Form data for the kit builder */
export interface KitFormData {
  title: string
  description: string
  projectUrl: string
  tags: string[]
  category: string
}

/** Kit builder item (extends KitItem with mutable fields) */
export interface KitBuilderItem {
  id: string
  spec: ProductSpec
  quantity: number
  note: string
  unitPriceCents: number
}

/** Project categories for filtering */
export const KIT_CATEGORIES = [
  { value: '3d-printer', label: '3D Printer' },
  { value: 'cnc', label: 'CNC / Laser' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'drone', label: 'Drone / RC' },
  { value: 'woodworking', label: 'Woodworking' },
  { value: 'other', label: 'Other' },
] as const

/** Convert a Supabase kit row + items into a frontend CommunityKit */
export function mapKitFromSupabase(
  row: CommunityKitRow,
  items: KitItemRow[],
  profile: { id: string; username: string; display_name: string | null; avatar_url: string | null },
): CommunityKit {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    projectUrl: row.project_url || '',
    tags: row.tags || [],
    category: row.category || 'other',
    status: row.status,
    version: row.version,
    retailTotalCents: row.retail_total_cents || 0,
    itemCount: row.item_count || 0,
    viewCount: row.view_count,
    cartAddCount: row.cart_add_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    author: {
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
    },
    items: items
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.product_id,
        spec: item.product_spec as unknown as ProductSpec,
        quantity: item.quantity,
        note: item.note || '',
        unitPriceCents: item.unit_price_cents,
        sortOrder: item.sort_order,
      })),
  }
}

/** Generate a URL-safe slug from a title */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}
