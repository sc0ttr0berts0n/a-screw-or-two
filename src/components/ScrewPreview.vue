<script setup lang="ts">
import { computed } from 'vue'
import type { HeadType } from '@/types/product'

const props = defineProps<{
  headType: HeadType
  lengthMm: number
  showNut?: boolean
}>()

// Scale the shaft length proportionally (min 30, max 80)
const shaftHeight = computed(() => {
  const minLen = 4, maxLen = 50
  const minH = 30, maxH = 80
  const clamped = Math.min(Math.max(props.lengthMm, minLen), maxLen)
  return minH + ((clamped - minLen) / (maxLen - minLen)) * (maxH - minH)
})

const totalHeight = computed(() => {
  const headH = props.headType === 'flat' ? 14 : 20
  const nutH = props.showNut ? 20 : 0
  return headH + shaftHeight.value + 12 + nutH // 12 for thread tip
})
</script>

<template>
  <svg
    :viewBox="`0 0 80 ${totalHeight}`"
    class="screw-preview"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- PAN HEAD -->
    <g v-if="headType === 'pan'">
      <!-- Rounded dome head -->
      <path d="M 24 20 Q 24 8 40 8 Q 56 8 56 20 L 24 20 Z" fill="currentColor" />
      <!-- Cross drive -->
      <line x1="40" y1="11" x2="40" y2="18" stroke="var(--color-bg)" stroke-width="2" />
      <line x1="36" y1="14.5" x2="44" y2="14.5" stroke="var(--color-bg)" stroke-width="2" />
      <!-- Shaft -->
      <rect x="34" y="20" width="12" :height="shaftHeight" fill="currentColor" stroke="currentColor" />
      <!-- Thread lines -->
      <line v-for="i in Math.floor(shaftHeight / 6)" :key="i" :x1="34" :y1="20 + i * 6" :x2="46" :y2="20 + i * 6" stroke="var(--color-bg)" stroke-width="0.8" opacity="0.5" />
      <!-- Tip -->
      <polygon :points="`34,${20 + shaftHeight} 46,${20 + shaftHeight} 40,${20 + shaftHeight + 10}`" fill="currentColor" stroke="currentColor" />
    </g>

    <!-- HEX HEAD -->
    <g v-else-if="headType === 'hex'">
      <!-- Hexagonal head (flat top with angled sides) -->
      <polygon points="28,8 52,8 56,14 56,20 24,20 24,14" fill="currentColor" stroke="currentColor" />
      <!-- Hex facet lines -->
      <line x1="28" y1="8" x2="24" y2="14" stroke="var(--color-bg)" stroke-width="1" opacity="0.4" />
      <line x1="52" y1="8" x2="56" y2="14" stroke="var(--color-bg)" stroke-width="1" opacity="0.4" />
      <!-- Shaft -->
      <rect x="34" y="20" width="12" :height="shaftHeight" fill="currentColor" stroke="currentColor" />
      <!-- Thread lines -->
      <line v-for="i in Math.floor(shaftHeight / 6)" :key="i" :x1="34" :y1="20 + i * 6" :x2="46" :y2="20 + i * 6" stroke="var(--color-bg)" stroke-width="0.8" opacity="0.5" />
      <!-- Tip -->
      <polygon :points="`34,${20 + shaftHeight} 46,${20 + shaftHeight} 40,${20 + shaftHeight + 10}`" fill="currentColor" stroke="currentColor" />
    </g>

    <!-- FLAT / COUNTERSUNK HEAD -->
    <g v-else-if="headType === 'flat'">
      <!-- Flat countersunk head (tapers into shaft) -->
      <polygon points="22,6 58,6 46,14 34,14" fill="currentColor" stroke="currentColor" />
      <!-- Cross drive -->
      <line x1="40" y1="7" x2="40" y2="12" stroke="var(--color-bg)" stroke-width="2" />
      <line x1="37" y1="9.5" x2="43" y2="9.5" stroke="var(--color-bg)" stroke-width="2" />
      <!-- Shaft -->
      <rect x="34" y="14" width="12" :height="shaftHeight" fill="currentColor" stroke="currentColor" />
      <!-- Thread lines -->
      <line v-for="i in Math.floor(shaftHeight / 6)" :key="i" :x1="34" :y1="14 + i * 6" :x2="46" :y2="14 + i * 6" stroke="var(--color-bg)" stroke-width="0.8" opacity="0.5" />
      <!-- Tip -->
      <polygon :points="`34,${14 + shaftHeight} 46,${14 + shaftHeight} 40,${14 + shaftHeight + 10}`" fill="currentColor" stroke="currentColor" />
    </g>

    <!-- SOCKET CAP HEAD -->
    <g v-else-if="headType === 'socketCap'">
      <!-- Tall cylindrical head -->
      <rect x="28" y="4" width="24" height="16" rx="2" fill="currentColor" stroke="currentColor" />
      <!-- Hex socket -->
      <polygon points="36,8 38,7 42,7 44,8 44,12 42,13 38,13 36,12" fill="var(--color-bg)" stroke="var(--color-bg)" stroke-width="0.5" opacity="0.6" />
      <!-- Shaft -->
      <rect x="34" y="20" width="12" :height="shaftHeight" fill="currentColor" stroke="currentColor" />
      <!-- Thread lines -->
      <line v-for="i in Math.floor(shaftHeight / 6)" :key="i" :x1="34" :y1="20 + i * 6" :x2="46" :y2="20 + i * 6" stroke="var(--color-bg)" stroke-width="0.8" opacity="0.5" />
      <!-- Tip -->
      <polygon :points="`34,${20 + shaftHeight} 46,${20 + shaftHeight} 40,${20 + shaftHeight + 10}`" fill="currentColor" stroke="currentColor" />
    </g>

    <!-- NUT (shown below screw when type is 'both') -->
    <g v-if="showNut">
      <polygon
        :points="`24,${totalHeight - 16} 32,${totalHeight - 20} 48,${totalHeight - 20} 56,${totalHeight - 16} 56,${totalHeight - 8} 48,${totalHeight - 4} 32,${totalHeight - 4} 24,${totalHeight - 8}`"
        fill="currentColor"
        stroke="currentColor"
      />
      <!-- Hole -->
      <circle cx="40" :cy="totalHeight - 12" r="5" fill="var(--color-bg)" stroke="var(--color-bg)" stroke-width="1" />
    </g>
  </svg>
</template>

<style scoped>
.screw-preview {
  width: 60px;
  max-height: 140px;
  color: var(--color-text);
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}
</style>
