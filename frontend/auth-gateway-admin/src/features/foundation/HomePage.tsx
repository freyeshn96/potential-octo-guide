import { Link } from '@tanstack/react-router'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/boilerplate/components/ui/button'

export function HomePage() {
  const { t } = useTranslation('pages', { keyPrefix: 'home' })

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">{t('eyebrow')}</span>
        <h1>
          {t('titleLine1')}
          <br />
          <span>{t('titleLine2')}</span>
        </h1>
        <p>{t('description')}</p>
      </div>
      <section className="panel" style={{ maxWidth: '28rem' }}>
        <span className="feature-icon">
          <LayoutDashboard size={25} aria-hidden />
        </span>
        <h2>{t('demoTitle')}</h2>
        <p>{t('demoDescription')}</p>
        <Button asChild>
          <Link to="/overview">
            {t('demoCta')} <ArrowRight size={16} aria-hidden />
          </Link>
        </Button>
      </section>
    </>
  )
}
