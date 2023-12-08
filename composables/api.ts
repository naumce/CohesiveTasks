import { ref, watch } from 'vue'
import { apiClient } from '@/plugins/axios'
import { useLoaderStore } from '@/stores/loader'
import { useAlertsStore } from '@/stores/alerts'
import { useI18n } from 'vue-i18n'
import type { HttpRequest, IndexedHttpRequest } from '@/types'
import type { AxiosResponse } from 'axios'
import {useCookies} from "vue3-cookies";
import type {HttpRequestConfig} from "@/types/api";

export default function useApis() {
  const requests = ref<IndexedHttpRequest[]>([])
  const { showLoader } = useLoaderStore()
  const { showAlert } = useAlertsStore()
  const { t } = useI18n()

  /**
   * Sends an HTTP request.
   * @param {Object} passedRequest - The request object.
   * @param config
   * @param {string} passedRequest.method - The HTTP method to use for the request.
   * @param {string} passedRequest.url - The URL for the request.
   * @param {Object} passedRequest.onSuccess - An object that specifies a callback function to be executed when the request succeeds.
   * @param {Function} passedRequest.onSuccess.callback - The callback function to be executed when the request succeeds.
   * @param {Object} passedRequest.onError - An object that specifies a callback function to be executed when the request fails.
   * @param {string} passedRequest.onError.message - The error message to be displayed when the request fails.
   * @param {Function} passedRequest.onError.callback - The callback function to be executed when the request fails.
   * @param {Object} passedRequest.finally - An object that specifies a callback function to be executed when the request is completed, regardless of success or failure.
   * @param {Function} passedRequest.finally.callback - The callback function to be executed when the request is completed, regardless of success or failure.
   */
  const sendRequest = async (passedRequest: HttpRequest, config: HttpRequestConfig = {hideErrorMsg: false}) => {
    const request: IndexedHttpRequest = {
      ...passedRequest,
      id: requests.value.length
    }
    requests.value.push(request)
    const { cookies } = useCookies()
    showLoader(true)
    return apiClient({
      method: request.method,
      url: request.url,
      data: request.data,
      headers: request.headers
    })
      .then((response: AxiosResponse) => {
        const onSuccess = request?.onSuccess?.callback
        onSuccess && onSuccess(response)
        if (!request?.onSuccess?.message) return response
        showAlert({
          type: 'success',
          message: request?.onSuccess?.message
        })
        return response
      })
      .catch((error: any) => {
        if (apiClient.isCancel(error)) return
        const onError = request?.onError
        const errorMessage = error?.response?.data?.message
        if(!config.hideErrorMsg) {
          showAlert({
            type: 'error',
            message: onError?.message || errorMessage || t('messages.error.default')
          })
        }
        onError?.callback && onError?.callback(error)
      })
      .finally(() => {
        requests.value = requests.value.filter((r) => r.id !== request.id)
        const finallyCallback = request?.finally
        finallyCallback && finallyCallback()
      })
  }

  watch(
    requests,
    (newValue) => {
      if (newValue.length) return
      showLoader(false)
    },
    { deep: true }
  )
  return { sendRequest }
}
