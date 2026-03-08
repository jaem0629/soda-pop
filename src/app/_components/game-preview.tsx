'use client'

import { useEffect, useRef } from 'react'
import {
  type Board,
  type Position,
  BOARD_SIZE,
  createBoard,
  findAllMatches,
  swapPieces,
  calculateDrops,
} from '@/app/game/[matchId]/_lib/game-logic'
import {
  BOARD_PX,
  type RenderState,
  renderBoard,
} from '@/app/game/[matchId]/_lib/canvas-renderer'
import { ANIMATION_DURATION } from '@/app/game/[matchId]/_lib/animation'
import type { AnimationState } from '@/app/game/[matchId]/_lib/animation'

function findValidSwap(board: Board): [Position, Position] | null {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const neighbors: Position[] = []
      if (col + 1 < BOARD_SIZE) neighbors.push({ row, col: col + 1 })
      if (row + 1 < BOARD_SIZE) neighbors.push({ row: row + 1, col })

      for (const neighbor of neighbors) {
        const swapped = swapPieces(board, { row, col }, neighbor)
        if (findAllMatches(swapped).length > 0) {
          return [{ row, col }, neighbor]
        }
      }
    }
  }
  return null
}

export function GamePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let board = createBoard()
    let animation: AnimationState = { type: 'none' }
    let rafId = 0
    let timerId: ReturnType<typeof setTimeout>
    let disposed = false

    function render() {
      const state: RenderState = {
        board,
        selectedPos: null,
        animation,
        isDragging: false,
        dragStart: null,
        dragOffset: { x: 0, y: 0 },
      }
      renderBoard(ctx!, state)
    }

    function animate(
      duration: number,
      onFrame: (progress: number) => void,
      onDone: () => void,
    ) {
      const start = performance.now()
      const tick = (now: number) => {
        if (disposed) return
        const progress = Math.min((now - start) / duration, 1)
        onFrame(progress)
        render()
        if (progress < 1) {
          rafId = requestAnimationFrame(tick)
        } else {
          onDone()
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    function processMatches(currentBoard: Board) {
      if (disposed) return
      const matches = findAllMatches(currentBoard)
      if (matches.length === 0) {
        timerId = setTimeout(runCycle, 1200)
        return
      }

      const { newBoard, drops, boardWithHoles } = calculateDrops(
        currentBoard,
        matches,
      )

      animate(
        ANIMATION_DURATION.match,
        (progress) => {
          animation = {
            type: 'match-and-drop',
            phase: 'match',
            progress,
            matches,
            drops,
            baseBoard: boardWithHoles,
          }
        },
        () => {
          animate(
            ANIMATION_DURATION.drop,
            (progress) => {
              animation = {
                type: 'match-and-drop',
                phase: 'drop',
                progress,
                matches,
                drops,
                baseBoard: boardWithHoles,
              }
            },
            () => {
              board = newBoard
              animation = { type: 'none' }
              render()
              timerId = setTimeout(() => processMatches(newBoard), 300)
            },
          )
        },
      )
    }

    function runCycle() {
      if (disposed) return
      const swap = findValidSwap(board)

      if (!swap) {
        board = createBoard()
        render()
        timerId = setTimeout(runCycle, 500)
        return
      }

      const [pos1, pos2] = swap

      animate(
        ANIMATION_DURATION.swap,
        (progress) => {
          animation = { type: 'swap', progress, pos1, pos2 }
        },
        () => {
          board = swapPieces(board, pos1, pos2)
          animation = { type: 'none' }
          processMatches(board)
        },
      )
    }

    render()
    timerId = setTimeout(runCycle, 1000)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      clearTimeout(timerId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={BOARD_PX}
      height={BOARD_PX}
      className='h-full w-full'
      style={{ imageRendering: 'auto' }}
    />
  )
}
