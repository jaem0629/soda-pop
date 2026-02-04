import { cn } from '@/lib/utils'
import { forwardRef, type HTMLAttributes } from 'react'

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'light'
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl backdrop-blur-xl',
          variant === 'default' &&
            'border border-white/10 bg-slate-900/60 shadow-lg',
          variant === 'light' && 'border border-cyan-400/20 bg-cyan-400/10',
          className,
        )}
        {...props}
      />
    )
  },
)

GlassPanel.displayName = 'GlassPanel'
