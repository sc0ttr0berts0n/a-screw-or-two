import { useSanityQuery } from './useSanityQuery'
import type { SanityProduct } from '@/types/sanity'

const PRODUCTS_QUERY = `*[_type == "product" && inStock == true]{
  _id,
  name,
  "slug": slug.current,
  sku,
  productType,
  size,
  lengthMm,
  headType,
  finish,
  material,
  priceCents,
  description,
  "imageUrl": image.asset->url
} | order(sortOrder asc)`

export function useProducts(filters?: {
  productType?: string
  size?: string
  finish?: string
}) {
  let query = PRODUCTS_QUERY

  if (filters?.productType) {
    query = query.replace(
      'inStock == true',
      `inStock == true && productType == "${filters.productType}"`,
    )
  }
  if (filters?.size) {
    query = query.replace('inStock == true', `inStock == true && size == "${filters.size}"`)
  }

  return useSanityQuery<SanityProduct[]>(query)
}
