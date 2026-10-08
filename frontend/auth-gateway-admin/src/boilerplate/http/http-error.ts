export interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  traceId?: string
}

export type HttpErrorKind =
  'network' | 'timeout' | 'canceled' | 'http' | 'parse'

export class HttpError extends Error {
  readonly kind: HttpErrorKind
  readonly status?: number
  readonly problem?: ProblemDetails

  constructor(
    kind: HttpErrorKind,
    message: string,
    options?: { status?: number; problem?: ProblemDetails },
  ) {
    super(message)
    this.name = 'HttpError'
    this.kind = kind
    this.status = options?.status
    this.problem = options?.problem
  }
}
