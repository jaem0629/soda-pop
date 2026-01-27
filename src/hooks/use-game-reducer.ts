import { useReducer, useCallback, useRef } from 'react'
import type { Board, Position, GameState, PieceType } from '@/lib/game-logic'
import {
    createInitialGameState,
    getRandomPiece,
    BOARD_SIZE,
} from '@/lib/game-logic'

// 액션 타입
type GameAction =
    | { type: 'RESET'; initialScore: number }
    | { type: 'SET_BOARD'; board: Board }
    | { type: 'ADD_SCORE'; score: number }
    | { type: 'SET_ANIMATING'; isAnimating: boolean }
    | { type: 'SELECT'; pos: Position | null }
    | { type: 'START_DRAG'; pos: Position }
    | { type: 'UPDATE_DRAG'; offset: { x: number; y: number } }
    | { type: 'END_DRAG' }
    | { type: 'SET_PROCESSING'; isProcessing: boolean }

// 확장된 상태
export type ExtendedGameState = GameState & {
    selectedPos: Position | null
    isDragging: boolean
    dragStart: Position | null
    dragOffset: { x: number; y: number }
    isProcessing: boolean
}

// 초기 상태
const createInitialState = (initialScore: number = 0): ExtendedGameState => ({
    ...createInitialGameState(),
    score: initialScore,
    selectedPos: null,
    isDragging: false,
    dragStart: null,
    dragOffset: { x: 0, y: 0 },
    isProcessing: false,
})

// 리듀서
function gameReducer(
    state: ExtendedGameState,
    action: GameAction
): ExtendedGameState {
    switch (action.type) {
        case 'RESET':
            return createInitialState(action.initialScore)

        case 'SET_BOARD':
            return { ...state, board: action.board }

        case 'ADD_SCORE':
            return { ...state, score: state.score + action.score }

        case 'SET_ANIMATING':
            return { ...state, isAnimating: action.isAnimating }

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

// 드롭 정보 타입
export type DropInfo = {
    col: number
    fromRow: number
    toRow: number
    piece: PieceType
}

// 드롭 정보 계산
export function calculateDrops(
    board: Board,
    matches: Position[][]
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
        Array.from({ length: BOARD_SIZE }, () => 0 as PieceType)
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

// 커스텀 훅
export function useGameReducer(initialScore: number = 0) {
    const initialScoreRef = useRef(initialScore)

    const [state, dispatch] = useReducer(gameReducer, initialScore, (score) =>
        createInitialState(score)
    )

    const actions = {
        reset: useCallback(
            () =>
                dispatch({
                    type: 'RESET',
                    initialScore: initialScoreRef.current,
                }),
            []
        ),
        setBoard: useCallback(
            (board: Board) => dispatch({ type: 'SET_BOARD', board }),
            []
        ),
        addScore: useCallback(
            (score: number) => dispatch({ type: 'ADD_SCORE', score }),
            []
        ),
        setAnimating: useCallback(
            (isAnimating: boolean) =>
                dispatch({ type: 'SET_ANIMATING', isAnimating }),
            []
        ),
        select: useCallback(
            (pos: Position | null) => dispatch({ type: 'SELECT', pos }),
            []
        ),
        startDrag: useCallback(
            (pos: Position) => dispatch({ type: 'START_DRAG', pos }),
            []
        ),
        updateDrag: useCallback(
            (offset: { x: number; y: number }) =>
                dispatch({ type: 'UPDATE_DRAG', offset }),
            []
        ),
        endDrag: useCallback(() => dispatch({ type: 'END_DRAG' }), []),
        setProcessing: useCallback(
            (isProcessing: boolean) =>
                dispatch({ type: 'SET_PROCESSING', isProcessing }),
            []
        ),
    }

    return { state, actions }
}
