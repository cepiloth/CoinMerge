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
 * 게임 화면 위에 오버레이되는 UI.
 * 상단 헤더(스코어/최고기록), 다음 동전 미리보기, 게임 오버 모달.
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
    <div className="relative inline-block">
      {children}

      {/* 오버레이 UI — 터치/클릭은 게임으로 통과 */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* 상단 헤더: 스코어 + 최고 기록 */}
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-baseline gap-4 rounded-2xl bg-white/95 px-4 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div>
              <span className="text-xs text-[#8B95A1] font-medium">현재 스코어</span>
              <p className="text-xl font-bold text-[#191F28] tabular-nums tracking-tight">
                {score.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-8 bg-[#E5E8EB]" aria-hidden />
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#3182F6]" aria-hidden />
              <div>
                <span className="text-xs text-[#8B95A1] font-medium">최고 기록</span>
                <p className="text-xl font-bold text-[#191F28] tabular-nums tracking-tight">
                  {bestScore.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* 다음 동전 미리보기 */}
          <div className="rounded-2xl bg-white/95 px-3 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center gap-2">
            <span className="text-xs text-[#8B95A1] font-medium whitespace-nowrap">다음</span>
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-[#E5E8EB] shadow-inner"
              style={{ backgroundColor: nextCoin.color }}
              title={nextCoin.label}
              aria-label={`다음 동전: ${nextCoin.label}`}
            />
            <span className="text-sm font-semibold text-[#191F28] tabular-nums">
              {nextCoin.label}
            </span>
          </div>
        </header>
      </div>

      {/* 게임 오버 모달 — 클릭 가능 */}
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
  )
}

export default GameUI
