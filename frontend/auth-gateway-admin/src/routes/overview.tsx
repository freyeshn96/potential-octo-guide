import { createFileRoute } from '@tanstack/react-router'
import { OverviewPage } from '@/features/foundation/OverviewPage'

export const Route = createFileRoute('/overview')({
  component: OverviewPage,
})
