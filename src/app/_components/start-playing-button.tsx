import { Gamepad2Icon } from 'lucide-react'
import { forwardRef } from 'react'

export const StartPlayingButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>((props, ref) => (
  <button
    ref={ref}
    className='flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3 text-base font-black text-slate-950 shadow-xl shadow-black/25 transition hover:-translate-y-0.5 hover:bg-zinc-200 sm:min-h-14 sm:w-auto sm:px-8 sm:text-lg'
    {...props}
  >
    <Gamepad2Icon className='size-5 sm:size-6' />
    Start Playing
  </button>
))

StartPlayingButton.displayName = 'StartPlayingButton'
