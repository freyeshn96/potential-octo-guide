import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/features/placeholders/PlaceholderPage'

export const Route = createFileRoute('/sso')({
  component: PlaceholderPage,
})
