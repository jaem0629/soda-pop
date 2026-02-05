import { getServerUserId } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import { SingleConnectionGuard } from './_components/single-connection-guard'

interface Props {
  children: React.ReactNode
  params: Promise<{ roomId: string }>
}

export default async function GameLayout({ children, params }: Props) {
  await params // Consume params to avoid warnings

  // Get userId from auth session (pages handle data validation)
  const userId = await getServerUserId()
  if (!userId) {
    redirect('/')
  }

  return (
    <SingleConnectionGuard userId={userId}>{children}</SingleConnectionGuard>
  )
}
