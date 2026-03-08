import { Gamepad2Icon } from 'lucide-react'
import { forwardRef } from 'react'

export const StartPlayingButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>((props, ref) => (
  <button
    ref={ref}
    className='flex cursor-pointer items-center gap-4 rounded-full bg-linear-to-r from-blue-500 to-purple-500 px-10 py-5 text-xl font-bold'
    {...props}
  >
    <Gamepad2Icon className='size-6' />
    Start Playing
  </button>
))

StartPlayingButton.displayName = 'StartPlayingButton'
