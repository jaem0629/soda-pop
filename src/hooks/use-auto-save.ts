'use client'

import { useEffect, useEffectEvent, useRef } from 'react'
import { useBeforeUnload } from './use-before-unload'

type UseAutoSaveOptions<T> = {
  /**
   * Function to get the current data to save
   */
  getData: () => T
  /**
   * Function to save the data (should return a promise)
   */
  onSave: (data: T) => Promise<void> | void
  /**
   * Auto-save interval in milliseconds
   * @default 10000 (10 seconds)
   */
  intervalMs?: number
  /**
   * Whether to save on page unload (beforeunload event)
   * @default true
   */
  saveOnUnload?: boolean
  /**
   * Whether auto-save is enabled
   * @default true
   */
  enabled?: boolean
  /**
   * Optional comparison function to check if data has changed
   * If not provided, will always save on interval
   */
  isEqual?: (prev: T, current: T) => boolean
}

/**
 * Generic auto-save hook that periodically saves data and on page unload
 *
 * @example
 * ```tsx
 * useAutoSave({
 *   getData: () => scoreRef.current,
 *   onSave: async (score) => {
 *     await updatePlayerScore(matchId, playerOrder, score)
 *   },
 *   intervalMs: 10000,
 *   saveOnUnload: true
 * })
 * ```
 */
export function useAutoSave<T>({
  getData,
  onSave,
  intervalMs = 10000,
  saveOnUnload = true,
  enabled = true,
  isEqual,
}: UseAutoSaveOptions<T>) {
  const lastSavedDataRef = useRef<T | null>(null)
  const isSavingRef = useRef(false)

  // Wrap save logic in useEffectEvent to avoid stale closures
  // This ensures we always use the latest getData, onSave, and isEqual
  // without needing to add them to effect dependencies
  const performSave = useEffectEvent(async (source: 'interval' | 'unload') => {
    if (isSavingRef.current) return

    const currentData = getData()

    // If isEqual is provided, check if data has changed
    if (isEqual && lastSavedDataRef.current !== null) {
      if (isEqual(lastSavedDataRef.current, currentData)) {
        return // No changes, skip save
      }
    }

    isSavingRef.current = true

    try {
      await onSave(currentData)
      lastSavedDataRef.current = currentData

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Auto-save] Data saved (${source})`, currentData)
      }
    } catch (error) {
      console.error(`[Auto-save] Failed to save (${source}):`, error)
    } finally {
      isSavingRef.current = false
    }
  })

  // Periodic auto-save
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      performSave('interval')
    }, intervalMs)

    return () => clearInterval(interval)
  }, [enabled, intervalMs])

  // Save on page unload
  useBeforeUnload(() => {
    const currentData = getData()

    if (isEqual && lastSavedDataRef.current !== null) {
      if (isEqual(lastSavedDataRef.current, currentData)) {
        return // No changes
      }
    }

    onSave(currentData)
    lastSavedDataRef.current = currentData

    if (process.env.NODE_ENV === 'development') {
      console.log('[Auto-save] Data saved (unload)', currentData)
    }
  }, enabled && saveOnUnload)
}
