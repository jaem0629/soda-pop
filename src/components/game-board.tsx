'use client'

import { useRef, useEffect, useReducer, useState } from 'react'
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
    calculateDrops,
    isAdjacent,
    createInitialGameState,
    type Position,
    type Board,
    type PieceType,
    type DropInfo,
} from '@/lib/game-logic'
import { ANIMATION_DURATION, type AnimationState } from '@/lib/animation'

// ================================================
// 타입 정의
// ================================================

interface GameBoardProps {
    onScoreChange?: (score: number) => void
    disabled?: boolean
    initialScore?: number
}

// 게임 상태
type GameState = {
    board: Board
    score: number
    selectedPos: Position | null
    isDragging: boolean
    dragStart: Position | null
    dragOffset: { x: number; y: number }
    isProcessing: boolean
}

// 액션 타입
type GameAction =
    | { type: 'RESET'; initialScore: number }
    | { type: 'SET_BOARD'; board: Board }
    | { type: 'ADD_SCORE'; score: number }
    | { type: 'SELECT'; pos: Position | null }
    | { type: 'START_DRAG'; pos: Position }
    | { type: 'UPDATE_DRAG'; offset: { x: number; y: number } }
    | { type: 'END_DRAG' }
    | { type: 'SET_PROCESSING'; isProcessing: boolean }

// ================================================
// 리듀서
// ================================================

const createInitialState = (initialScore: number = 0): GameState => ({
    ...createInitialGameState(),
    score: initialScore,
    selectedPos: null,
    isDragging: false,
    dragStart: null,
    dragOffset: { x: 0, y: 0 },
    isProcessing: false,
})

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'RESET':
            return createInitialState(action.initialScore)
        case 'SET_BOARD':
            return { ...state, board: action.board }
        case 'ADD_SCORE':
            return { ...state, score: state.score + action.score }
        case 'SELECT':
            return { ...state, selectedPos: action.pos }
        case 'START_DRAG':
            return {
                ...state,
                isDragging: true,
                dragStart: action.pos,
                dragOffset: { x: 0, y: 0 },
                selectedPos: action.pos,
            }
        case 'UPDATE_DRAG':
            return { ...state, dragOffset: action.offset }
        case 'END_DRAG':
            return {
                ...state,
                isDragging: false,
                dragStart: null,
                dragOffset: { x: 0, y: 0 },
            }
        case 'SET_PROCESSING':
            return { ...state, isProcessing: action.isProcessing }
        default:
            return state
    }
}

// ================================================
// 컴포넌트
// ================================================

export default function GameBoard({
    onScoreChange,
    disabled = false,
    initialScore = 0,
}: GameBoardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // 게임 상태
    const [state, dispatch] = useReducer(
        gameReducer,
        initialScore,
        createInitialState
    )

    // 애니메이션 상태
    const [animation, setAnimation] = useState<AnimationState>({ type: 'none' })

    // ================================================
    // 애니메이션 함수
    // ================================================

    const animateSwap = (pos1: Position, pos2: Position): Promise<void> => {
        return new Promise((resolve) => {
            const startTime = performance.now()

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime
                const progress = Math.min(elapsed / ANIMATION_DURATION.swap, 1)

                setAnimation({ type: 'swap', progress, pos1, pos2 })

                if (progress < 1) {
                    requestAnimationFrame(animate)
                } else {
                    setAnimation({ type: 'none' })
                    resolve()
                }
            }

            requestAnimationFrame(animate)
        })
    }

    const animateMatchAndDrop = (
        matches: Position[][],
        drops: DropInfo[],
        baseBoard: (PieceType | null)[][]
    ): Promise<void> => {
        return new Promise((resolve) => {
            const matchDuration = ANIMATION_DURATION.match
            const dropDuration = ANIMATION_DURATION.drop
            const totalDuration = matchDuration + dropDuration
            const startTime = performance.now()

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime

                if (elapsed < matchDuration) {
                    const progress = elapsed / matchDuration
                    setAnimation({
                        type: 'match-and-drop',
                        phase: 'match',
                        progress,
                        matches,
                        drops,
                        baseBoard,
                    })
                    requestAnimationFrame(animate)
                } else if (elapsed < totalDuration) {
                    const progress = (elapsed - matchDuration) / dropDuration
                    setAnimation({
                        type: 'match-and-drop',
                        phase: 'drop',
                        progress,
                        matches,
                        drops,
                        baseBoard,
                    })
                    requestAnimationFrame(animate)
                } else {
                    setAnimation({ type: 'none' })
                    resolve()
                }
            }

            requestAnimationFrame(animate)
        })
    }

    // ================================================
    // Canvas 렌더링
    // ================================================

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

    // ================================================
    // 이동 처리
    // ================================================

    const handleMove = async (pos1: Position, pos2: Position) => {
        if (disabled || state.isProcessing) return

        if (!isAdjacent(pos1, pos2)) {
            dispatch({ type: 'SELECT', pos: null })
            return
        }

        dispatch({ type: 'SET_PROCESSING', isProcessing: true })
        dispatch({ type: 'SELECT', pos: null })

        // 스왑 애니메이션
        await animateSwap(pos1, pos2)

        // 스왑 적용
        let currentBoard = swapPieces(state.board, pos1, pos2)
        dispatch({ type: 'SET_BOARD', board: currentBoard })

        let matches = findAllMatches(currentBoard)

        // 매칭 없으면 되돌리기
        if (matches.length === 0) {
            await animateSwap(pos2, pos1)
            dispatch({ type: 'SET_BOARD', board: state.board })
            dispatch({ type: 'SET_PROCESSING', isProcessing: false })
            return
        }

        // 연쇄 처리
        let totalScore = 0
        let combo = 0

        while (matches.length > 0) {
            const matchScore = calculateScore(matches, combo)
            totalScore += matchScore
            combo++

            const { newBoard, drops, boardWithHoles } = calculateDrops(
                currentBoard,
                matches
            )

            await animateMatchAndDrop(matches, drops, boardWithHoles)

            currentBoard = newBoard
            dispatch({ type: 'SET_BOARD', board: currentBoard })
            dispatch({ type: 'ADD_SCORE', score: matchScore })

            matches = findAllMatches(currentBoard)
        }

        const newScore = state.score + totalScore
        onScoreChange?.(newScore)
        dispatch({ type: 'SET_PROCESSING', isProcessing: false })
    }

    // ================================================
    // 포인터 이벤트
    // ================================================

    const handlePointerDown = (e: React.PointerEvent) => {
        if (disabled || state.isProcessing) return
        e.preventDefault()

        const canvas = canvasRef.current
        if (!canvas) return

        const pos = getGridPosition(canvas, e.clientX, e.clientY)
        if (!pos) return

        dispatch({ type: 'START_DRAG', pos })
        ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
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

        dispatch({ type: 'UPDATE_DRAG', offset: { x: offsetX, y: offsetY } })

        // 임계값 초과 시 스왑
        const threshold = CELL_SIZE * 0.5
        if (Math.abs(offsetX) > threshold || Math.abs(offsetY) > threshold) {
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
                dispatch({ type: 'END_DRAG' })
                handleMove(state.dragStart, targetPos)
            }
        }
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        if (state.isProcessing) return
        ;(e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId)
        dispatch({ type: 'END_DRAG' })
    }

    const handleClick = (e: React.MouseEvent) => {
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
                dispatch({ type: 'SELECT', pos: null })
            }
        } else {
            dispatch({ type: 'SELECT', pos })
        }
    }

    // ================================================
    // 렌더링
    // ================================================

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
        </div>
    )
}
