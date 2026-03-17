/** Supabase database types — mirrors the SQL schema */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      community_kits: {
        Row: CommunityKitRow
        Insert: CommunityKitInsert
        Update: Partial<CommunityKitInsert>
      }
      kit_items: {
        Row: KitItemRow
        Insert: KitItemInsert
        Update: Partial<KitItemInsert>
      }
    }
    Functions: {
      increment_kit_view: {
        Args: { kit_id: string }
        Returns: void
      }
      increment_kit_cart_add: {
        Args: { kit_id: string }
        Returns: void
      }
    }
  }
}

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface CommunityKitRow {
  id: string
  author_id: string
  slug: string
  title: string
  description: string | null
  project_url: string | null
  tags: string[]
  category: string | null
  status: 'draft' | 'published' | 'archived'
  version: number
  retail_total_cents: number | null
  item_count: number | null
  view_count: number
  cart_add_count: number
  created_at: string
  updated_at: string
  published_at: string | null
}

export type CommunityKitInsert = Omit<
  CommunityKitRow,
  'id' | 'version' | 'view_count' | 'cart_add_count' | 'created_at' | 'updated_at'
> & { version?: number }

export interface KitItemRow {
  id: string
  kit_id: string
  product_id: string
  product_spec: Record<string, unknown>
  quantity: number
  note: string | null
  sort_order: number
  unit_price_cents: number
}

export type KitItemInsert = Omit<KitItemRow, 'id'>
