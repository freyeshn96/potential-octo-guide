import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/boilerplate/http/http-error'
import { httpDelete, httpGet } from '@/boilerplate/http/http-client'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('httpGet', () => {
  it('builds requests against the configured API base URL and query params', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )
    const result = await httpGet<{ ok: boolean }>('/api/v1/items', {
      params: { page: 2 },
    })
    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledOnce()
    const firstCall = fetchMock.mock.calls[0]
    expect(firstCall).toBeDefined()
    const request = firstCall?.[0] as Request
    expect(request.url).toContain('/api/v1/items')
    expect(request.url).toContain('page=2')
  })

  it('returns undefined for 204 responses', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    const result = await httpGet('/api/v1/empty')
    expect(result).toBeUndefined()
  })

  it('maps HTTP errors to HttpError with Problem Details', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          title: 'Validation failed',
          detail: 'Invalid input',
          status: 400,
          traceId: 'trace-1',
        }),
        { status: 400 },
      ),
    )
    await expect(httpGet('/api/v1/bad')).rejects.toMatchObject({
      kind: 'http',
      status: 400,
      problem: { title: 'Validation failed', traceId: 'trace-1' },
    } satisfies Partial<HttpError>)
  })

  it('propagates cancellation through AbortSignal', async () => {
    const controller = new AbortController()
    vi.mocked(fetch).mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'))
          })
        }),
    )
    controller.abort()
    await expect(
      httpGet('/api/v1/system/info', { signal: controller.signal }),
    ).rejects.toMatchObject({ kind: 'canceled' } satisfies Partial<HttpError>)
  })
})

describe('httpDelete', () => {
  it('supports delete requests without a response body', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))
    const result = await httpDelete('/api/v1/items/1')
    expect(result).toBeUndefined()
  })
})
