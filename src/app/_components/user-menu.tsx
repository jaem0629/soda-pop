'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/dialog'
import {
  checkNicknameAvailable,
  signOut,
  updateNickname,
} from '@/app/_lib/actions'
import { CheckIcon, Loader2Icon, PencilIcon, XIcon } from 'lucide-react'
import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface UserMenuProps {
  nickname: string
}

export function UserMenu({ nickname }: UserMenuProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editValue, setEditValue] = useState(nickname)
  const [error, setError] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkAvailability = useCallback(
    async (value: string) => {
      const trimmed = value.trim()
      if (trimmed.length === 0 || trimmed === nickname) {
        setIsAvailable(null)
        setIsChecking(false)
        return
      }
      setIsChecking(true)
      try {
        const result = await checkNicknameAvailable(trimmed)
        setIsAvailable(result.available)
        if (!result.available) {
          setError(
            result.reason === 'banned'
              ? 'Nickname contains inappropriate language'
              : 'Nickname already taken',
          )
        }
      } catch {
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    },
    [nickname],
  )

  const handleChange = (value: string) => {
    if (value.length > 20) return
    setEditValue(value)
    setError(null)
    setIsAvailable(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = value.trim()
    if (trimmed.length > 0 && trimmed !== nickname) {
      debounceRef.current = setTimeout(() => checkAvailability(value), 400)
    }
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setEditValue(nickname)
      setError(null)
      setIsAvailable(null)
    }
  }

  const handleSave = async () => {
    const trimmed = editValue.trim()
    if (trimmed.length === 0) {
      setError('Enter a nickname')
      return
    }
    if (trimmed === nickname) {
      setOpen(false)
      return
    }
    if (isAvailable !== true) return

    setIsSaving(true)
    const result = await updateNickname(trimmed)
    setIsSaving(false)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error ?? 'Update failed')
      if (result.error === 'Nickname already taken') {
        setIsAvailable(false)
      }
    }
  }

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <div className='flex items-center gap-4'>
      <div className='flex items-center gap-2'>
        <div className='flex size-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500'>
          <span className='text-sm font-bold'>
            {nickname.charAt(0).toUpperCase() || '?'}
          </span>
        </div>

        <div className='flex items-center gap-1.5'>
          <span className='text-sm font-medium text-white/70'>{nickname}</span>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button className='flex size-6 cursor-pointer items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/10 hover:text-white/60'>
                <PencilIcon className='size-3' />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit nickname</DialogTitle>
                <DialogDescription>
                  This will be your display name in matches
                </DialogDescription>
              </DialogHeader>

              <div className='flex flex-col gap-3'>
                <div className='relative'>
                  <input
                    type='text'
                    value={editValue}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave()
                    }}
                    maxLength={20}
                    autoFocus
                    className={`h-12 w-full rounded-2xl bg-white/5 px-4 pr-10 text-sm font-medium outline-none placeholder:text-white/20 ${
                      error
                        ? 'ring-1 ring-red-500/40'
                        : isAvailable
                          ? 'ring-1 ring-green-500/40'
                          : ''
                    }`}
                  />
                  <div className='absolute top-1/2 right-3 -translate-y-1/2'>
                    {isChecking && (
                      <Loader2Icon className='size-4 animate-spin text-white/30' />
                    )}
                    {!isChecking && isAvailable === true && (
                      <CheckIcon className='size-4 text-green-400' />
                    )}
                    {!isChecking && isAvailable === false && (
                      <XIcon className='size-4 text-red-400' />
                    )}
                  </div>
                </div>

                {error && <p className='text-xs text-red-400'>{error}</p>}

                <button
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    isChecking ||
                    !editValue.trim() ||
                    (editValue.trim() !== nickname && isAvailable !== true)
                  }
                  className='flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 font-bold transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50'
                >
                  {isSaving ? (
                    <Loader2Icon className='size-4 animate-spin' />
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        disabled={isPending}
        className='rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20 disabled:opacity-50'
      >
        {isPending ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  )
}
