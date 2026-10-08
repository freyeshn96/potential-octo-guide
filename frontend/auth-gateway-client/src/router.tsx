import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from '@tanstack/react-router'
import {
  Activity,
  ArrowRight,
  Box,
  ChevronRight,
  Layers3,
  Menu,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react'
import { useNavigation } from '@/state/navigation'
import { Button } from '@/components/ui/button'
import { Connectivity } from '@/components/connectivity'

function Layout() {
  const { menuOpen, toggleMenu, closeMenu } = useNavigation()
  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${menuOpen ? 'is-open' : ''}`}
        aria-label="Application navigation"
      >
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon">
            <ShieldCheck size={25} aria-hidden />
          </span>
          <span>
            Auth Gateway<small>Client workspace</small>
          </span>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'active' }}
            onClick={closeMenu}
          >
            <Layers3 size={18} aria-hidden /> Overview
          </Link>
          <Link
            to="/runtime"
            activeProps={{ className: 'active' }}
            onClick={closeMenu}
          >
            <Activity size={18} aria-hidden /> Runtime
          </Link>
        </nav>
        <div className="sidebar-note">
          <span className="note-dot" />
          <strong>Foundation</strong>
          <p>A focused starting point for secure application integration.</p>
          <span className="note-version">DELIVERY 01</span>
        </div>
        <div className="sidebar-footer">
          Auth Gateway <span>v1.0.0</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              size="icon"
              variant="ghost"
              className="menu-toggle"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <span>Client</span>
            <ChevronRight size={14} aria-hidden />
            <strong>Foundation</strong>
          </div>
          <span className="environment-badge">
            <span />
            Technical preview
          </span>
        </header>
        <main id="main-content">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          Independent by design.<span>Auth Gateway / Client</span>
        </footer>
      </div>
    </div>
  )
}

function Overview() {
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
          Your client workspace is ready. Explore the technical foundation and
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

function Runtime() {
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

const root = createRootRoute({
  component: Layout,
  notFoundComponent: () => (
    <div className="page-heading">
      <h1>Page not found</h1>
      <Link to="/">Back to overview</Link>
    </div>
  ),
})
const overview = createRoute({
  getParentRoute: () => root,
  path: '/',
  component: Overview,
})
const runtime = createRoute({
  getParentRoute: () => root,
  path: '/runtime',
  component: Runtime,
})
const routeTree = root.addChildren([overview, runtime])

export function createAppRouter() {
  return createRouter({ routeTree, defaultPreload: 'intent' })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
