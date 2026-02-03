'use client'

import { useEffect, useEffectEvent } from 'react'

/**
 * Hook to execute a callback when the page is about to unload
 *
 * @param callback - Function to execute before page unload
 * @param enabled - Whether the hook is enabled (default: true)
 *
 * @example
 * ```tsx
 * // Save data when leaving the page
 * useBeforeUnload(() => saveData(), hasUnsavedChanges)
 *
 * // Leave match when host closes the page
 * useBeforeUnload(() => leaveMatch(matchId), isHost)
 * ```
 */
export function useBeforeUnload(callback: () => void, enabled: boolean = true) {
    // Wrap callback in useEffectEvent to always use the latest version
    const handleBeforeUnload = useEffectEvent(() => {
        callback()
    })

    useEffect(() => {
        if (!enabled) return

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [enabled])
}
