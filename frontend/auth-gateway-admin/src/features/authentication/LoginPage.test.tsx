import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('LoginPage', () => {
  it('toggles password visibility and submits only a local preview', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<LoginPage />)
    const password = screen.getByLabelText('Contraseña')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(password).toHaveAttribute('type', 'text')
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'admin@example.com',
    )
    await user.type(password, 'preview-password')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'La interfaz está lista',
    )
    expect(password).toHaveValue('')
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('offers a recovery preview without claiming to send an email', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.click(
      screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Recupera tu acceso' }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'admin@example.com',
    )
    await user.click(
      screen.getByRole('button', { name: 'Solicitar recuperación' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'No se ha enviado ningún correo',
    )
    await user.click(
      screen.getByRole('button', { name: 'Volver al inicio de sesión' }),
    )
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute(
      'type',
      'password',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
