import { useSanityQuery } from './useSanityQuery'
import type { SanityKitDetail } from '@/types/sanity'

const KIT_QUERY = `*[_type == "kit" && slug.current == $slug][0]{
  _id,
  name,
  "slug": slug.current,
  sku,
  priceCents,
  description,
  longDescription,
  projectUrl,
  featured,
  tags,
  "imageUrl": image.asset->url,
  seoDescription,
  contents[]{
    quantity,
    note,
    "product": product->{
      _id,
      name,
      "slug": slug.current,
      sku,
      size,
      lengthMm,
      headType,
      finish,
      priceCents
    }
  }
}`

export function useKit(slug: string) {
  return useSanityQuery<SanityKitDetail>(KIT_QUERY, { slug })
}
