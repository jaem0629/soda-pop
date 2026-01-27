"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import type { Board, Position, GameState } from "@/lib/types";
import {
  BOARD_SIZE,
  PIECE_COLORS,
  PIECE_SHAPES,
  createInitialGameState,
  processMove,
  swapPieces,
  findAllMatches,
} from "@/lib/game-logic";

const CELL_SIZE = 64;
const PADDING = 4;
const BOARD_PX = BOARD_SIZE * CELL_SIZE;

// 애니메이션 상태
type AnimationState = {
  type: "none" | "swap" | "match" | "drop";
  progress: number; // 0 ~ 1
  data?: {
    pos1?: Position;
    pos2?: Position;
    matches?: Position[][];
    dropOffsets?: number[][]; // 각 셀의 Y 오프셋
  };
};

interface GameBoardProps {
  onScoreChange?: (score: number) => void;
  disabled?: boolean;
}

export default function GameBoard({ onScoreChange, disabled = false }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [animation, setAnimation] = useState<AnimationState>({ type: "none", progress: 0 });

  // 퍼즐 조각 그리기
  const drawPiece = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      piece: number,
      x: number,
      y: number,
      size: number,
      scale: number = 1,
      alpha: number = 1
    ) => {
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      const pieceSize = (size - PADDING * 2) * scale;
      const pieceX = centerX - pieceSize / 2;
      const pieceY = centerY - pieceSize / 2;

      ctx.save();
      ctx.globalAlpha = alpha;

      // 그림자
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;

      // 메인 조각 (둥근 사각형)
      ctx.fillStyle = PIECE_COLORS[piece];
      ctx.beginPath();
      ctx.roundRect(pieceX, pieceY, pieceSize, pieceSize, 12);
      ctx.fill();

      // 그림자 리셋
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 광택 효과
      const gradient = ctx.createLinearGradient(pieceX, pieceY, pieceX, pieceY + pieceSize);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.1)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(pieceX, pieceY, pieceSize, pieceSize, 12);
      ctx.fill();

      // 아이콘 (색상 구분 보조)
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = `bold ${pieceSize * 0.45}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(PIECE_SHAPES[piece], centerX, centerY + 2);

      ctx.restore();
    },
    []
  );

  // 보드 그리기
  const drawBoard = useCallback(
    (ctx: CanvasRenderingContext2D, board: Board, selected: Position | null) => {
      // 배경
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);

      // 그리드 배경 (체크 패턴)
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;
          ctx.fillStyle = (row + col) % 2 === 0 ? "#252545" : "#1e1e3a";
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }

      // 선택된 셀 하이라이트
      if (selected) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(
          selected.col * CELL_SIZE,
          selected.row * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.strokeRect(
          selected.col * CELL_SIZE + 2,
          selected.row * CELL_SIZE + 2,
          CELL_SIZE - 4,
          CELL_SIZE - 4
        );
      }

      // 퍼즐 조각 그리기
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const piece = board[row][col];
          let x = col * CELL_SIZE;
          let y = row * CELL_SIZE;
          let scale = 1;
          let alpha = 1;

          // 스왑 애니메이션
          if (animation.type === "swap" && animation.data?.pos1 && animation.data?.pos2) {
            const { pos1, pos2 } = animation.data;
            const progress = easeInOutQuad(animation.progress);

            if (row === pos1.row && col === pos1.col) {
              x += (pos2.col - pos1.col) * CELL_SIZE * progress;
              y += (pos2.row - pos1.row) * CELL_SIZE * progress;
              scale = 1.1;
            } else if (row === pos2.row && col === pos2.col) {
              x += (pos1.col - pos2.col) * CELL_SIZE * progress;
              y += (pos1.row - pos2.row) * CELL_SIZE * progress;
              scale = 1.1;
            }
          }

          // 매칭 애니메이션 (펄스 + 페이드아웃)
          if (animation.type === "match" && animation.data?.matches) {
            const isMatched = animation.data.matches.some((match) =>
              match.some((pos) => pos.row === row && pos.col === col)
            );
            if (isMatched) {
              scale = 1 + Math.sin(animation.progress * Math.PI * 3) * 0.2;
              alpha = 1 - animation.progress;
            }
          }

          // 드래그 중인 조각
          if (
            isDragging &&
            dragStart &&
            row === dragStart.row &&
            col === dragStart.col
          ) {
            x += dragOffset.x;
            y += dragOffset.y;
            scale = 1.15;
          }

          drawPiece(ctx, piece, x, y, CELL_SIZE, scale, alpha);
        }
      }
    },
    [animation, isDragging, dragStart, dragOffset, drawPiece]
  );

  // 이징 함수
  function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Canvas 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawBoard(ctx, gameState.board, selectedPos);
  }, [gameState.board, selectedPos, drawBoard, animation, dragOffset]);

  // 좌표 → 그리드 위치 변환
  const getGridPosition = (clientX: number, clientY: number): Position | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
      return { row, col };
    }
    return null;
  };

  // 애니메이션 실행
  const runAnimation = (
    type: AnimationState["type"],
    duration: number,
    data?: AnimationState["data"]
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setAnimation({ type, progress, data });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimation({ type: "none", progress: 0 });
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  // 이동 처리 (애니메이션 포함)
  const handleMove = useCallback(
    async (pos1: Position, pos2: Position) => {
      if (disabled || gameState.isAnimating) return;

      // 인접하지 않으면 무효
      const rowDiff = Math.abs(pos1.row - pos2.row);
      const colDiff = Math.abs(pos1.col - pos2.col);
      if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
        setSelectedPos(null);
        return;
      }

      setGameState((prev) => ({ ...prev, isAnimating: true }));

      // 1. 스왑 애니메이션
      await runAnimation("swap", 200, { pos1, pos2 });

      // 2. 스왑 적용
      let currentBoard = swapPieces(gameState.board, pos1, pos2);
      let matches = findAllMatches(currentBoard);

      // 매칭 없으면 되돌리기
      if (matches.length === 0) {
        await runAnimation("swap", 200, { pos1: pos2, pos2: pos1 });
        setGameState((prev) => ({ ...prev, isAnimating: false }));
        setSelectedPos(null);
        return;
      }

      // 3. 연쇄 처리
      let totalScore = 0;
      let combo = 0;

      while (matches.length > 0) {
        setGameState((prev) => ({ ...prev, board: currentBoard }));

        // 매칭 애니메이션
        await runAnimation("match", 300, { matches });

        // 점수 계산
        for (const match of matches) {
          let matchScore = match.length * 10;
          if (match.length === 4) matchScore *= 2;
          else if (match.length >= 5) matchScore *= 3;
          if (combo > 0) matchScore = Math.floor(matchScore * (1 + combo * 0.5));
          totalScore += matchScore;
        }
        combo++;

        // 매칭 제거 + 드롭
        const result = processMove(gameState.board, pos1, pos2);
        currentBoard = result.newBoard;

        setGameState((prev) => ({
          ...prev,
          board: currentBoard,
          score: prev.score + totalScore,
        }));

        matches = findAllMatches(currentBoard);
      }

      onScoreChange?.(gameState.score + totalScore);
      setGameState((prev) => ({ ...prev, isAnimating: false }));
      setSelectedPos(null);
    },
    [gameState, disabled, onScoreChange]
  );

  // 마우스/터치 이벤트
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || gameState.isAnimating) return;
    e.preventDefault();

    const pos = getGridPosition(e.clientX, e.clientY);
    if (!pos) return;

    setIsDragging(true);
    setDragStart(pos);
    setDragOffset({ x: 0, y: 0 });
    setSelectedPos(pos);

    // 포인터 캡처 (드래그가 canvas 밖으로 나가도 추적)
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart || disabled || gameState.isAnimating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    const startX = dragStart.col * CELL_SIZE + CELL_SIZE / 2;
    const startY = dragStart.row * CELL_SIZE + CELL_SIZE / 2;

    let offsetX = currentX - startX;
    let offsetY = currentY - startY;

    // 드래그 제한 (한 칸 이내)
    const maxOffset = CELL_SIZE * 0.8;
    offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
    offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));

    setDragOffset({ x: offsetX, y: offsetY });

    // 임계값 넘으면 스왑
    const threshold = CELL_SIZE * 0.5;
    if (Math.abs(offsetX) > threshold || Math.abs(offsetY) > threshold) {
      let targetPos: Position;

      if (Math.abs(offsetX) > Math.abs(offsetY)) {
        // 가로 이동
        targetPos = {
          row: dragStart.row,
          col: dragStart.col + (offsetX > 0 ? 1 : -1),
        };
      } else {
        // 세로 이동
        targetPos = {
          row: dragStart.row + (offsetY > 0 ? 1 : -1),
          col: dragStart.col,
        };
      }

      // 범위 체크
      if (
        targetPos.row >= 0 &&
        targetPos.row < BOARD_SIZE &&
        targetPos.col >= 0 &&
        targetPos.col < BOARD_SIZE
      ) {
        setIsDragging(false);
        setDragStart(null);
        setDragOffset({ x: 0, y: 0 });
        handleMove(dragStart, targetPos);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (gameState.isAnimating) return;

    (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);

    if (isDragging && dragStart) {
      // 드래그 취소 (충분히 이동 안함)
      setDragOffset({ x: 0, y: 0 });
    }

    setIsDragging(false);
    setDragStart(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (gameState.isAnimating || isDragging) return;

    const pos = getGridPosition(e.clientX, e.clientY);
    if (!pos) return;

    if (selectedPos) {
      if (pos.row !== selectedPos.row || pos.col !== selectedPos.col) {
        handleMove(selectedPos, pos);
      } else {
        setSelectedPos(null);
      }
    } else {
      setSelectedPos(pos);
    }
  };

  // 게임 리셋
  const resetGame = () => {
    setGameState(createInitialGameState());
    setSelectedPos(null);
    setAnimation({ type: "none", progress: 0 });
    onScoreChange?.(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-bold text-white">
        점수: <span className="text-yellow-400">{gameState.score}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={BOARD_PX}
        height={BOARD_PX}
        className="rounded-xl shadow-2xl cursor-pointer touch-none select-none"
        style={{
          background: "#1a1a2e",
          maxWidth: "100%",
          height: "auto",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      />

      <button
        onClick={resetGame}
        disabled={gameState.isAnimating}
        className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 shadow-lg"
      >
        다시 시작
      </button>
    </div>
  );
}
