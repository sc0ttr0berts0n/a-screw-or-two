import { useSanityQuery } from './useSanityQuery'
import type { SanitySiteSettings } from '@/types/sanity'

const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  siteName,
  tagline,
  freeShippingThresholdCents,
  flatShippingCents,
  minimumOrderCents,
  heroTitle,
  heroSubtitle,
  valueProps,
  seoTitle,
  seoDescription
}`

export function useSiteSettings() {
  return useSanityQuery<SanitySiteSettings>(SETTINGS_QUERY)
}
