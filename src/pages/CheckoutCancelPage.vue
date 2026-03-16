<template>
  <div class="checkout-result">
    <div class="container">
      <div class="result-card">
        <h1>Order Cancelled</h1>
        <p>Your order was cancelled. No charges were made. Your cart items are still saved.</p>
        <router-link to="/cart" class="cart-link">Back to Cart</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-result {
  padding: 6rem 0;
}

.result-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  padding: 3rem 2rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.result-card h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.result-card p {
  color: var(--color-text-muted);
  font-size: 1.05rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cart-link {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: var(--radius);
  font-weight: 600;
  transition: background var(--transition);
}

.cart-link:hover {
  background: var(--color-primary-hover);
}
</style>
