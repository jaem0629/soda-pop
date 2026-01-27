import type { Board, PieceType, Position, GameState } from './types'

// 게임 상수
export const BOARD_SIZE = 8
export const PIECE_TYPES: PieceType[] = [0, 1, 2, 3, 4, 5] // 6가지 색상
export const BASE_SCORE = 10

// 퍼즐 조각 색상 (더 선명하고 구분되는 색상)
export const PIECE_COLORS = [
    '#FF4757', // 빨강 (토마토)
    '#2ED573', // 초록 (라임)
    '#3742FA', // 파랑 (로얄블루)
    '#FFA502', // 주황 (오렌지)
    '#A55EEA', // 보라 (퍼플)
    '#FF6B81', // 핑크 (로즈)
]

// 퍼즐 조각 아이콘 (색상 구분 보조)
export const PIECE_SHAPES = [
    '●', // 원
    '◆', // 다이아몬드
    '★', // 별
    '▲', // 삼각형
    '■', // 사각형
    '♥', // 하트
]

// 초기 게임 상태 생성
export function createInitialGameState(): GameState {
    return {
        board: createBoard(),
        score: 0,
        combo: 0,
        isAnimating: false,
    }
}

// 보드 생성 (매칭 없는 상태로)
export function createBoard(): Board {
    let board: Board
    do {
        board = Array.from({ length: BOARD_SIZE }, () =>
            Array.from({ length: BOARD_SIZE }, () => getRandomPiece())
        )
    } while (findAllMatches(board).length > 0)
    return board
}

// 랜덤 퍼즐 조각
function getRandomPiece(): PieceType {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
}

// 두 위치가 인접한지 확인
export function isAdjacent(pos1: Position, pos2: Position): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row)
    const colDiff = Math.abs(pos1.col - pos2.col)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

// 두 조각 교환
export function swapPieces(
    board: Board,
    pos1: Position,
    pos2: Position
): Board {
    const newBoard = board.map((row) => [...row])
    const temp = newBoard[pos1.row][pos1.col]
    newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col]
    newBoard[pos2.row][pos2.col] = temp
    return newBoard
}

// 모든 매칭 찾기
export function findAllMatches(board: Board): Position[][] {
    const matches: Position[][] = []
    const visited = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => false)
    )

    // 가로 매칭 찾기
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

    // 세로 매칭 찾기
    const visitedVertical = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => false)
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
                match.forEach(
                    (pos) => (visitedVertical[pos.row][pos.col] = true)
                )
                matches.push(match)
            }
        }
    }

    return matches
}

// 매칭된 조각 제거 (null로 표시)
export function removeMatches(
    board: Board,
    matches: Position[][]
): (PieceType | null)[][] {
    const newBoard: (PieceType | null)[][] = board.map((row) => [...row])

    for (const match of matches) {
        for (const pos of match) {
            newBoard[pos.row][pos.col] = null
        }
    }

    return newBoard
}

// 빈 공간 채우기 (위에서 떨어뜨리기)
export function dropPieces(board: (PieceType | null)[][]): Board {
    const newBoard: Board = board.map((row) => [...row]) as Board

    for (let col = 0; col < BOARD_SIZE; col++) {
        // 아래에서 위로 빈 공간 찾기
        let emptyRow = BOARD_SIZE - 1

        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
            if (newBoard[row][col] !== null) {
                // 조각이 있으면 아래로 이동
                if (row !== emptyRow) {
                    newBoard[emptyRow][col] = newBoard[row][col]
                    newBoard[row][col] = null as unknown as PieceType
                }
                emptyRow--
            }
        }

        // 위쪽 빈 공간에 새 조각 채우기
        for (let row = emptyRow; row >= 0; row--) {
            newBoard[row][col] = getRandomPiece()
        }
    }

    return newBoard
}

// 점수 계산
export function calculateScore(matches: Position[][], combo: number): number {
    let score = 0

    for (const match of matches) {
        let matchScore = match.length * BASE_SCORE

        // 4개 매칭: 2배, 5개 이상: 3배
        if (match.length === 4) {
            matchScore *= 2
        } else if (match.length >= 5) {
            matchScore *= 3
        }

        score += matchScore
    }

    // 콤보 보너스 (1.5배씩 증가)
    if (combo > 0) {
        score = Math.floor(score * (1 + combo * 0.5))
    }

    return score
}

// 스왑 후 전체 처리 (매칭 → 제거 → 드롭 → 반복)
export function processMove(
    board: Board,
    pos1: Position,
    pos2: Position
): { newBoard: Board; totalScore: number; isValidMove: boolean } {
    // 인접하지 않으면 무효
    if (!isAdjacent(pos1, pos2)) {
        return { newBoard: board, totalScore: 0, isValidMove: false }
    }

    // 스왑
    let currentBoard = swapPieces(board, pos1, pos2)

    // 매칭 확인
    let matches = findAllMatches(currentBoard)

    // 매칭 없으면 스왑 취소
    if (matches.length === 0) {
        return { newBoard: board, totalScore: 0, isValidMove: false }
    }

    let totalScore = 0
    let combo = 0

    // 연쇄 처리
    while (matches.length > 0) {
        // 점수 계산
        totalScore += calculateScore(matches, combo)
        combo++

        // 매칭 제거
        const boardWithNulls = removeMatches(currentBoard, matches)

        // 드롭 + 새 조각
        currentBoard = dropPieces(boardWithNulls)

        // 새 매칭 확인
        matches = findAllMatches(currentBoard)
    }

    return { newBoard: currentBoard, totalScore, isValidMove: true }
}

// 가능한 이동이 있는지 확인 (힌트용)
export function hasValidMoves(board: Board): boolean {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // 오른쪽과 스왑
            if (col < BOARD_SIZE - 1) {
                const swapped = swapPieces(
                    board,
                    { row, col },
                    { row, col: col + 1 }
                )
                if (findAllMatches(swapped).length > 0) return true
            }
            // 아래와 스왑
            if (row < BOARD_SIZE - 1) {
                const swapped = swapPieces(
                    board,
                    { row, col },
                    { row: row + 1, col }
                )
                if (findAllMatches(swapped).length > 0) return true
            }
        }
    }
    return false
}
