// Netlify Edge Function — Social Crawler OG Meta Proxy
// Intercepts bot requests to /kits/:slug and returns pre-rendered OG tags
// so Twitter, Discord, Slack, Facebook show rich preview cards.

import type { Context } from '@netlify/edge-functions'

const BOT_UA_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Discordbot|Slackbot|WhatsApp|TelegramBot|Applebot|Googlebot|bingbot|Baiduspider|DuckDuckBot|Embedly|Pinterest|vkShare|W3C_Validator|redditbot/i

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') || ''
const SUPABASE_ANON_KEY = Deno.env.get('VITE_SUPABASE_ANON_KEY') || ''

interface KitRow {
  slug: string
  title: string
  description: string | null
  item_count: number | null
  retail_total_cents: number | null
  tags: string[]
  author_id: string
}

interface ProfileRow {
  username: string
  display_name: string | null
}

function formatPrice(cents: number | null): string {
  if (!cents) return '$0.00'
  return `$${(cents / 100).toFixed(2)}`
}

export default async function handler(request: Request, context: Context) {
  const ua = request.headers.get('user-agent') || ''

  // Only intercept bot requests — let real users through to the SPA
  if (!BOT_UA_PATTERN.test(ua)) {
    return context.next()
  }

  // Extract slug from path: /kits/:slug
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)

  // Skip builder routes — /kits/new, /kits/:slug/edit
  if (segments.length < 2 || segments[1] === 'new') {
    return context.next()
  }
  if (segments.length >= 3 && segments[2] === 'edit') {
    return context.next()
  }

  const slug = segments[1]

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return context.next()
  }

  try {
    // Fetch kit from Supabase
    const kitRes = await fetch(
      `${SUPABASE_URL}/rest/v1/community_kits?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=slug,title,description,item_count,retail_total_cents,tags,author_id`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    )

    const kits = await kitRes.json()
    if (!kits || kits.length === 0) {
      return context.next()
    }

    const kit: KitRow = kits[0]

    // Fetch author profile
    let authorName = ''
    if (kit.author_id) {
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${kit.author_id}&select=username,display_name`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        },
      )
      const profiles = await profileRes.json()
      if (profiles && profiles.length > 0) {
        const profile: ProfileRow = profiles[0]
        authorName = profile.display_name || profile.username
      }
    }

    // Build meta description
    const priceStr = formatPrice(kit.retail_total_cents)
    const countStr = kit.item_count ? `${kit.item_count} fasteners` : 'Fastener kit'
    const desc = kit.description
      ? `${countStr} for ${priceStr}. ${kit.description}`
      : `${countStr} for ${priceStr}. Buy exactly what you need for your project.`
    const byLine = authorName ? ` by ${authorName}` : ''

    const ogTitle = `${kit.title} | A Screw or Two`
    const ogDesc = desc.slice(0, 200)
    const canonicalUrl = `${url.origin}/kits/${kit.slug}`

    // Return minimal HTML with OG tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(ogDesc)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(kit.title)}${escapeHtml(byLine)}" />
  <meta property="og:description" content="${escapeHtml(ogDesc)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:site_name" content="A Screw or Two" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(kit.title)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDesc)}" />

  <!-- JSON-LD -->
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: kit.title,
    description: kit.description || ogDesc,
    url: canonicalUrl,
    brand: { '@type': 'Brand', name: 'A Screw or Two' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: ((kit.retail_total_cents || 0) / 100).toFixed(2),
      offerCount: kit.item_count || 0,
    },
  })}
  </script>

  <link rel="canonical" href="${canonicalUrl}" />
</head>
<body>
  <h1>${escapeHtml(kit.title)}</h1>
  <p>${escapeHtml(ogDesc)}</p>
</body>
</html>`

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300, s-maxage=3600',
      },
    })
  } catch (err) {
    console.error('kit-meta-proxy error:', err)
    return context.next()
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
