import { useState, useCallback } from "react";
import type { Position, PieceType } from "@/lib/types";
import type { DropInfo } from "./use-game-reducer";

// 애니메이션 상태 타입
export type AnimationState =
  | { type: "none" }
  | { type: "swap"; progress: number; pos1: Position; pos2: Position }
  | { type: "match"; progress: number; matches: Position[][] }
  | { type: "drop"; progress: number; drops: DropInfo[]; baseBoard: (PieceType | null)[][] };

// 이징 함수들
export const easing = {
  outBounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },

  outQuad: (t: number): number => {
    return 1 - (1 - t) * (1 - t);
  },

  inOutQuad: (t: number): number => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
};

// 애니메이션 duration 상수
export const ANIMATION_DURATION = {
  swap: 200,
  match: 350,
  drop: 400,
} as const;

// 커스텀 훅
export function useGameAnimation() {
  const [animation, setAnimation] = useState<AnimationState>({ type: "none" });

  // 일반적인 애니메이션 실행기
  const runAnimation = useCallback(
    <T extends AnimationState>(
      createState: (progress: number) => T,
      duration: number
    ): Promise<void> => {
      return new Promise((resolve) => {
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          setAnimation(createState(progress));

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setAnimation({ type: "none" });
            resolve();
          }
        };

        requestAnimationFrame(animate);
      });
    },
    []
  );

  // 스왑 애니메이션
  const animateSwap = useCallback(
    (pos1: Position, pos2: Position): Promise<void> => {
      return runAnimation(
        (progress) => ({ type: "swap" as const, progress, pos1, pos2 }),
        ANIMATION_DURATION.swap
      );
    },
    [runAnimation]
  );

  // 매칭 애니메이션
  const animateMatch = useCallback(
    (matches: Position[][]): Promise<void> => {
      return runAnimation(
        (progress) => ({ type: "match" as const, progress, matches }),
        ANIMATION_DURATION.match
      );
    },
    [runAnimation]
  );

  // 드롭 애니메이션
  const animateDrop = useCallback(
    (drops: DropInfo[], baseBoard: (PieceType | null)[][]): Promise<void> => {
      return runAnimation(
        (progress) => ({ type: "drop" as const, progress, drops, baseBoard }),
        ANIMATION_DURATION.drop
      );
    },
    [runAnimation]
  );

  // 애니메이션 초기화
  const resetAnimation = useCallback(() => {
    setAnimation({ type: "none" });
  }, []);

  return {
    animation,
    animateSwap,
    animateMatch,
    animateDrop,
    resetAnimation,
  };
}
