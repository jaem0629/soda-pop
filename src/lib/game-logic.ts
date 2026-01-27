// 타입 정의
export type PieceType = 0 | 1 | 2 | 3 | 4 | 5
export type Board = PieceType[][]
export type Position = { row: number; col: number }
export type GameState = {
    board: Board
    score: number
    combo: number
    isAnimating: boolean
}

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
export function getRandomPiece(): PieceType {
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

