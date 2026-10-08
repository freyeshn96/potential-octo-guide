import axios, { AxiosError, isAxiosError } from 'axios'
import { readRuntimeEnv } from '@/boilerplate/config/env'
import { HttpError } from '@/boilerplate/http/http-error'
import { parseProblemDetails } from '@/boilerplate/http/problem-details'

export interface HttpRequestOptions {
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
}

const env = readRuntimeEnv()

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  adapter: 'fetch',
  allowAbsoluteUrls: false,
  withCredentials: false,
  headers: { Accept: 'application/json' },
})

function toHttpError(error: unknown): HttpError {
  if (axios.isCancel(error)) {
    return new HttpError('canceled', 'The request was canceled.')
  }
  if (!isAxiosError(error)) {
    return new HttpError('network', 'The network request failed.')
  }
  const axiosError: AxiosError = error
  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
    return new HttpError('timeout', 'The request timed out.')
  }
  if (axiosError.response !== undefined) {
    const status = axiosError.response.status
    const problem = parseProblemDetails(axiosError.response.data)
    const message =
      problem?.detail ??
      problem?.title ??
      'The service could not complete the request.'
    return new HttpError('http', message, { status, problem })
  }
  if (axiosError.request !== undefined) {
    return new HttpError('network', 'The network request failed.')
  }
  return new HttpError('parse', 'The response could not be processed.')
}

function resolveBody<T>(status: number, data: unknown): T | undefined {
  if (status === 204) {
    return undefined
  }
  if (data === '' || data === null || data === undefined) {
    return undefined
  }
  return data as T
}

export async function httpGet<T>(
  path: string,
  options?: HttpRequestOptions,
): Promise<T | undefined> {
  try {
    const response = await axiosInstance.get<T>(path, {
      params: options?.params,
      headers: options?.headers,
      signal: options?.signal,
    })
    return resolveBody<T>(response.status, response.data)
  } catch (error: unknown) {
    throw toHttpError(error)
  }
}

export async function httpPost<T>(
  path: string,
  body?: unknown,
  options?: HttpRequestOptions,
): Promise<T | undefined> {
  try {
    const response = await axiosInstance.post<T>(path, body, {
      params: options?.params,
      headers: options?.headers,
      signal: options?.signal,
    })
    return resolveBody<T>(response.status, response.data)
  } catch (error: unknown) {
    throw toHttpError(error)
  }
}

export async function httpPut<T>(
  path: string,
  body?: unknown,
  options?: HttpRequestOptions,
): Promise<T | undefined> {
  try {
    const response = await axiosInstance.put<T>(path, body, {
      params: options?.params,
      headers: options?.headers,
      signal: options?.signal,
    })
    return resolveBody<T>(response.status, response.data)
  } catch (error: unknown) {
    throw toHttpError(error)
  }
}

export async function httpPatch<T>(
  path: string,
  body?: unknown,
  options?: HttpRequestOptions,
): Promise<T | undefined> {
  try {
    const response = await axiosInstance.patch<T>(path, body, {
      params: options?.params,
      headers: options?.headers,
      signal: options?.signal,
    })
    return resolveBody<T>(response.status, response.data)
  } catch (error: unknown) {
    throw toHttpError(error)
  }
}

export async function httpDelete<T>(
  path: string,
  options?: HttpRequestOptions,
): Promise<T | undefined> {
  try {
    const response = await axiosInstance.delete<T>(path, {
      params: options?.params,
      headers: options?.headers,
      signal: options?.signal,
    })
    return resolveBody<T>(response.status, response.data)
  } catch (error: unknown) {
    throw toHttpError(error)
  }
}
