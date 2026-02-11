import { Gamepad2Icon } from 'lucide-react'
import { forwardRef } from 'react'

export const StartPlayingButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>((props, ref) => (
  <button
    ref={ref}
    className='flex cursor-pointer items-center gap-4 rounded-full bg-blue-600 px-8 py-4 text-lg font-bold hover:bg-blue-500'
    {...props}
  >
    <Gamepad2Icon />
    Start Playing
  </button>
))

StartPlayingButton.displayName = 'StartPlayingButton'
