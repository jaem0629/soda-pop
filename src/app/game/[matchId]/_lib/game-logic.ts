export type PieceType = 0 | 1 | 2 | 3 | 4 | 5
export type Board = PieceType[][]
export type Position = { row: number; col: number }
export type GameState = {
  board: Board
  score: number
  combo: number
  isAnimating: boolean
}

export const BOARD_SIZE = 8
export const PIECE_TYPES: PieceType[] = [0, 1, 2, 3, 4, 5]
export const BASE_SCORE = 10
export const GAME_DURATION = 60

export const PIECE_COLORS = [
  '#FF4757', // red
  '#2ED573', // green
  '#3742FA', // blue
  '#FFA502', // orange
  '#A55EEA', // purple
  '#FF6B81', // pink
]

export const PIECE_SHAPES = ['●', '◆', '★', '▲', '■', '♥']

export function createInitialGameState(): GameState {
  return {
    board: createBoard(),
    score: 0,
    combo: 0,
    isAnimating: false,
  }
}

export function createBoard(): Board {
  let board: Board
  do {
    board = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => getRandomPiece()),
    )
  } while (findAllMatches(board).length > 0)
  return board
}

export function getRandomPiece(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
}

export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row)
  const colDiff = Math.abs(pos1.col - pos2.col)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

export function swapPieces(
  board: Board,
  pos1: Position,
  pos2: Position,
): Board {
  const newBoard = board.map((row) => [...row])
  const temp = newBoard[pos1.row][pos1.col]
  newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col]
  newBoard[pos2.row][pos2.col] = temp
  return newBoard
}

export function findAllMatches(board: Board): Position[][] {
  const matches: Position[][] = []
  const visited = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => false),
  )

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      if (visited[row][col]) continue

      const piece = board[row][col]
      const match: Position[] = [{ row, col }]

      let nextCol = col + 1
      while (nextCol < BOARD_SIZE && board[row][nextCol] === piece) {
        match.push({ row, col: nextCol })
        nextCol++
      }

      if (match.length >= 3) {
        match.forEach((pos) => (visited[pos.row][pos.col] = true))
        matches.push(match)
      }
    }
  }

  const visitedVertical = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => false),
  )

  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      if (visitedVertical[row][col]) continue

      const piece = board[row][col]
      const match: Position[] = [{ row, col }]

      let nextRow = row + 1
      while (nextRow < BOARD_SIZE && board[nextRow][col] === piece) {
        match.push({ row: nextRow, col })
        nextRow++
      }

      if (match.length >= 3) {
        match.forEach((pos) => (visitedVertical[pos.row][pos.col] = true))
        matches.push(match)
      }
    }
  }

  return matches
}

export function calculateScore(matches: Position[][], combo: number): number {
  let score = 0

  for (const match of matches) {
    let matchScore = match.length * BASE_SCORE

    if (match.length === 4) {
      matchScore *= 2
    } else if (match.length >= 5) {
      matchScore *= 3
    }

    score += matchScore
  }

  if (combo > 0) {
    score = Math.floor(score * (1 + combo * 0.5))
  }

  return score
}

export type DropInfo = {
  col: number
  fromRow: number
  toRow: number
  piece: PieceType
}

export function calculateDrops(
  board: Board,
  matches: Position[][],
): {
  newBoard: Board
  drops: DropInfo[]
  boardWithHoles: (PieceType | null)[][]
} {
  const boardWithHoles: (PieceType | null)[][] = board.map((row) => [...row])
  for (const match of matches) {
    for (const pos of match) {
      boardWithHoles[pos.row][pos.col] = null
    }
  }

  const drops: DropInfo[] = []
  const newBoard: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0 as PieceType),
  )

  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeRow = BOARD_SIZE - 1

    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (boardWithHoles[row][col] !== null) {
        const piece = boardWithHoles[row][col] as PieceType
        newBoard[writeRow][col] = piece

        if (row !== writeRow) {
          drops.push({ col, fromRow: row, toRow: writeRow, piece })
        }
        writeRow--
      }
    }

    let newPieceOffset = 0
    for (let row = writeRow; row >= 0; row--) {
      const piece = getRandomPiece()
      newBoard[row][col] = piece
      newPieceOffset++
      drops.push({ col, fromRow: -newPieceOffset, toRow: row, piece })
    }
  }

  return { newBoard, drops, boardWithHoles }
}
