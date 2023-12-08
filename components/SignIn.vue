<script setup lang="ts">
import { inject } from 'vue'
import type { AppConfiguration } from '@/types'
const appConfig = inject('appConfig') as AppConfiguration
// purpose of this component is to redirect to keycloak signin
const token_redirect = import.meta.env.DEV ? '?token_redirect=http://localhost:8080/token' : ''
const authUrl = `/openid/login${token_redirect}`
window.location.href = `${appConfig.api_root}${authUrl}`
</script>
<template><h1 style="display: none">Redirecting...</h1></template>
