import { Link } from '@tanstack/react-router'
import { ArrowRight, Box, Layers3, ShieldCheck, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/boilerplate/components/ui/button'
import { Connectivity } from '@/features/foundation/Connectivity'

export function OverviewPage() {
  const { t } = useTranslation('pages', { keyPrefix: 'overview' })

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
      <div className="overview-grid">
        <section className="intro-panel panel">
          <span className="feature-icon">
            <Layers3 size={25} aria-hidden />
          </span>
          <span className="eyebrow">{t('introEyebrow')}</span>
          <h2>{t('introTitle')}</h2>
          <p>{t('introDescription')}</p>
          <div className="intro-tags">
            <span>React + TypeScript</span>
            <span>.NET 10</span>
          </div>
          <Button asChild variant="outline">
            <Link to="/">
              {t('backHome')} <ArrowRight size={16} aria-hidden />
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
        <h2>{t('sectionTitle')}</h2>
        <span>{t('sectionSubtitle')}</span>
      </div>
      <div className="foundation-grid">
        <section className="small-card">
          <Box size={21} aria-hidden />
          <h3>{t('cards.compositionTitle')}</h3>
          <p>{t('cards.compositionDescription')}</p>
        </section>
        <section className="small-card">
          <ShieldCheck size={21} aria-hidden />
          <h3>{t('cards.boundariesTitle')}</h3>
          <p>{t('cards.boundariesDescription')}</p>
        </section>
        <section className="small-card">
          <Terminal size={21} aria-hidden />
          <h3>{t('cards.essentialsTitle')}</h3>
          <p>{t('cards.essentialsDescription')}</p>
        </section>
      </div>
    </>
  )
}
