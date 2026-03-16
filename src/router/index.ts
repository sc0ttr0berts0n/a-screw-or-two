import { createRouter, createWebHistory } from 'vue-router'

const HomePage = () => import('@/pages/HomePage.vue')
const ShopPage = () => import('@/pages/ShopPage.vue')
const ProductDetailPage = () => import('@/pages/ProductDetailPage.vue')
const KitsPage = () => import('@/pages/KitsPage.vue')
const KitDetailPage = () => import('@/pages/KitDetailPage.vue')
const CartPage = () => import('@/pages/CartPage.vue')
const CheckoutSuccessPage = () => import('@/pages/CheckoutSuccessPage.vue')
const CheckoutCancelPage = () => import('@/pages/CheckoutCancelPage.vue')
const ContentPage = () => import('@/pages/ContentPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/shop', name: 'shop', component: ShopPage },
    { path: '/shop/:slug', name: 'product', component: ProductDetailPage, props: true },
    { path: '/kits', name: 'kits', component: KitsPage },
    { path: '/kits/:slug', name: 'kit', component: KitDetailPage, props: true },
    { path: '/cart', name: 'cart', component: CartPage },
    { path: '/checkout/success', name: 'checkout-success', component: CheckoutSuccessPage },
    { path: '/checkout/cancel', name: 'checkout-cancel', component: CheckoutCancelPage },
    { path: '/:slug', name: 'content', component: ContentPage, props: true },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
