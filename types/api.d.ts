import type { AxiosResponse, AxiosError } from 'axios'

export interface HttpFinally {
  (): void
}

export interface HttpResponse {
  callback?(response: AxiosResponse): void
  message?: string
}
export interface HttpError {
  callback?(error: AxiosError): void
  message?: string
}

export interface HttpRequest {
  url: string
  method: string
  data?: object
  headers?: object
  onSuccess?: HttpResponse
  onError?: HttpError
  finally?: HttpFinally
}

export interface HttpRequestConfig {
  hideErrorMsg?: boolean,
}

export interface IndexedHttpRequest extends HttpRequest {
  id: number
}
