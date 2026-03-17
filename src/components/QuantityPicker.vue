<script setup lang="ts">
const model = defineModel<number>({ default: 1 })

function decrement() {
  if (model.value > 1) model.value--
}

const props = withDefaults(defineProps<{ max?: number }>(), { max: 999 })

function increment() {
  if (model.value < props.max) model.value++
}

function onInput(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value)
  if (!isNaN(val)) {
    model.value = Math.max(1, Math.min(props.max, val))
  }
}
</script>

<template>
  <div class="quantity-picker">
    <button class="qty-btn" @click="decrement" :disabled="model <= 1">-</button>
    <input
      type="number"
      class="qty-input"
      :value="model"
      @input="onInput"
      min="1"
      :max="max"
    />
    <button class="qty-btn" @click="increment" :disabled="model >= max">+</button>
  </div>
</template>

<style scoped>
.quantity-picker {
  display: flex;
  align-items: center;
  gap: 0;
  border: var(--border-thick);
  overflow: hidden;
  width: fit-content;
}

.qty-btn {
  background: var(--color-secondary);
  color: var(--color-text);
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition);
}

.qty-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  height: 40px;
  text-align: center;
  background: var(--color-surface);
  color: var(--color-text);
  border: none;
  border-left: var(--border-thick);
  border-right: var(--border-thick);
  font-size: 1rem;
  font-weight: 700;
  -moz-appearance: textfield;
}

.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
