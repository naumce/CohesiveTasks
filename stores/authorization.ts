import { defineStore } from 'pinia'
import { useCookies } from 'vue3-cookies'
import { useCustomizerStore } from './customizer'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'
import type {TokenInfo} from "@/types/user";
import {useRouter} from "vue-router";

export const useAuthStore = defineStore(
    'auth',
    () => {
        const { cookies } = useCookies()
        const isAuth = ref<boolean>(false)
        const redirectPath = ref<RouteLocationNormalized>()
        const user = ref<TokenInfo>()
        const router = useRouter()
        function setIsAuth(value: boolean) {
            isAuth.value = value
        }
        function setUser(value: TokenInfo) {
            user.value = value
        }

        const { clearCustomizerStore } = useCustomizerStore()
        function logout() {
            isAuth.value = false
            user.value = {} as TokenInfo;
            // remove cookies and other relevant items from localStorage
            cookies.remove('_token')
            clearCustomizerStore()

        }
        function setRedirectPath(route: RouteLocationNormalized) {
            redirectPath.value = route
        }

        const keepAlive = ref<string[]>(['SchedulesManagement'])
        function setKeepAlive(v: string[]) {
            keepAlive.value = v
        }
        return {
            isAuth,
            user,
            redirectPath,
            setIsAuth,
            setUser,
            logout,
            setRedirectPath,
            keepAlive,
            setKeepAlive
        }
    },
    {
        persist: true
    }
)
