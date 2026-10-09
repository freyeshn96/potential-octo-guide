import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Layers3,
  ShieldCheck,
  KeyRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { appConfig } from '@/app.config'
import './authentication.css'

export function LoginPage() {
  const { t } = useTranslation('authentication')
  const [isRecovery, setIsRecovery] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState<'loginNotice' | 'recoveryNotice' | null>(
    null,
  )

  function changeView() {
    setIsRecovery(!isRecovery)
    setShowPassword(false)
    setNotice(null)
  }

  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice(isRecovery ? 'recoveryNotice' : 'loginNotice')
    event.currentTarget.reset()
    setShowPassword(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-story" aria-labelledby="auth-headline">
        <div className="auth-brand">
          <span className="auth-brand-mark" aria-hidden>
            <Layers3 size={22} />
          </span>
          {appConfig.identity.name}
        </div>
        <div className="auth-story-content">
          <p className="auth-area">{t('area')}</p>
          <h2 id="auth-headline">{t('headline')}</h2>
          <p className="auth-intro">{t('intro')}</p>
          <div
            className="auth-gateway-art"
            role="img"
            aria-label={t('illustration')}
          >
            <div className="auth-orbit auth-orbit-outer" />
            <div className="auth-orbit auth-orbit-inner" />
            <div className="auth-door">
              <KeyRound size={32} aria-hidden />
            </div>
            <span className="auth-node auth-node-app">
              <Layers3 size={16} aria-hidden />
              {t('applications')}
            </span>
            <span className="auth-node auth-node-identity">
              <KeyRound size={16} aria-hidden />
              {t('identities')}
            </span>
            <span className="auth-node auth-node-permission">
              <ShieldCheck size={16} aria-hidden />
              {t('permissions')}
            </span>
          </div>
        </div>
        <p className="auth-story-footer">{t('footer')}</p>
      </section>
      <section className="auth-access" aria-labelledby="auth-title">
        <span className="auth-preview">
          <span aria-hidden />
          {t('preview')}
        </span>
        <div className="auth-form-container">
          <div className="auth-welcome-icon" aria-hidden>
            <KeyRound size={24} />
          </div>
          <h1 id="auth-title">{t(isRecovery ? 'recoveryTitle' : 'title')}</h1>
          <p className="auth-description">
            {t(isRecovery ? 'recoveryDescription' : 'description')}
          </p>
          <form
            key={isRecovery ? 'recovery' : 'login'}
            onSubmit={submitPreview}
            className="auth-form"
          >
            <label htmlFor="auth-email">{t('email')}</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder={t('emailPlaceholder')}
              required
            />
            {!isRecovery && (
              <>
                <div className="auth-password-label">
                  <label htmlFor="auth-password">{t('password')}</label>
                  <button type="button" onClick={changeView}>
                    {t('forgot')}
                  </button>
                </div>
                <div className="auth-password-input">
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    aria-label={t(
                      showPassword ? 'hidePassword' : 'showPassword',
                    )}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden />
                    ) : (
                      <Eye size={18} aria-hidden />
                    )}
                  </button>
                </div>
              </>
            )}
            <button className="auth-submit" type="submit">
              {t(isRecovery ? 'recover' : 'submit')}
              <ArrowRight size={17} aria-hidden />
            </button>
            {notice !== null && (
              <p className="auth-notice" role="status">
                {t(notice)}
              </p>
            )}
          </form>
          {isRecovery ? (
            <button className="auth-back" type="button" onClick={changeView}>
              <ArrowLeft size={15} aria-hidden />
              {t('back')}
            </button>
          ) : (
            <p className="auth-access-note">{t('accessNote')}</p>
          )}
        </div>
        <p className="auth-privacy">
          <ShieldCheck size={14} aria-hidden />
          {t('privacy')}
        </p>
      </section>
    </main>
  )
}
