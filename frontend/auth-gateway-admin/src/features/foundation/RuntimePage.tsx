import { Activity } from 'lucide-react'
import { Connectivity } from '@/features/foundation/Connectivity'

export function RuntimePage() {
  return (
    <>
      <div className="page-heading compact">
        <span className="eyebrow">TECHNICAL FOUNDATION</span>
        <h1>Runtime</h1>
        <p>
          Check the service this workspace connects to. Readiness is available
          separately at /health/ready.
        </p>
      </div>
      <div className="runtime-grid">
        <Connectivity />
        <section className="panel runtime-note">
          <span className="feature-icon">
            <Activity size={23} aria-hidden />
          </span>
          <h2>Service diagnostics</h2>
          <p>
            The system endpoint confirms API connectivity. Database availability
            is checked by the backend readiness endpoint.
          </p>
          <dl className="connection-details">
            <div>
              <dt>Liveness</dt>
              <dd>/health/live</dd>
            </div>
            <div>
              <dt>Readiness</dt>
              <dd>/health/ready</dd>
            </div>
            <div>
              <dt>API configuration</dt>
              <dd>VITE_API_BASE_URL</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  )
}
