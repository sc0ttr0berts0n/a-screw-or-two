import { useSanityQuery } from './useSanityQuery'
import type { SanityCategory } from '@/types/sanity'

const CATEGORIES_QUERY = `*[_type == "category"]{
  _id,
  name,
  "slug": slug.current,
  description,
  productType,
  sortOrder
} | order(sortOrder asc)`

export function useCategories() {
  return useSanityQuery<SanityCategory[]>(CATEGORIES_QUERY)
}
