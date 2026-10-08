import { Link } from '@tanstack/react-router'
import { ArrowRight, Box, Layers3, ShieldCheck, Terminal } from 'lucide-react'
import { Button } from '@/boilerplate/components/ui/button'
import { Connectivity } from '@/features/foundation/Connectivity'

export function OverviewPage() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">PLATFORM FOUNDATION</span>
        <h1>
          A clear foundation.
          <br />
          <span>Room to build.</span>
        </h1>
        <p>
          Your admin workspace is ready. Explore the technical foundation and
          confirm the connection to your service.
        </p>
      </div>
      <div className="overview-grid">
        <section className="intro-panel panel">
          <span className="feature-icon">
            <Layers3 size={25} aria-hidden />
          </span>
          <span className="eyebrow">DELIVERY 01</span>
          <h2>Built for the next layer</h2>
          <p>
            Independent services, explicit boundaries, and a simple interface.
            The essentials are in place for the next delivery.
          </p>
          <div className="intro-tags">
            <span>React + TypeScript</span>
            <span>.NET 10</span>
          </div>
          <Button asChild>
            <Link to="/runtime">
              Explore runtime <ArrowRight size={16} aria-hidden />
            </Link>
          </Button>
          <div className="intro-art" aria-hidden>
            <div />
            <div />
            <div />
          </div>
        </section>
        <Connectivity />
      </div>
      <div className="section-title">
        <h2>The essentials, connected</h2>
        <span>A focused technical starting point</span>
      </div>
      <div className="foundation-grid">
        <section className="small-card">
          <Box size={21} aria-hidden />
          <h3>Independent composition</h3>
          <p>
            This workspace and its backend can be built and deployed on their
            own.
          </p>
        </section>
        <section className="small-card">
          <ShieldCheck size={21} aria-hidden />
          <h3>Explicit boundaries</h3>
          <p>
            Separate persistence and clear ownership keep the platform ready to
            evolve.
          </p>
        </section>
        <section className="small-card">
          <Terminal size={21} aria-hidden />
          <h3>Developer essentials</h3>
          <p>
            Typed API access, routing, automated tests, and predictable build
            commands.
          </p>
        </section>
      </div>
    </>
  )
}
