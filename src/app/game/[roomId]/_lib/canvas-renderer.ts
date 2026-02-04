import { easing, type AnimationState } from './animation'
import type { Board, Position } from './game-logic'
import { BOARD_SIZE, PIECE_COLORS, PIECE_SHAPES } from './game-logic'

export const CELL_SIZE = 64
export const PADDING = 4
export const BOARD_PX = BOARD_SIZE * CELL_SIZE

export type RenderState = {
  board: Board
  selectedPos: Position | null
  animation: AnimationState
  isDragging: boolean
  dragStart: Position | null
  dragOffset: { x: number; y: number }
}

export function drawPiece(
  ctx: CanvasRenderingContext2D,
  piece: number,
  x: number,
  y: number,
  size: number,
  scale: number = 1,
  alpha: number = 1,
): void {
  const centerX = x + size / 2
  const centerY = y + size / 2
  const pieceSize = (size - PADDING * 2) * scale
  const pieceX = centerX - pieceSize / 2
  const pieceY = centerY - pieceSize / 2

  ctx.save()
  ctx.globalAlpha = alpha

  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 4

  ctx.fillStyle = PIECE_COLORS[piece]
  ctx.beginPath()
  ctx.roundRect(pieceX, pieceY, pieceSize, pieceSize, 12)
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  const gradient = ctx.createLinearGradient(
    pieceX,
    pieceY,
    pieceX,
    pieceY + pieceSize,
  )
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.1)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(pieceX, pieceY, pieceSize, pieceSize, 12)
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = `bold ${pieceSize * 0.45}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(PIECE_SHAPES[piece], centerX, centerY + 2)

  ctx.restore()
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, BOARD_PX, BOARD_PX)

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const x = col * CELL_SIZE
      const y = row * CELL_SIZE
      ctx.fillStyle = (row + col) % 2 === 0 ? '#252545' : '#1e1e3a'
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
    }
  }
}

function drawSelection(ctx: CanvasRenderingContext2D, pos: Position): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.fillRect(pos.col * CELL_SIZE, pos.row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 3
  ctx.strokeRect(
    pos.col * CELL_SIZE + 2,
    pos.row * CELL_SIZE + 2,
    CELL_SIZE - 4,
    CELL_SIZE - 4,
  )
}

function renderMatchAndDropAnimation(
  ctx: CanvasRenderingContext2D,
  board: Board,
  animation: AnimationState & { type: 'match-and-drop' },
): void {
  const { phase, progress, matches, drops, baseBoard } = animation

  if (phase === 'match') {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col]
        const x = col * CELL_SIZE
        const y = row * CELL_SIZE
        let scale = 1
        let alpha = 1

        const isMatched = matches.some((match) =>
          match.some((pos) => pos.row === row && pos.col === col),
        )

        if (isMatched) {
          scale = 1 + Math.sin(progress * Math.PI) * 0.2
          alpha = 1 - easing.outQuad(progress)
        }

        if (alpha > 0.01) {
          drawPiece(ctx, piece, x, y, CELL_SIZE, scale, alpha)
        }
      }
    }
  } else {
    const dropProgress = easing.outBounce(progress)

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = baseBoard[row][col]
        if (piece === null) continue

        const isDropping = drops.some((d) => d.col === col && d.toRow === row)
        if (isDropping) continue

        drawPiece(ctx, piece, col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE)
      }
    }

    for (const drop of drops) {
      const startY = drop.fromRow * CELL_SIZE
      const endY = drop.toRow * CELL_SIZE
      const currentY = startY + (endY - startY) * dropProgress
      const scaleEffect = 1 + Math.sin(dropProgress * Math.PI) * 0.1

      drawPiece(
        ctx,
        drop.piece,
        drop.col * CELL_SIZE,
        currentY,
        CELL_SIZE,
        scaleEffect,
      )
    }
  }
}

function renderSwapAnimation(
  ctx: CanvasRenderingContext2D,
  board: Board,
  animation: AnimationState & { type: 'swap' },
): void {
  const { pos1, pos2, progress } = animation
  const easedProgress = easing.inOutQuad(progress)

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      let x = col * CELL_SIZE
      let y = row * CELL_SIZE
      let scale = 1

      if (row === pos1.row && col === pos1.col) {
        x += (pos2.col - pos1.col) * CELL_SIZE * easedProgress
        y += (pos2.row - pos1.row) * CELL_SIZE * easedProgress
        scale = 1.1
      } else if (row === pos2.row && col === pos2.col) {
        x += (pos1.col - pos2.col) * CELL_SIZE * easedProgress
        y += (pos1.row - pos2.row) * CELL_SIZE * easedProgress
        scale = 1.1
      }

      drawPiece(ctx, piece, x, y, CELL_SIZE, scale)
    }
  }
}

function renderNormalState(
  ctx: CanvasRenderingContext2D,
  board: Board,
  state: RenderState,
): void {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      let x = col * CELL_SIZE
      let y = row * CELL_SIZE
      let scale = 1

      if (
        state.isDragging &&
        state.dragStart &&
        row === state.dragStart.row &&
        col === state.dragStart.col
      ) {
        x += state.dragOffset.x
        y += state.dragOffset.y
        scale = 1.15
      }

      drawPiece(ctx, piece, x, y, CELL_SIZE, scale)
    }
  }
}

export function renderBoard(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
): void {
  drawBackground(ctx)

  if (state.selectedPos && state.animation.type === 'none') {
    drawSelection(ctx, state.selectedPos)
  }

  switch (state.animation.type) {
    case 'match-and-drop':
      renderMatchAndDropAnimation(ctx, state.board, state.animation)
      break
    case 'swap':
      renderSwapAnimation(ctx, state.board, state.animation)
      break
    default:
      renderNormalState(ctx, state.board, state)
      break
  }
}

export function getGridPosition(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): Position | null {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const x = (clientX - rect.left) * scaleX
  const y = (clientY - rect.top) * scaleY

  const col = Math.floor(x / CELL_SIZE)
  const row = Math.floor(y / CELL_SIZE)

  if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    return { row, col }
  }
  return null
}
