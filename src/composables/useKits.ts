import { useSanityQuery } from './useSanityQuery'
import type { SanityKit } from '@/types/sanity'

const KITS_QUERY = `*[_type == "kit" && inStock == true]{
  _id,
  name,
  "slug": slug.current,
  sku,
  priceCents,
  description,
  featured,
  tags,
  "imageUrl": image.asset->url,
  "contentCount": count(contents)
} | order(featured desc)`

export function useKits() {
  return useSanityQuery<SanityKit[]>(KITS_QUERY)
}
