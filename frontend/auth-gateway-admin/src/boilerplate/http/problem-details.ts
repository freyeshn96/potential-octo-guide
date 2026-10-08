import type { ProblemDetails } from '@/boilerplate/http/http-error'

export function parseProblemDetails(
  payload: unknown,
): ProblemDetails | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }
  const record = payload as Record<string, unknown>
  const problem: ProblemDetails = {}
  if (typeof record.title === 'string') {
    problem.title = record.title
  }
  if (typeof record.detail === 'string') {
    problem.detail = record.detail
  }
  if (typeof record.status === 'number') {
    problem.status = record.status
  }
  const trace =
    typeof record.traceId === 'string'
      ? record.traceId
      : typeof record.correlationId === 'string'
        ? record.correlationId
        : undefined
  if (trace !== undefined) {
    problem.traceId = trace
  }
  if (
    problem.title === undefined &&
    problem.detail === undefined &&
    problem.status === undefined &&
    problem.traceId === undefined
  ) {
    return undefined
  }
  return problem
}
