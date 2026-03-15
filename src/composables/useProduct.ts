import { useSanityQuery } from './useSanityQuery'
import type { SanityProduct } from '@/types/sanity'

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0]{
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
  seoDescription,
  "imageUrl": image.asset->url
}`

export function useProduct(slug: string) {
  return useSanityQuery<SanityProduct>(PRODUCT_QUERY, { slug })
}
