'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useGameReducer, calculateDrops } from '@/hooks/use-game-reducer'
import { useGameAnimation } from '@/hooks/use-game-animation'
import {
    renderBoard,
    getGridPosition,
    BOARD_PX,
    CELL_SIZE,
} from '@/lib/canvas-renderer'
import {
    BOARD_SIZE,
    swapPieces,
    findAllMatches,
    calculateScore,
} from '@/lib/game-logic'
import type { Position } from '@/lib/types'

interface GameBoardProps {
    onScoreChange?: (score: number) => void
    disabled?: boolean
}

export default function GameBoard({
    onScoreChange,
    disabled = false,
}: GameBoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { state, actions } = useGameReducer()
    const { animation, animateSwap, animateMatchAndDrop, resetAnimation } =
        useGameAnimation()

    // Canvas 렌더링
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        renderBoard(ctx, {
            board: state.board,
            selectedPos: state.selectedPos,
            animation,
            isDragging: state.isDragging,
            dragStart: state.dragStart,
            dragOffset: state.dragOffset,
        })
    }, [state, animation])

    // 이동 처리
    const handleMove = useCallback(
        async (pos1: Position, pos2: Position) => {
            if (disabled || state.isProcessing) return

            // 인접 검사
            const rowDiff = Math.abs(pos1.row - pos2.row)
            const colDiff = Math.abs(pos1.col - pos2.col)
            const isAdjacent =
                (rowDiff === 1 && colDiff === 0) ||
                (rowDiff === 0 && colDiff === 1)

            if (!isAdjacent) {
                actions.select(null)
                return
            }

            actions.setProcessing(true)
            actions.select(null)

            // 스왑 애니메이션
            await animateSwap(pos1, pos2)

            // 스왑 적용
            let currentBoard = swapPieces(state.board, pos1, pos2)
            actions.setBoard(currentBoard)

            let matches = findAllMatches(currentBoard)

            // 매칭 없으면 되돌리기
            if (matches.length === 0) {
                await animateSwap(pos2, pos1)
                actions.setBoard(state.board)
                actions.setProcessing(false)
                return
            }

            // 연쇄 처리
            let totalScore = 0
            let combo = 0

            while (matches.length > 0) {
                const matchScore = calculateScore(matches, combo)
                totalScore += matchScore
                combo++

                // 드롭 정보 미리 계산
                const { newBoard, drops, boardWithHoles } = calculateDrops(
                    currentBoard,
                    matches
                )

                // 매칭 + 드롭 애니메이션 (하나로 연결, 끊김 없음)
                await animateMatchAndDrop(matches, drops, boardWithHoles)

                // 애니메이션 완료 후 보드 업데이트
                currentBoard = newBoard
                actions.setBoard(currentBoard)
                actions.addScore(matchScore)

                matches = findAllMatches(currentBoard)
            }

            onScoreChange?.(state.score + totalScore)
            actions.setProcessing(false)
        },
        [
            state,
            disabled,
            actions,
            animateSwap,
            animateMatchAndDrop,
            onScoreChange,
        ]
    )

    // 포인터 이벤트 핸들러
    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (disabled || state.isProcessing) return
            e.preventDefault()

            const canvas = canvasRef.current
            if (!canvas) return

            const pos = getGridPosition(canvas, e.clientX, e.clientY)
            if (!pos) return

            actions.startDrag(pos)
            ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
        },
        [disabled, state.isProcessing, actions]
    )

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (
                !state.isDragging ||
                !state.dragStart ||
                disabled ||
                state.isProcessing
            )
                return

            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height

            const currentX = (e.clientX - rect.left) * scaleX
            const currentY = (e.clientY - rect.top) * scaleY

            const startX = state.dragStart.col * CELL_SIZE + CELL_SIZE / 2
            const startY = state.dragStart.row * CELL_SIZE + CELL_SIZE / 2

            const maxOffset = CELL_SIZE * 0.8
            const offsetX = Math.max(
                -maxOffset,
                Math.min(maxOffset, currentX - startX)
            )
            const offsetY = Math.max(
                -maxOffset,
                Math.min(maxOffset, currentY - startY)
            )

            actions.updateDrag({ x: offsetX, y: offsetY })

            // 임계값 초과 시 스왑
            const threshold = CELL_SIZE * 0.5
            if (
                Math.abs(offsetX) > threshold ||
                Math.abs(offsetY) > threshold
            ) {
                const targetPos: Position =
                    Math.abs(offsetX) > Math.abs(offsetY)
                        ? {
                              row: state.dragStart.row,
                              col: state.dragStart.col + (offsetX > 0 ? 1 : -1),
                          }
                        : {
                              row: state.dragStart.row + (offsetY > 0 ? 1 : -1),
                              col: state.dragStart.col,
                          }

                if (
                    targetPos.row >= 0 &&
                    targetPos.row < BOARD_SIZE &&
                    targetPos.col >= 0 &&
                    targetPos.col < BOARD_SIZE
                ) {
                    actions.endDrag()
                    handleMove(state.dragStart, targetPos)
                }
            }
        },
        [state, disabled, actions, handleMove]
    )

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            if (state.isProcessing) return
            ;(e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId)
            actions.endDrag()
        },
        [state.isProcessing, actions]
    )

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (state.isProcessing || state.isDragging) return

            const canvas = canvasRef.current
            if (!canvas) return

            const pos = getGridPosition(canvas, e.clientX, e.clientY)
            if (!pos) return

            if (state.selectedPos) {
                if (
                    pos.row !== state.selectedPos.row ||
                    pos.col !== state.selectedPos.col
                ) {
                    handleMove(state.selectedPos, pos)
                } else {
                    actions.select(null)
                }
            } else {
                actions.select(pos)
            }
        },
        [state, actions, handleMove]
    )

    // 게임 리셋
    const resetGame = useCallback(() => {
        actions.reset()
        resetAnimation()
        onScoreChange?.(0)
    }, [actions, resetAnimation, onScoreChange])

    return (
        <div className='flex flex-col items-center gap-4'>
            <div className='text-2xl font-bold text-white'>
                점수: <span className='text-yellow-400'>{state.score}</span>
            </div>

            <canvas
                ref={canvasRef}
                width={BOARD_PX}
                height={BOARD_PX}
                className='cursor-pointer touch-none rounded-xl shadow-2xl select-none'
                style={{
                    background: '#1a1a2e',
                    maxWidth: '100%',
                    height: 'auto',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleClick}
            />

            <button
                onClick={resetGame}
                disabled={state.isProcessing}
                className='rounded-xl bg-linear-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50'>
                다시 시작
            </button>
        </div>
    )
}
