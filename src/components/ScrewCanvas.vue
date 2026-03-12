<script setup lang="ts">
import { ref } from 'vue'
import { useScrewScene } from '@/composables/useScrewScene'

const canvasRef = ref<HTMLCanvasElement | null>(null)
useScrewScene(canvasRef)
</script>

<template>
  <div class="screw-canvas-container">
    <canvas ref="canvasRef" class="screw-canvas" />
  </div>
</template>

<style scoped>
.screw-canvas-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.screw-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
