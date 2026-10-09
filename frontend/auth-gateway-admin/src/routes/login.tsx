import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/features/authentication/LoginPage'

export const Route = createFileRoute('/login')({ component: LoginPage })
