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

    // onExpire를 Effect Event로 감싸서 의존성에서 제외
    const handleExpire = useEffectEvent(() => {
        onExpire?.()
    })

    // 타이머 시작 (선택적으로 이미 경과한 시간 전달)
    const start = (elapsedSeconds: number = 0) => {
        expiredRef.current = false
        const now = Date.now()
        setStartTime(now - elapsedSeconds * 1000)
        setTimeLeft(Math.max(0, duration - elapsedSeconds))
    }

    // 타이머 정지
    const stop = () => {
        setStartTime(null)
    }

    // 타이머 리셋
    const reset = () => {
        expiredRef.current = false
        setStartTime(null)
        setTimeLeft(duration)
    }

    // 타이머 틱 및 만료 처리
    useEffect(() => {
        if (startTime === null) return

        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = Math.max(0, duration - elapsed)
            setTimeLeft(remaining)

            // 만료 시 콜백 호출 (1회만)
            if (remaining <= 0 && !expiredRef.current) {
                expiredRef.current = true
                handleExpire()
            }
        }, 100)

        return () => clearInterval(timer)
    }, [startTime, duration]) // onExpire 제거됨!

    return {
        timeLeft,
        isRunning,
        isExpired,
        start,
        stop,
        reset,
    }
}
