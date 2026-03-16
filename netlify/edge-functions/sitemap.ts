// Netlify Edge Function — Dynamic Sitemap
// Generates /sitemap.xml from all published community kits + static pages.
// Google crawls this to discover and index kit pages.

import type { Context } from '@netlify/edge-functions'

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') || ''
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_ANON_KEY') || ''

interface KitSlug {
  slug: string
  updated_at: string
}

export default async function handler(request: Request, _context: Context) {
  const origin = new URL(request.url).origin

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/shop', priority: '0.9', changefreq: 'weekly' },
    { loc: '/kits', priority: '0.9', changefreq: 'daily' },
    { loc: '/cart', priority: '0.3', changefreq: 'monthly' },
  ]

  // Fetch all published kit slugs
  let kitSlugs: KitSlug[] = []
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/community_kits?status=eq.published&select=slug,updated_at&order=updated_at.desc`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        },
      )
      if (res.ok) {
        kitSlugs = await res.json()
      }
    } catch (err) {
      console.error('sitemap: failed to fetch kits', err)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  // Static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${origin}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  }

  // Kit pages
  for (const kit of kitSlugs) {
    const lastmod = kit.updated_at ? kit.updated_at.split('T')[0] : today
    xml += `
  <url>
    <loc>${origin}/kits/${kit.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  }

  xml += `
</urlset>`

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
