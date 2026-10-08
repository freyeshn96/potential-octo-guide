import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/boilerplate/components/ui/button'
import { foundationServiceConfig } from '@/features/foundation/foundation-config'
import { useSystemInformation } from '@/features/foundation/system-queries'

export function Connectivity() {
  const query = useSystemInformation()
  return (
    <section className="connection panel" aria-label="API connectivity">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">LIVE CONNECTION</span>
          <h2>Backend connectivity</h2>
        </div>
        <span className="connection-icon">
          <ArrowUpRight size={20} aria-hidden />
        </span>
      </div>
      <div
        className={`connection-status ${query.isError ? 'failed' : query.isSuccess ? 'connected' : ''}`}
        role="status"
        aria-live="polite"
      >
        {query.isPending ? (
          <LoaderCircle className="animate-spin" size={22} aria-hidden />
        ) : query.isError ? (
          <CircleAlert size={22} aria-hidden />
        ) : (
          <CheckCircle2 size={22} aria-hidden />
        )}
        <div>
          <strong>
            {query.isPending
              ? 'Checking connection…'
              : query.isError
                ? 'Connection unavailable'
                : 'API connected'}
          </strong>
          <p>
            {query.isError
              ? 'Check that the backend is running and your API URL is configured.'
              : query.isPending
                ? 'Contacting your independent backend service.'
                : 'The system endpoint is responding successfully.'}
          </p>
        </div>
      </div>
      <dl className="connection-details">
        <div>
          <dt>Service</dt>
          <dd>{foundationServiceConfig.expectedService}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>{query.data?.version ?? '—'}</dd>
        </div>
        <div>
          <dt>Endpoint</dt>
          <dd>/api/v1/system/info</dd>
        </div>
      </dl>
      <Button
        variant="outline"
        onClick={() => {
          void query.refetch().catch(() => undefined)
        }}
        disabled={query.isFetching}
      >
        <RefreshCw size={15} aria-hidden /> Check connection
      </Button>
    </section>
  )
}
