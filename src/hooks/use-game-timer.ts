'use client'

import { useEffect, useEffectEvent, useState, useRef } from 'react'

type UseGameTimerProps = {
    duration: number
    onExpire?: () => void
}

type UseGameTimerReturn = {
    timeLeft: number
    isRunning: boolean
    isExpired: boolean
    start: (elapsedSeconds?: number) => void
    stop: () => void
    reset: () => void
}

export function useGameTimer({
    duration,
    onExpire,
}: UseGameTimerProps): UseGameTimerReturn {
    const [startTime, setStartTime] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState(duration)
    const expiredRef = useRef(false)

    const isRunning = startTime !== null && timeLeft > 0
    const isExpired = startTime !== null && timeLeft <= 0

    const handleExpire = useEffectEvent(() => {
        onExpire?.()
    })

    const start = (elapsedSeconds: number = 0) => {
        expiredRef.current = false
        const now = Date.now()
        setStartTime(now - elapsedSeconds * 1000)
        setTimeLeft(Math.max(0, duration - elapsedSeconds))
    }

    const stop = () => {
        setStartTime(null)
    }

    const reset = () => {
        expiredRef.current = false
        setStartTime(null)
        setTimeLeft(duration)
    }

    useEffect(() => {
        if (startTime === null) return

        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = Math.max(0, duration - elapsed)
            setTimeLeft(remaining)

            if (remaining <= 0 && !expiredRef.current) {
                expiredRef.current = true
                handleExpire()
            }
        }, 100)

        return () => clearInterval(timer)
    }, [startTime, duration])

    return {
        timeLeft,
        isRunning,
        isExpired,
        start,
        stop,
        reset,
    }
}
