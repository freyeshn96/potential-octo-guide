import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/boilerplate/components/ui/button'
import { foundationServiceConfig } from '@/features/foundation/foundation-config'
import { useSystemInformation } from '@/features/foundation/system-queries'

export function Connectivity() {
  const { t } = useTranslation('connectivity')
  const query = useSystemInformation()
  return (
    <section className="connection panel" aria-label={t('ariaLabel')}>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{t('eyebrow')}</span>
          <h2>{t('title')}</h2>
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
              ? t('status.checking')
              : query.isError
                ? t('status.unavailable')
                : t('status.connected')}
          </strong>
          <p>
            {query.isError
              ? t('message.unavailable')
              : query.isPending
                ? t('message.checking')
                : t('message.connected')}
          </p>
        </div>
      </div>
      <dl className="connection-details">
        <div>
          <dt>{t('fields.service')}</dt>
          <dd>{foundationServiceConfig.expectedService}</dd>
        </div>
        <div>
          <dt>{t('fields.version')}</dt>
          <dd>{query.data?.version ?? '—'}</dd>
        </div>
        <div>
          <dt>{t('fields.endpoint')}</dt>
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
        <RefreshCw size={15} aria-hidden /> {t('checkConnection')}
      </Button>
    </section>
  )
}
