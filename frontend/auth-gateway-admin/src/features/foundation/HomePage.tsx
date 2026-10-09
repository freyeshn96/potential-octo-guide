import { Link } from '@tanstack/react-router'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { Button } from '@/boilerplate/components/ui/button'

export function HomePage() {
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">INICIO</span>
        <h1>
          Bienvenido al
          <br />
          <span>panel de administración.</span>
        </h1>
        <p>
          Esta es la pantalla de inicio. Abre la demo de Overview para ver el
          layout completo y la verificación de conexión con el backend.
        </p>
      </div>
      <section className="panel" style={{ maxWidth: '28rem' }}>
        <span className="feature-icon">
          <LayoutDashboard size={25} aria-hidden />
        </span>
        <h2>Demo Overview</h2>
        <p>
          Tarjetas, conectividad y contenido de ejemplo del shell de
          administración.
        </p>
        <Button asChild>
          <Link to="/overview">
            Ir a Overview <ArrowRight size={16} aria-hidden />
          </Link>
        </Button>
      </section>
    </>
  )
}
