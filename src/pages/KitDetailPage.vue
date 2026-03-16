<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/composables/useCart'
import { mapKitFromSupabase } from '@/types/kit'
import type { CommunityKit } from '@/types/kit'
import { formatPrice, describeProduct } from '@/types/product'

const props = defineProps<{ slug: string }>()

const cart = useCart()
const kit = ref<CommunityKit | null>(null)
const loading = ref(true)
const error = ref('')
const addedToCart = ref(false)
const isCommunityKit = ref(true)

// SEO meta tags
useHead({
  title: computed(() =>
    kit.value ? `${kit.value.title} | A Screw or Two` : 'Kit | A Screw or Two',
  ),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        kit.value
          ? `${kit.value.title} — ${kit.value.itemCount} fasteners, ${formatPrice(kit.value.retailTotalCents)}. ${kit.value.description || 'Community-curated project kit.'}`
          : '',
      ),
    },
    { property: 'og:title', content: computed(() => kit.value?.title || '') },
    {
      property: 'og:description',
      content: computed(() =>
        kit.value
          ? `${kit.value.itemCount} fasteners for ${formatPrice(kit.value.retailTotalCents)} — ${kit.value.description || 'Buy exactly what you need.'}`
          : '',
      ),
    },
    { property: 'og:type', content: 'product' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        kit.value
          ? JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: kit.value.title,
              description: kit.value.description,
              brand: { '@type': 'Brand', name: 'A Screw or Two' },
              offers: {
                '@type': 'AggregateOffer',
                priceCurrency: 'USD',
                lowPrice: (kit.value.retailTotalCents / 100).toFixed(2),
                offerCount: kit.value.items.length,
              },
            })
          : '{}',
      ),
    },
  ],
})

onMounted(async () => {
  try {
    // Try Supabase first (community kit)
    const { data: kitRow, error: kitError } = await supabase
      .from('community_kits')
      .select('*')
      .eq('slug', props.slug)
      .eq('status', 'published')
      .single()

    if (kitRow && !kitError) {
      // Load items
      const { data: items } = await supabase
        .from('kit_items')
        .select('*')
        .eq('kit_id', kitRow.id)
        .order('sort_order')

      // Load author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('id', kitRow.author_id)
        .single()

      if (profile) {
        kit.value = mapKitFromSupabase(kitRow, items || [], profile)
        isCommunityKit.value = true

        // Increment view count (fire-and-forget)
        supabase.rpc('increment_kit_view', { kit_id: kitRow.id })
      }
    }

    if (!kit.value) {
      error.value = 'Kit not found.'
    }
  } catch (err) {
    console.error('Kit load error:', err)
    error.value = "Couldn't load this kit. Please try again later."
  } finally {
    loading.value = false
  }
})

function addKitToCart() {
  if (!kit.value) return
  for (const item of kit.value.items) {
    cart.addItem(item.spec, item.quantity)
  }
  addedToCart.value = true

  // Increment cart add count
  if (kit.value.id) {
    supabase.rpc('increment_kit_cart_add', { kit_id: kit.value.id })
  }

  setTimeout(() => { addedToCart.value = false }, 3000)
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
}

function shareTwitter() {
  if (!kit.value) return
  const text = `Check out this ${kit.value.title} on A Screw or Two!`
  const url = window.location.href
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
}

function shareReddit() {
  if (!kit.value) return
  const url = window.location.href
  window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(kit.value.title)}`, '_blank')
}
</script>

<template>
  <div class="kit-detail-page">
    <div class="container">
      <div v-if="loading" class="status-msg">Loading kit...</div>

      <div v-else-if="error" class="status-msg error">
        <p class="error-icon">:(</p>
        <p class="error-text">{{ error }}</p>
        <router-link to="/kits" class="back-link">Browse all kits</router-link>
      </div>

      <template v-else-if="kit">
        <!-- Kit Header -->
        <div class="kit-header">
          <div class="kit-badges">
            <span class="badge community" v-if="isCommunityKit">Community Kit</span>
            <span class="badge official" v-else>Official Kit</span>
            <router-link
              v-if="kit.author?.username"
              :to="`/u/${kit.author.username}`"
              class="author-link"
            >
              by @{{ kit.author.username }}
            </router-link>
          </div>

          <h1 class="kit-title">{{ kit.title }}</h1>
          <p v-if="kit.description" class="kit-description">{{ kit.description }}</p>

          <div class="kit-tags" v-if="kit.tags.length">
            <span v-for="tag in kit.tags" :key="tag" class="kit-tag">{{ tag }}</span>
          </div>

          <a v-if="kit.projectUrl" :href="kit.projectUrl" target="_blank" rel="noopener noreferrer" class="project-link">
            View Project &rarr;
          </a>
        </div>

        <!-- BOM Table -->
        <div class="bom-section">
          <h2 class="bom-title">Bill of Materials</h2>
          <div class="bom-card">
            <table class="bom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in kit.items" :key="item.id">
                  <td class="bom-num">{{ index + 1 }}</td>
                  <td class="bom-product">
                    <span class="product-name">{{ describeProduct(item.spec) }}</span>
                    <span v-if="item.note" class="product-note">"{{ item.note }}"</span>
                  </td>
                  <td class="bom-qty">{{ item.quantity }}</td>
                  <td class="bom-price">{{ formatPrice(item.unitPriceCents) }}</td>
                  <td class="bom-total-cell">{{ formatPrice(item.unitPriceCents * item.quantity) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td class="foot-label">Total</td>
                  <td class="foot-qty">{{ kit.itemCount }}</td>
                  <td></td>
                  <td class="foot-total">{{ formatPrice(kit.retailTotalCents) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Add to Cart CTA -->
        <div class="cta-section">
          <button class="add-kit-btn" @click="addKitToCart" :disabled="addedToCart">
            {{ addedToCart ? 'Added to Cart!' : 'Add Entire Kit to Cart' }}
          </button>
          <p class="cta-price">{{ kit.items.length }} products · {{ formatPrice(kit.retailTotalCents) }} total</p>
        </div>

        <!-- Share -->
        <div class="share-section">
          <span class="share-label">Share:</span>
          <button class="share-btn" @click="copyLink">Copy Link</button>
          <button class="share-btn" @click="shareTwitter">Twitter</button>
          <button class="share-btn" @click="shareReddit">Reddit</button>
        </div>

        <div class="kit-footer-meta">
          <span>Created {{ new Date(kit.createdAt).toLocaleDateString() }}</span>
          <span v-if="kit.version > 1">· v{{ kit.version }}</span>
          <span>· {{ kit.viewCount.toLocaleString() }} views</span>
        </div>
      </template>
    </div>

    <Transition name="toast">
      <div v-if="addedToCart" class="cart-toast">
        Added {{ kit?.items.length }} products to cart!
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.kit-detail-page { padding: 4rem 0 6rem; }

.status-msg {
  padding: 3rem;
  background: var(--color-surface);
  border: var(--border-thick);
  text-align: center;
  color: var(--color-text-muted);
  box-shadow: var(--shadow-hard);
}
.status-msg.error { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.error-icon { font-size: 2.5rem; font-weight: 700; opacity: 0.4; }
.back-link { color: var(--color-primary); font-weight: 700; }

.kit-header { margin-bottom: 2.5rem; }
.kit-badges { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.badge { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border: 2px solid var(--color-text); }
.badge.community { background: var(--color-accent); color: white; }
.badge.official { background: var(--color-teal); color: var(--color-text); }
.author-link { font-size: 0.85rem; color: var(--color-text-muted); text-decoration: none; font-weight: 700; }
.author-link:hover { color: var(--color-primary); }

.kit-title { font-size: 2.5rem; margin-bottom: 0.75rem; line-height: 1.1; }
.kit-description { font-size: 1.1rem; margin-bottom: 1rem; max-width: 700px; }
.kit-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
.kit-tag { background: var(--color-secondary); border: 2px solid var(--color-text); padding: 0.15rem 0.6rem; font-size: 0.8rem; font-weight: 700; }
.project-link { display: inline-block; color: var(--color-primary); font-weight: 700; text-decoration: none; }
.project-link:hover { text-decoration: underline; }

.bom-section { margin-bottom: 2.5rem; }
.bom-title { font-size: 1.4rem; margin-bottom: 1rem; text-transform: uppercase; }
.bom-card { background: var(--color-surface); border: var(--border-thick); box-shadow: var(--shadow-hard-lg); overflow-x: auto; }
.bom-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
.bom-table th { text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.75rem 1rem; border-bottom: var(--border-thick); background: var(--color-bg); color: var(--color-text-muted); }
.bom-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e0e0e0; }
.bom-num { color: var(--color-text-muted); font-size: 0.8rem; width: 40px; }
.product-name { font-weight: 700; display: block; }
.product-note { font-size: 0.8rem; color: var(--color-text-muted); font-style: italic; display: block; margin-top: 0.15rem; }
.bom-qty { font-weight: 700; text-align: center; width: 60px; }
.bom-price { font-variant-numeric: tabular-nums; white-space: nowrap; }
.bom-total-cell { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bom-table tfoot td { border-bottom: none; border-top: var(--border-thick); padding-top: 1rem; font-weight: 700; }
.foot-label { text-align: right; text-transform: uppercase; font-size: 0.9rem; }
.foot-qty { text-align: center; color: var(--color-text-muted); font-size: 0.85rem; }
.foot-total { font-size: 1.3rem; }

.cta-section { text-align: center; margin-bottom: 2rem; }
.add-kit-btn {
  background: var(--color-primary); color: white; padding: 1rem 3rem; font-size: 1.2rem;
  font-weight: 700; font-family: var(--font-display); text-transform: uppercase;
  border: var(--border-thick); box-shadow: var(--shadow-hard-lg); cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}
.add-kit-btn:hover:not(:disabled) { transform: translate(-3px, -3px); box-shadow: 7px 7px 0 #000; }
.add-kit-btn:disabled { background: var(--color-teal); }
.cta-price { margin-top: 0.75rem; color: var(--color-text-muted); font-size: 0.95rem; }

.share-section { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.share-label { font-weight: 700; font-size: 0.85rem; text-transform: uppercase; }
.share-btn { padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 700; font-family: var(--font-body); background: var(--color-bg); border: 2px solid var(--color-text); cursor: pointer; transition: background var(--transition); }
.share-btn:hover { background: var(--color-secondary); }

.kit-footer-meta { font-size: 0.8rem; color: var(--color-text-muted); display: flex; gap: 0.25rem; }

.cart-toast {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 200;
  background: var(--color-secondary); color: var(--color-text); border: var(--border-thick);
  box-shadow: var(--shadow-hard); padding: 0.75rem 2rem; font-family: var(--font-display);
  font-weight: 700; font-size: 1rem; text-transform: uppercase; white-space: nowrap;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }

@media (max-width: 640px) {
  .kit-title { font-size: 1.8rem; }
  .add-kit-btn { width: 100%; padding: 1rem; }
  .share-section { flex-wrap: wrap; }
}
</style>
