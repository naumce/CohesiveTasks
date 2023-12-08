import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authorization'
import { useCustomizerStore } from '@/stores/customizer'
import { useCookies } from 'vue3-cookies'
import { navigationGuard } from './navigation-guard'
import PrivateRoutes from './private-routes'
import PrivateLayout from '@/layouts/PrivateLayout.vue'

import decode from 'jwt-decode'

const routes = [
  {
    path: '/',
    name: 'signin',
    component: () => import('@/components/SignIn.vue')
  },
  {
    path: '/',
    component: PrivateLayout,
    children: PrivateRoutes,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/token',
    name: 'token',
    redirect: (to: any) => {
      const { cookies } = useCookies()
      const actualToken = cookies.get('_token');
      const token = to.query.token
      const refresh = to.query.refresh
      cookies.set('_token', token,undefined,'/')
      cookies.set('_refresh', refresh)
      const decodedToken: any = decode(token)
      const authStore = useAuthStore()

      const user = {
        firstName: decodedToken.first_name,
        lastName: decodedToken.last_name,
        fullName: decodedToken.name,
        email:decodedToken.sub
      }
      
      authStore.setUser(user)
      authStore.setIsAuth(true)


      // const redirectPath = authStore.redirectPath || { name: 'tenants', query: {} }
      const redirectPath = { name: 'tenants', query: {} }
      // return redirectPath
      return { ...redirectPath, query: undefined, replace: true }
    }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/views/UnauthorizedPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.name === 'token') {
    next()
    return
  }
  const authStore = useAuthStore()
  const { cookies } = useCookies()

  const token = cookies.get('_token')

  if (!token) {
    authStore.setIsAuth(false)
  }
  // if route requires auth and user not logged
  if (to.matched.some((record) => record.meta.requiresAuth) && !authStore.isAuth) {
    // add redirectPath to authorization store and go to login page
    // after logging in user will be redirected to redirectPath
    authStore.setRedirectPath(to)
    next({ name: 'signin' })
    return
  }
  const toRouteName = to.name as string
  const guard = navigationGuard[toRouteName]
  const { getUserPermissions, setCurrentRouteName } = useCustomizerStore()
  const userPermissions = getUserPermissions()

  setCurrentRouteName(toRouteName)
  if (to.meta.requiresAuth && guard && !userPermissions.some((permission) => guard.includes(permission))) {
    next({ name: 'unauthorized' })
    return
  }
  // if logged in and navigating to home redirect to tenants
  if (to.path === '/' && authStore.isAuth) {
    next({ name: 'tenants' })
    return
  }

  next()
})
export default router
