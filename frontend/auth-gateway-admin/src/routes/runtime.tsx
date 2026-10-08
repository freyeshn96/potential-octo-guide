import { createFileRoute } from '@tanstack/react-router'
import { RuntimePage } from '@/features/foundation/RuntimePage'

export const Route = createFileRoute('/runtime')({
  component: RuntimePage,
})
