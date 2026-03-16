import { createRouter, createWebHistory } from 'vue-router'

const HomePage = () => import('@/pages/HomePage.vue')
const ShopPage = () => import('@/pages/ShopPage.vue')
const ProductDetailPage = () => import('@/pages/ProductDetailPage.vue')
const KitsPage = () => import('@/pages/KitsPage.vue')
const KitDetailPage = () => import('@/pages/KitDetailPage.vue')
const KitBuilderPage = () => import('@/pages/KitBuilderPage.vue')
const MyKitsPage = () => import('@/pages/MyKitsPage.vue')
const ProfilePage = () => import('@/pages/ProfilePage.vue')
const CartPage = () => import('@/pages/CartPage.vue')
const CheckoutSuccessPage = () => import('@/pages/CheckoutSuccessPage.vue')
const CheckoutCancelPage = () => import('@/pages/CheckoutCancelPage.vue')
const AuthCallbackPage = () => import('@/pages/AuthCallbackPage.vue')
const ContentPage = () => import('@/pages/ContentPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/shop', name: 'shop', component: ShopPage },
    { path: '/shop/:slug', name: 'product', component: ProductDetailPage, props: true },
    { path: '/kits', name: 'kits', component: KitsPage },
    // Kit builder routes BEFORE :slug catch
    { path: '/kits/new', name: 'kit-builder', component: KitBuilderPage, meta: { requiresAuth: true } },
    { path: '/kits/:slug/edit', name: 'kit-edit', component: KitBuilderPage, props: true, meta: { requiresAuth: true } },
    { path: '/kits/:slug', name: 'kit', component: KitDetailPage, props: true },
    { path: '/my-kits', name: 'my-kits', component: MyKitsPage, meta: { requiresAuth: true } },
    { path: '/u/:username', name: 'profile', component: ProfilePage, props: true },
    { path: '/cart', name: 'cart', component: CartPage },
    { path: '/checkout/success', name: 'checkout-success', component: CheckoutSuccessPage },
    { path: '/checkout/cancel', name: 'checkout-cancel', component: CheckoutCancelPage },
    { path: '/auth/callback', name: 'auth-callback', component: AuthCallbackPage },
    { path: '/:slug', name: 'content', component: ContentPage, props: true },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// Auth navigation guard
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    // Dynamic import to avoid circular dependency
    const { useAuth } = await import('@/composables/useAuth')
    const auth = useAuth()

    // Wait for auth to initialize
    if (auth.loading.value) {
      await new Promise<void>((resolve) => {
        const unwatch = auth.loading
        const check = () => {
          if (!unwatch.value) resolve()
          else setTimeout(check, 50)
        }
        check()
      })
    }

    if (!auth.isAuthenticated.value) {
      // Store intended destination for after login
      sessionStorage.setItem('auth-redirect', to.fullPath)
      // Open auth modal instead of redirecting
      auth.showAuthModal.value = true
      return false
    }
  }
})

export default router
