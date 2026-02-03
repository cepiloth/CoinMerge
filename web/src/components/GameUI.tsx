import React from 'react'
import { Trophy, RotateCcw } from 'lucide-react'
import type { ICurrencyStage } from '../constants/currency'

/**
 * GameUI의 props 인터페이스
 */
interface IGameUIProps {
  /** 현재 스코어 */
  score: number
  /** 최고 기록 */
  bestScore: number
  /** 다음에 나올 동전 단계 (미리보기용) */
  nextCoin: ICurrencyStage
  /** 게임 오버 여부 */
  gameOver: boolean
  /** 재시작 버튼 클릭 시 콜백 */
  onRestart: () => void
  /** 자식(게임 캔버스 등)을 감쌀 때 사용 */
  children?: React.ReactNode
}

/**
 * 상단 헤더(스코어/최고기록, 다음 동전) + 그 아래 게임보드 영역.
 * 헤더와 게임보드는 세로로 쌓여 겹치지 않음.
 */
const GameUI: React.FC<IGameUIProps> = ({
  score,
  bestScore,
  nextCoin,
  gameOver,
  onRestart,
  children,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* 최상단: 스코어 + 다음 블록 (게임보드와 분리) */}
      <header className="flex-shrink-0 w-full flex items-start justify-between px-3 pt-3 pb-2">
        <div className="flex-1 flex justify-center min-w-0">
          <div className="rounded-2xl bg-white/95 px-5 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-center">
            <p
              className="text-2xl font-bold text-[#191F28] tabular-nums tracking-tight drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"
              aria-label={`현재 스코어 ${score.toLocaleString()}`}
            >
              {score.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <Trophy className="w-4 h-4 text-[#D4A017]" aria-hidden />
              <p className="text-sm font-semibold text-[#B8860B] tabular-nums">
                {bestScore.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 rounded-2xl bg-white/95 pl-2 pr-3 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-[#E5E8EB] shadow-inner"
            style={{ backgroundColor: nextCoin.color }}
            title={nextCoin.label}
            aria-label={`다음 동전: ${nextCoin.label}`}
          />
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-semibold text-[#8B95A1] uppercase tracking-wide">
              다음
            </span>
            <span className="text-sm font-semibold text-[#191F28] tabular-nums leading-tight">
              {nextCoin.label}
            </span>
          </div>
        </div>
      </header>

      {/* 게임보드 영역 (헤더 바로 아래) */}
      <div className="relative flex-shrink-0">
        {children}
        {gameOver && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-[#191F28]/50 rounded-2xl pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-over-title"
          >
            <div
              className="mx-4 w-full max-w-[320px] rounded-2xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="game-over-title"
                className="text-xl font-bold text-[#191F28] mb-1"
              >
                게임 오버
              </h2>
              <p className="text-sm text-[#8B95A1] mb-4">
                최종 스코어 <span className="font-semibold text-[#191F28] tabular-nums">{score.toLocaleString()}</span>점
              </p>
              <button
                type="button"
                onClick={onRestart}
                className="w-full rounded-xl bg-[#3182F6] text-white font-semibold py-3.5 px-4 flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(49,130,246,0.35)] hover:bg-[#1B64DA] active:scale-[0.98] transition-colors transition-transform"
              >
                <RotateCcw className="w-5 h-5" aria-hidden />
                다시 하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameUI
