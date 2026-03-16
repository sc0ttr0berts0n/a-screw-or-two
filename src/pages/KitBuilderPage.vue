<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useCart } from '@/composables/useCart'
import { supabase } from '@/lib/supabase'
import { KIT_CATEGORIES, slugify } from '@/types/kit'
import type { KitBuilderItem } from '@/types/kit'
import type { ProductSpec } from '@/types/product'
import {
  SCREW_SIZES,
  HEAD_TYPES,
  LENGTHS_BY_SIZE,
  type ScrewSize,
  type HeadType,
  getPrice,
  formatPrice,
  describeProduct,
} from '@/types/product'
import QuantityPicker from '@/components/QuantityPicker.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const cart = useCart()

// Kit metadata
const kitId = ref<string | null>(null)
const title = ref('')
const description = ref('')
const projectUrl = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const category = ref('3d-printer')

// Kit items (BOM)
const items = ref<KitBuilderItem[]>([])

// Product picker state
const showPicker = ref(false)
const pickerSize = ref<ScrewSize>('M3')
const pickerType = ref<'screw' | 'nut'>('screw')
const pickerHead = ref<HeadType>('socketCap')
const pickerLength = ref(10)
const pickerQty = ref(1)
const pickerNote = ref('')

// UI state
const saving = ref(false)
const publishing = ref(false)
const saveMessage = ref('')
const isEditing = computed(() => !!route.params.slug)

// Computed
const totalCents = computed(() =>
  items.value.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
)
const itemCount = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity, 0),
)
const availableLengths = computed(() => LENGTHS_BY_SIZE[pickerSize.value])

watch(pickerSize, () => {
  const lengths = LENGTHS_BY_SIZE[pickerSize.value]
  if (!lengths.includes(pickerLength.value)) {
    pickerLength.value = lengths[Math.floor(lengths.length / 2)]!
  }
})

// Load existing kit for editing
if (route.params.slug) {
  loadKit(route.params.slug as string)
}

async function loadKit(slug: string) {
  const { data: kit, error } = await supabase
    .from('community_kits')
    .select('*')
    .eq('slug', slug)
    .eq('author_id', auth.user.value?.id)
    .single()

  if (error || !kit) {
    router.replace('/my-kits')
    return
  }

  kitId.value = kit.id
  title.value = kit.title
  description.value = kit.description || ''
  projectUrl.value = kit.project_url || ''
  tags.value = kit.tags || []
  category.value = kit.category || '3d-printer'

  // Load items
  const { data: kitItems } = await supabase
    .from('kit_items')
    .select('*')
    .eq('kit_id', kit.id)
    .order('sort_order')

  if (kitItems) {
    items.value = kitItems.map((item) => ({
      id: item.product_id,
      spec: item.product_spec as unknown as ProductSpec,
      quantity: item.quantity,
      note: item.note || '',
      unitPriceCents: item.unit_price_cents,
    }))
  }
}

function makeId(spec: ProductSpec): string {
  if (spec.type === 'nut') return `nut-${spec.size}`
  return `screw-${spec.size}-${spec.headType}-${spec.lengthMm}`
}

function addItemFromPicker() {
  const spec: ProductSpec =
    pickerType.value === 'nut'
      ? { type: 'nut', size: pickerSize.value }
      : { type: 'screw', size: pickerSize.value, headType: pickerHead.value, lengthMm: pickerLength.value }

  const id = makeId(spec)
  const existing = items.value.find((i) => i.id === id)

  if (existing) {
    existing.quantity += pickerQty.value
    if (pickerNote.value && !existing.note) {
      existing.note = pickerNote.value
    }
  } else {
    items.value.push({
      id,
      spec,
      quantity: pickerQty.value,
      note: pickerNote.value,
      unitPriceCents: getPrice(spec),
    })
  }

  // Reset picker
  pickerQty.value = 1
  pickerNote.value = ''
  showPicker.value = false
}

function removeItem(id: string) {
  items.value = items.value.filter((i) => i.id !== id)
}

function importFromCart() {
  for (const cartItem of cart.items) {
    const id = cartItem.id
    const existing = items.value.find((i) => i.id === id)
    if (existing) {
      existing.quantity += cartItem.quantity
    } else {
      items.value.push({
        id,
        spec: cartItem.spec,
        quantity: cartItem.quantity,
        note: '',
        unitPriceCents: cartItem.unitPriceCents,
      })
    }
  }
}

function addTag() {
  const tag = tagInput.value.trim().toLowerCase()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
  }
  tagInput.value = ''
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}

async function saveKit(publish = false) {
  if (!auth.user.value) return
  if (!title.value.trim()) {
    saveMessage.value = 'Please enter a kit title.'
    return
  }
  if (items.value.length === 0) {
    saveMessage.value = 'Add at least one item to your kit.'
    return
  }

  const isSaving = publish ? publishing : saving
  isSaving.value = true
  saveMessage.value = ''

  try {
    const slug = kitId.value
      ? undefined // Don't change slug on update
      : slugify(title.value) + '-' + Date.now().toString(36)

    const kitData = {
      author_id: auth.user.value.id,
      slug: slug!,
      title: title.value.trim(),
      description: description.value.trim() || null,
      project_url: projectUrl.value.trim() || null,
      tags: tags.value,
      category: category.value,
      status: publish ? 'published' as const : 'draft' as const,
      retail_total_cents: totalCents.value,
      item_count: itemCount.value,
      published_at: publish ? new Date().toISOString() : null,
    }

    let savedKitId: string

    if (kitId.value) {
      // Update existing
      const { slug: _, ...updateData } = kitData
      const { error } = await supabase
        .from('community_kits')
        .update(updateData)
        .eq('id', kitId.value)
      if (error) throw error
      savedKitId = kitId.value
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('community_kits')
        .insert(kitData)
        .select('id, slug')
        .single()
      if (error) throw error
      savedKitId = data.id
      kitId.value = data.id
    }

    // Replace all items (delete + re-insert)
    await supabase.from('kit_items').delete().eq('kit_id', savedKitId)

    if (items.value.length > 0) {
      const itemRows = items.value.map((item, index) => ({
        kit_id: savedKitId,
        product_id: item.id,
        product_spec: item.spec as unknown as Record<string, unknown>,
        quantity: item.quantity,
        note: item.note || null,
        sort_order: index,
        unit_price_cents: item.unitPriceCents,
      }))

      const { error: itemsError } = await supabase.from('kit_items').insert(itemRows)
      if (itemsError) throw itemsError
    }

    if (publish) {
      // Redirect to the published kit page
      const { data: kit } = await supabase
        .from('community_kits')
        .select('slug')
        .eq('id', savedKitId)
        .single()
      if (kit) {
        router.push(`/kits/${kit.slug}`)
      }
    } else {
      saveMessage.value = 'Draft saved!'
      setTimeout(() => { saveMessage.value = '' }, 2000)
    }
  } catch (err) {
    console.error('Save error:', err)
    saveMessage.value = 'Failed to save. Please try again.'
  } finally {
    saving.value = false
    publishing.value = false
  }
}
</script>

<template>
  <div class="builder-page">
    <div class="container">
      <h1 class="page-title">{{ isEditing ? 'Edit Kit' : 'Create a Kit' }}</h1>
      <p class="page-subtitle">Build a shareable Bill of Materials for your maker project.</p>

      <div class="builder-grid">
        <!-- Left: Project Details -->
        <div class="builder-meta">
          <div class="meta-card">
            <h2 class="card-title">Project Details</h2>

            <div class="field">
              <label class="field-label">Kit Title *</label>
              <input v-model="title" type="text" class="field-input" placeholder="e.g. Voron 2.4 Complete Fastener Kit" />
            </div>

            <div class="field">
              <label class="field-label">Description</label>
              <textarea v-model="description" class="field-textarea" rows="3" placeholder="What project is this kit for? Any notes for builders?" />
            </div>

            <div class="field">
              <label class="field-label">Project URL</label>
              <input v-model="projectUrl" type="url" class="field-input" placeholder="https://vorondesign.com" />
            </div>

            <div class="field">
              <label class="field-label">Category</label>
              <select v-model="category" class="field-select">
                <option v-for="cat in KIT_CATEGORIES" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>

            <div class="field">
              <label class="field-label">Tags</label>
              <div class="tags-input">
                <span v-for="tag in tags" :key="tag" class="tag">
                  {{ tag }}
                  <button class="tag-remove" @click="removeTag(tag)">&times;</button>
                </span>
                <input
                  v-model="tagInput"
                  type="text"
                  class="tag-field"
                  placeholder="Add tag..."
                  @keydown.enter.prevent="addTag"
                />
              </div>
            </div>

            <button
              v-if="cart.items.length > 0"
              class="import-btn"
              @click="importFromCart"
            >
              Import {{ cart.itemCount.value }} item{{ cart.itemCount.value > 1 ? 's' : '' }} from Cart
            </button>
          </div>
        </div>

        <!-- Right: BOM Table -->
        <div class="builder-bom">
          <div class="bom-card">
            <div class="bom-header">
              <h2 class="card-title">Bill of Materials</h2>
              <button class="add-product-btn" @click="showPicker = true">+ Add Product</button>
            </div>

            <div v-if="items.length === 0" class="bom-empty">
              <p>No items yet. Click "Add Product" to start building your kit.</p>
            </div>

            <table v-else class="bom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in items" :key="item.id">
                  <td class="bom-num">{{ index + 1 }}</td>
                  <td class="bom-product">
                    <span class="bom-product-name">{{ describeProduct(item.spec) }}</span>
                    <input
                      v-model="item.note"
                      class="bom-note-input"
                      placeholder="Add a note..."
                    />
                  </td>
                  <td class="bom-qty">
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      class="qty-input"
                    />
                  </td>
                  <td class="bom-price">{{ formatPrice(item.unitPriceCents) }}</td>
                  <td class="bom-total">{{ formatPrice(item.unitPriceCents * item.quantity) }}</td>
                  <td class="bom-actions">
                    <button class="remove-btn" @click="removeItem(item.id)">&times;</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="bom-footer-label">Total</td>
                  <td class="bom-footer-count">{{ itemCount }}</td>
                  <td></td>
                  <td class="bom-footer-total">{{ formatPrice(totalCents) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="builder-footer">
        <p v-if="saveMessage" class="save-message" :class="{ error: saveMessage.includes('Failed') || saveMessage.includes('Please') }">
          {{ saveMessage }}
        </p>
        <div class="footer-actions">
          <button class="save-draft-btn" :disabled="saving" @click="saveKit(false)">
            {{ saving ? 'Saving...' : 'Save Draft' }}
          </button>
          <button class="publish-btn" :disabled="publishing" @click="saveKit(true)">
            {{ publishing ? 'Publishing...' : 'Publish Kit' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Product Picker Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPicker" class="modal-overlay" @click.self="showPicker = false">
          <div class="picker-card">
            <button class="modal-close" @click="showPicker = false">&times;</button>
            <h3 class="picker-title">Add Product to Kit</h3>

            <div class="picker-form">
              <div class="picker-group">
                <label class="picker-label">Type</label>
                <div class="picker-btns">
                  <button class="opt-btn" :class="{ active: pickerType === 'screw' }" @click="pickerType = 'screw'">Screw</button>
                  <button class="opt-btn" :class="{ active: pickerType === 'nut' }" @click="pickerType = 'nut'">Nut</button>
                </div>
              </div>

              <div class="picker-group">
                <label class="picker-label">Size</label>
                <div class="picker-btns">
                  <button v-for="size in SCREW_SIZES" :key="size" class="opt-btn" :class="{ active: pickerSize === size }" @click="pickerSize = size">{{ size }}</button>
                </div>
              </div>

              <div v-if="pickerType === 'screw'" class="picker-group">
                <label class="picker-label">Head Type</label>
                <div class="picker-btns">
                  <button v-for="head in HEAD_TYPES" :key="head.value" class="opt-btn" :class="{ active: pickerHead === head.value }" @click="pickerHead = head.value">{{ head.label }}</button>
                </div>
              </div>

              <div v-if="pickerType === 'screw'" class="picker-group">
                <label class="picker-label">Length</label>
                <div class="picker-btns">
                  <button v-for="len in availableLengths" :key="len" class="opt-btn" :class="{ active: pickerLength === len }" @click="pickerLength = len">{{ len }}mm</button>
                </div>
              </div>

              <div class="picker-group">
                <label class="picker-label">Quantity</label>
                <QuantityPicker v-model="pickerQty" />
              </div>

              <div class="picker-group">
                <label class="picker-label">Note (optional)</label>
                <input v-model="pickerNote" type="text" class="field-input" placeholder='e.g. "for the frame corners"' />
              </div>

              <div class="picker-footer">
                <span class="picker-price">{{ formatPrice(getPrice(pickerType === 'nut' ? { type: 'nut', size: pickerSize } : { type: 'screw', size: pickerSize, headType: pickerHead, lengthMm: pickerLength })) }} each</span>
                <button class="picker-add-btn" @click="addItemFromPicker">Add to Kit</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.builder-page {
  padding: 4rem 0 6rem;
}

.page-title {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  display: inline-block;
  background: var(--color-secondary);
  padding: 0.1em 0.3em;
  border: var(--border-thick);
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  margin-top: 0.75rem;
}

.builder-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  align-items: start;
}

.meta-card,
.bom-card {
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  padding: 1.5rem;
}

.card-title {
  font-size: 1.2rem;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
}

.field {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}

.field-input,
.field-textarea,
.field-select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  font-size: 0.95rem;
  font-family: var(--font-body);
  border: 2px solid var(--color-text);
  background: var(--color-bg);
  color: var(--color-text);
}

.field-textarea {
  resize: vertical;
}

.field-select {
  cursor: pointer;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.4rem;
  border: 2px solid var(--color-text);
  background: var(--color-bg);
  min-height: 42px;
  align-items: center;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--color-secondary);
  border: 2px solid var(--color-text);
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  color: var(--color-text);
}

.tag-field {
  border: none;
  background: none;
  font-size: 0.9rem;
  font-family: var(--font-body);
  outline: none;
  flex: 1;
  min-width: 80px;
  padding: 0.2rem;
}

.import-btn {
  width: 100%;
  padding: 0.7rem;
  background: var(--color-teal);
  color: var(--color-text);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  font-weight: 700;
  font-family: var(--font-display);
  font-size: 0.85rem;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: transform var(--transition), box-shadow var(--transition);
}

.import-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

/* BOM Table */
.bom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.bom-header .card-title {
  margin-bottom: 0;
}

.add-product-btn {
  background: var(--color-primary);
  color: white;
  border: 2px solid var(--color-text);
  padding: 0.4rem 1rem;
  font-weight: 700;
  font-size: 0.85rem;
  font-family: var(--font-display);
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 2px 2px 0 #000;
  transition: transform var(--transition), box-shadow var(--transition);
}

.add-product-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0 #000;
}

.bom-empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.bom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.bom-table th {
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0.4rem;
  border-bottom: var(--border-thick);
  color: var(--color-text-muted);
}

.bom-table td {
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid #ddd;
  vertical-align: top;
}

.bom-num {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  width: 30px;
}

.bom-product-name {
  font-weight: 700;
  display: block;
  margin-bottom: 0.25rem;
}

.bom-note-input {
  width: 100%;
  border: none;
  border-bottom: 1px dashed #ccc;
  background: none;
  font-size: 0.8rem;
  font-family: var(--font-body);
  color: var(--color-text-muted);
  padding: 0.15rem 0;
  font-style: italic;
}

.bom-note-input:focus {
  outline: none;
  border-bottom-color: var(--color-primary);
}

.qty-input {
  width: 50px;
  text-align: center;
  border: 2px solid var(--color-text);
  padding: 0.25rem;
  font-size: 0.9rem;
  font-family: var(--font-body);
  font-weight: 700;
}

.bom-price,
.bom-total {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.bom-total {
  font-weight: 700;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 0 0.25rem;
}

.remove-btn:hover {
  color: var(--color-primary);
}

.bom-table tfoot td {
  border-bottom: none;
  border-top: var(--border-thick);
  font-weight: 700;
  padding-top: 0.75rem;
}

.bom-footer-label {
  text-align: right;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.bom-footer-total {
  font-size: 1.1rem;
}

/* Footer */
.builder-footer {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.save-message {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-teal);
}

.save-message.error {
  color: var(--color-primary);
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.save-draft-btn,
.publish-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-display);
  text-transform: uppercase;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}

.save-draft-btn {
  background: var(--color-surface);
  color: var(--color-text);
}

.publish-btn {
  background: var(--color-primary);
  color: white;
}

.save-draft-btn:hover:not(:disabled),
.publish-btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

.save-draft-btn:disabled,
.publish-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Product Picker Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.picker-card {
  background: var(--color-surface);
  border: var(--border-thick);
  box-shadow: var(--shadow-hard-lg);
  padding: 2rem;
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  line-height: 1;
}

.picker-title {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.picker-group {
  margin-bottom: 1rem;
}

.picker-label {
  display: block;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.picker-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.opt-btn {
  background: var(--color-bg);
  color: var(--color-text);
  border: 2px solid var(--color-text);
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition);
}

.opt-btn:hover {
  background: var(--color-secondary);
}

.opt-btn.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 2px 2px 0 #000;
}

.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: var(--border-thick);
}

.picker-price {
  font-size: 1rem;
  color: var(--color-text-muted);
}

.picker-add-btn {
  background: var(--color-primary);
  color: white;
  border: var(--border-thick);
  box-shadow: var(--shadow-hard);
  padding: 0.7rem 1.5rem;
  font-weight: 700;
  font-family: var(--font-display);
  font-size: 0.95rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}

.picker-add-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-hard-lg);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .builder-grid {
    grid-template-columns: 1fr;
  }

  .builder-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-actions {
    flex-direction: column;
  }

  .save-draft-btn,
  .publish-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
